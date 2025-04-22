let alunosJSON = [];

// Função para carregar dados de alunos (normalmente viria de um arquivo JSON ou API)
async function carregarAlunos() {
    try {
        const response = await fetch('alunos.json');
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

// Função para buscar os alunos com base nos campos de filtro
function buscarAlunos() {
    const nomeInput = document.getElementById('nomeInput').value.trim().toLowerCase();
    const setorInput = document.getElementById('setorInput').value.trim().toLowerCase();
    const resultadosDiv = document.getElementById('resultados');
    const padrao = document.getElementById('resultadoPadrao');
    const mensagemErro = document.getElementById('mensagemErro');
    const limparButton = document.getElementById('limparButton'); 

    // Limpa resultados e mensagens de erro
    resultadosDiv.innerHTML = '';
    mensagemErro.innerHTML = '';
    padrao.style.display = 'block';

    // Esconde o botão de limpar inicialmente
    limparButton.style.display = 'none';

    // Validação: pelo menos um campo precisa ser preenchido
    if (!nomeInput && !setorInput) {
        mensagemErro.innerHTML = 'Preencha pelo menos um dos campos.';
        return;
    }

    // Filtra os alunos com base nos campos de pesquisa
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

    // Esconde o conteúdo padrão
    padrao.style.display = 'none';

    // Exibe o botão de limpar após uma pesquisa bem-sucedida
    limparButton.style.display = 'block';

    // Cria e adiciona os cards de alunos encontrados
    alunosFiltrados.forEach(aluno => {
        const card = criarCardAluno(aluno);
        resultadosDiv.appendChild(card);
    });
}

// Função para limpar a pesquisa
function limparPesquisa() {
    // Limpa os campos de entrada
    document.getElementById('nomeInput').value = '';
    document.getElementById('setorInput').value = '';

    // Limpa os resultados e a mensagem de erro
    const resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = '';
    const mensagemErro = document.getElementById('mensagemErro');
    mensagemErro.innerHTML = '';

    // Mostra novamente o conteúdo padrão
    const padrao = document.getElementById('resultadoPadrao');
    padrao.style.display = 'block';

    // Esconde o botão de limpar após limpar a pesquisa
    const limparButton = document.getElementById('limparButton');
    limparButton.style.display = 'none';
}

// Inicializa os dados dos alunos ao carregar a página
window.addEventListener('DOMContentLoaded', carregarAlunos);

// Configura os eventos de busca e limpar
document.getElementById('buscarButton').addEventListener('click', buscarAlunos);
document.getElementById('limparButton').addEventListener('click', limparPesquisa);

// Permite realizar a busca pressionando Enter
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
