let alunosJSON = [];

// Função para carregar dados de alunos
async function carregarAlunos() {
    try {
        const response = await fetch('/json/alunos.json');
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        alunosJSON = await response.json();
    } catch (error) {
        console.error('Erro ao carregar os dados dos alunos:', error);
    }
}

// Função para criar um card de aluno
function criarCardAluno(aluno) {
    const card = document.createElement('div');
    const resultados = document.getElementById('resultados');
    resultados.style.display = 'flex';
    card.classList.add('card');
    card.innerHTML = `
        <h3>Nome: ${aluno.nome}</h3>
        <p>Setor: ${aluno.setor}</p>
    `;
    card.addEventListener('click', () => {
        resultados.innerHTML = '';
        const cardDesc = criarCardDesc(aluno);
        resultados.appendChild(cardDesc);
    });
    return card;
}

// Função para criar o card detalhado do aluno
function criarCardDesc(aluno) {
    const card1 = document.createElement('div');
    card1.classList.add('card1');
    card1.innerHTML = `
        <h1>${aluno.nome}</h1>
        <h2>Setor: ${aluno.setor}</h2>
        <p>Curso: ${aluno.curso}</p>
        <p>Idade: ${aluno.idade}</p>
        <p>Entrou: ${aluno.dataEntradaEmpresa}</p>
        <h3>Advertências: ${aluno.advertencias}</h3>
        <h3>Notificações: ${aluno.notificacoes}</h3>
        <button class="selecionar-btn">Selecionar</button>
        <button class="enviar-btn">Enviar</button>
    `;
    return card1;
}

// Função para buscar os alunos
function buscarAlunos() {
    const nomeInput = document.getElementById('nomeInput').value.trim().toLowerCase();
    const setorInput = document.getElementById('setorInput').value.trim().toLowerCase();
    const resultadosDiv = document.getElementById('resultados');
    const padrao = document.getElementById('resultadoPadrao');
    const mensagemErro = document.getElementById('mensagemErro');
    const limparButton = document.getElementById('limparButton');
    const tituloResultados = document.getElementById('tituloResultados');

    // Limpa resultados e mensagens
    resultadosDiv.innerHTML = '';
    mensagemErro.innerHTML = '';
    padrao.style.display = 'block';
    tituloResultados.style.display = 'none';
    limparButton.style.display = 'none';

    // Validação
    if (!nomeInput && !setorInput) {
        mensagemErro.innerHTML = 'Preencha pelo menos um dos campos.';
        return;
    }

    // Filtra alunos
    const alunosFiltrados = alunosJSON.filter(aluno => {
        const nomeAluno = aluno.nome?.toLowerCase() || '';
        const setorAluno = aluno.setor?.toLowerCase() || '';
        const nomeCombina = nomeInput ? nomeAluno.includes(nomeInput) : true;
        const setorCombina = setorInput ? setorAluno.includes(setorInput) : true;
        return nomeCombina && setorCombina;
    });

    if (alunosFiltrados.length === 0) {
        mensagemErro.innerHTML = 'Nenhum aluno encontrado.';
        return;
    }

    // Oculta padrão e mostra título
    padrao.style.display = 'none';
    tituloResultados.style.display = 'block';
    limparButton.style.display = 'block';

    // Exibe cards
    alunosFiltrados.forEach(aluno => {
        const card = criarCardAluno(aluno);
        resultadosDiv.appendChild(card);
    });
}

// Função para limpar a pesquisa
function limparPesquisa() {
    document.getElementById('nomeInput').value = '';
    document.getElementById('setorInput').value = '';
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = '';
    const mensagemErro = document.getElementById('mensagemErro');
    mensagemErro.innerHTML = '';
    const padrao = document.getElementById('resultadoPadrao');
    padrao.style.display = 'block';
    const limparButton = document.getElementById('limparButton');
    limparButton.style.display = 'none';
    const tituloResultados = document.getElementById('tituloResultados');
    tituloResultados.style.display = 'none';
}

window.addEventListener('DOMContentLoaded', carregarAlunos);

document.getElementById('buscarButton').addEventListener('click', buscarAlunos);
document.getElementById('limparButton').addEventListener('click', limparPesquisa);

document.getElementById('nomeInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        buscarAlunos();
    }
});

document.getElementById('setorInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        buscarAlunos();
    }
});
