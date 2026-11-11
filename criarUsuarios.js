const bcrypt = require('bcrypt');
const db = require('./banco.js');

async function criarUsuariosDeTeste() {
    const qtd = db.prepare(
        'SELECT COUNT(*) AS n FROM usuarios'
    ).get().n;

    if (qtd > 0) {
        console.log('Os usuarios ja foram criados.');
        return;
    }

    const senhaDiego = await bcrypt.hash('1234', 10);
    const senhaAluno = await bcrypt.hash('senha', 10);

    const inserir = db.prepare(
        'INSERT INTO usuarios (usuario, senha_hash) VALUES (?, ?)'
    );

    inserir.run('diego', senhaDiego);
    inserir.run('aluno', senhaAluno);

    console.log('Usuarios criados com hash.');
}

criarUsuariosDeTeste()
    .catch((erro) => {
        console.error('Erro ao criar usuarios:', erro);
        process.exitCode = 1;
    })
    .finally(() => {
        db.close();
    });
