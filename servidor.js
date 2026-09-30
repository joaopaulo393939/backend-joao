// ============================================================
// API do Diario de Treinos
// Back-End I - CEEP Pedro Boaretto Neto
// ============================================================
// Este arquivo esta quase vazio DE PROPOSITO.
// Hoje voce vai escrever as rotas, uma de cada vez, conferindo
// no testes.http se cada uma responde o status certo.
// O que cada rota deve fazer esta no README.md.
// ============================================================

const express = require('express');
const app = express();

// Faz o Express entender JSON no corpo das requisicoes
app.use(express.json());

// ------------------------------------------------------------
// Os dados moram aqui, na memoria. Somem quando o servidor cai.
// (Na Aula 03 isso vira banco de dados.)
// ------------------------------------------------------------
const treinos = [];
let proximoId = 1;

// ------------------------------------------------------------
// Validacao
// Escreva a funcao validarTreino(corpo), que devolve a mensagem
// de erro quando algo esta errado, ou null quando esta tudo certo.
// ------------------------------------------------------------
app.get('/treinos/total', (req, res) => {
    const total = db.prepare(SELECT COUNT(*) as total FROM treinos).get();
    res.status(200).json(total);

// ------------------------------------------------------------
// GET /treinos - lista todos os treinos
// ------------------------------------------------------------
app.get('/treinos', (req, res) => {
    const minimo = Number(req.query.minimo);
    const busca = req.query.busca;

    let treinos;

    if (req.query.minimo) {
        treinos = db
            .prepare(SELECT * FROM treinos WHERE duracao >= ? ORDER BY duracao DESC)
            .all(minimo);
    } else if (req.query.busca) {
        treinos = db
            .prepare(SELECT * FROM treinos WHERE nome LIKE ? ORDER BY duracao DESC)
            .all(%${busca}%);
    }
    else {
        treinos = db
            .prepare(SELECT * FROM treinos ORDER BY duracao DESC)
            .all();
    }

    res.status(200).json(treinos);
});


// ------------------------------------------------------------
// GET /treinos/:id - busca um treino pelo id (404 se nao existir)
// ------------------------------------------------------------
app.get('/treinos', (req, res) => {
    const minimo = req.query.minimo;

    let sql = 'SELECT * FROM treinos';
    const parametros = [];

    if (minimo !== undefined) {
        sql += ' WHERE duracao >= ?';
        parametros.push(Number(minimo));
    }

    sql += ' ORDER BY duracao DESC';

    const treinos = db
        .prepare(sql)
        .all(...parametros);

    res.status(200).json(treinos);
});

// ------------------------------------------------------------
// PUT /treinos/:id - substitui um treino
// ------------------------------------------------------------
app.get('/treinos', (req, res) => {
    const minimo = req.query.minimo;
    const busca = req.query.busca;

    let sql = 'SELECT * FROM treinos';

    const parametros = [];
    const condicoes = [];

    if (minimo !== undefined) {
        condicoes.push('duracao >= ?');
        parametros.push(Number(minimo));
    }

    if (busca !== undefined) {
        condicoes.push('nome LIKE ?');
        parametros.push(`%${busca}%`);
    }

    if (condicoes.length > 0) {
        sql += ' WHERE ' + condicoes.join(' AND ');
    }

    sql += ' ORDER BY duracao DESC';

    const treinos = db
        .prepare(sql)
        .all(...parametros);

    res.status(200).json(treinos);
});

// ------------------------------------------------------------
// DELETE /treinos/:id - remove um treino
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
        .prepare(`
            SELECT * FROM treinos
            WHERE id = ?
        `)
        .get(id);

    if (treino === undefined) {
        return res.status(404).json({
            erro: 'Treino nao encontrado.'
        });
    }

    res.status(200).json(treino);
});
// ------------------------------------------------------------
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
