
const express = require('express');
const { DatabaseSync } = require('node:sqlite');

const app = express();
app.use(express.json());

// ------------------------------------------------------------
// Banco de dados SQLite
// ------------------------------------------------------------

const db = new DatabaseSync('treinos.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS treinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        duracao INTEGER NOT NULL
    )
`);

// ------------------------------------------------------------
// Validação
// ------------------------------------------------------------

function validarTreino(corpo) {
    if (
        !corpo ||
        typeof corpo.nome !== 'string' ||
        corpo.nome.trim() === ''
    ) {
        return 'O campo nome e obrigatorio e deve ser um texto.';
    }

    if (
        typeof corpo.duracao !== 'number' ||
        corpo.duracao <= 0
    ) {
        return 'O campo duracao e obrigatorio e deve ser um numero maior que zero.';
    }

    return null;
}

// ------------------------------------------------------------
// GET /treinos/total
// Retorna a quantidade de treinos
// ------------------------------------------------------------

app.get('/treinos/total', (req, res) => {
    const resultado = db
        .prepare('SELECT COUNT(*) AS total FROM treinos')
        .get();

    res.status(200).json(resultado);
});

// ------------------------------------------------------------
// GET /treinos/resumo
// Retorna total, minutos e média de duração
// ------------------------------------------------------------

app.get('/treinos/resumo', (req, res) => {
    const resumo = db.prepare(`
        SELECT
            COUNT(*) AS total,
            COALESCE(SUM(duracao), 0) AS minutos,
            AVG(duracao) AS media
        FROM treinos
    `).get();

    res.status(200).json(resumo);
});

// ------------------------------------------------------------
// GET /treinos
// Lista, filtra, busca e ordena os treinos
// ------------------------------------------------------------

app.get('/treinos', (req, res) => {
    const { minimo, busca } = req.query;

    let sql = 'SELECT * FROM treinos';
    const condicoes = [];
    const parametros = [];

    if (minimo !== undefined) {
        const valorMinimo = Number(minimo);

        if (minimo.trim() === '' || !Number.isFinite(valorMinimo)) {
            return res.status(400).json({
                erro: 'O filtro minimo deve ser um numero.'
            });
        }

        condicoes.push('duracao >= ?');
        parametros.push(valorMinimo);
    }

    if (busca !== undefined) {
        condicoes.push('nome LIKE ?');
        parametros.push(`%${busca}%`);
    }

    if (condicoes.length > 0) {
        sql += ' WHERE ' + condicoes.join(' AND ');
    }

    sql += ' ORDER BY duracao DESC';

    const treinos = db.prepare(sql).all(...parametros);

    res.status(200).json(treinos);
});

// ------------------------------------------------------------
// GET /treinos/:id
// Busca um treino pelo ID
// ------------------------------------------------------------

app.get('/treinos/:id', (req, res) => {
    const textoId = req.params.id;

    if (!/^\d+$/.test(textoId)) {
        return res.status(400).json({
            erro: 'Id deve ser um numero inteiro.'
        });
    }

    const id = Number(textoId);
    const treino = db
        .prepare('SELECT * FROM treinos WHERE id = ?')
        .get(id);

    if (treino === undefined) {
        return res.status(404).json({
            erro: 'Treino nao encontrado.'
        });
    }

    res.status(200).json(treino);
});

// ------------------------------------------------------------
// POST /treinos
// Cria um treino
// ------------------------------------------------------------

app.post('/treinos', (req, res) => {
    const erro = validarTreino(req.body);

    if (erro !== null) {
        return res.status(400).json({ erro: erro });
    }

    const resultado = db.prepare(`
        INSERT INTO treinos (nome, duracao)
        VALUES (?, ?)
    `).run(req.body.nome, req.body.duracao);

    const novoTreino = db
        .prepare('SELECT * FROM treinos WHERE id = ?')
        .get(Number(resultado.lastInsertRowid));

    res.status(201).json(novoTreino);
});

// ------------------------------------------------------------
// PUT /treinos/:id
// Atualiza um treino
// ------------------------------------------------------------

app.put('/treinos/:id', (req, res) => {
    const textoId = req.params.id;

    if (!/^\d+$/.test(textoId)) {
        return res.status(400).json({
            erro: 'Id deve ser um numero inteiro.'
        });
    }

    const id = Number(textoId);

    const treino = db
        .prepare('SELECT * FROM treinos WHERE id = ?')
        .get(id);

    if (treino === undefined) {
        return res.status(404).json({
            erro: 'Treino nao encontrado.'
        });
    }

    const erro = validarTreino(req.body);

    if (erro !== null) {
        return res.status(400).json({ erro: erro });
    }

    db.prepare(`
        UPDATE treinos
        SET nome = ?, duracao = ?
        WHERE id = ?
    `).run(req.body.nome, req.body.duracao, id);

    const atualizado = db
        .prepare('SELECT * FROM treinos WHERE id = ?')
        .get(id);

    res.status(200).json(atualizado);
});

// ------------------------------------------------------------
// DELETE /treinos/:id
// Remove um treino
// ------------------------------------------------------------

app.delete('/treinos/:id', (req, res) => {
    const textoId = req.params.id;

    if (!/^\d+$/.test(textoId)) {
        return res.status(400).json({
            erro: 'Id deve ser um numero inteiro.'
        });
    }

    const id = Number(textoId);

    const treino = db
        .prepare('SELECT * FROM treinos WHERE id = ?')
        .get(id);

    if (treino === undefined) {
        return res.status(404).json({
            erro: 'Treino nao encontrado.'
        });
    }

    db.prepare('DELETE FROM treinos WHERE id = ?').run(id);

    res.status(204).end();
});

// ------------------------------------------------------------
// Inicialização do servidor
// ------------------------------------------------------------

const PORTA = 3000;

app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
