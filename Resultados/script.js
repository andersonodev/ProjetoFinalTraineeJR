let alunosJSON = [];

// Função para carregar os dados dos alunos do arquivo JSON
async function carregarAlunos() {
    try {
        const response = await fetch('alunos.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        alunosJSON = await response.json();
    } catch (error) {
        console.error('Erro ao carregar os dados dos alunos:', error);
    }
}

// Função que cria o card de um aluno
function criarCardAluno(aluno) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = `
      <h3>${aluno.nome}</h3>
      <p>Setor: ${aluno.setor}</p>
  `;
  card.addEventListener('click', () => {
    criarCardDesc(aluno);
    card.innerHTML='';
    console.log(card1);
  });
  return card;
}
function criarCardDesc(aluno) {
  const card1 = document.createElement('div');
  card1.classList.add('card1');
  card1.innerHTML = `
      <h3>Nome: ${aluno.nome}</h3>
      <p>Setor: ${aluno.setor}</p>
      <p>Curso: ${aluno.curso}</p>
      <p>Idade: ${aluno.idade}</p>
      <p>Entrou: ${aluno.dataEntradaEmpresa}</p>
      <h2>Advertências: ${aluno.advertencias}</h2>
      <h2>Notificações: ${aluno.notificacoes}</h2>
  `;
  
  return card1;
}


// Função para buscar alunos com base nos inputs
function buscarAlunos() {
  const nomeInput = document.getElementById('nomeInput').value.trim().toLowerCase();
  const setorInput = document.getElementById('setorInput').value.trim().toLowerCase();
  const resultadosDiv = document.getElementById('resultados');
  resultadosDiv.innerHTML = '';

  const alunosFiltrados = alunosJSON.filter(aluno => {
      const nomeAluno = aluno.nome?.toLowerCase() || '';
      const setorAluno = aluno.setor?.toLowerCase() || '';

      const nomeCombina = nomeInput ? nomeAluno.includes(nomeInput) : true;
      const setorCombina = setorInput ? setorAluno.includes(setorInput) : true;

      return nomeCombina && setorCombina;
  });

  if (alunosFiltrados.length === 0) {
      resultadosDiv.innerHTML = '<p>Nenhum aluno encontrado.</p>';
      return;
  }

  alunosFiltrados.forEach(aluno => {
      const card = criarCardAluno(aluno);
      resultadosDiv.appendChild(card);
  });
  alunosFiltrados.forEach(aluno => {
    const card1 = criarCardDesc(aluno);
    resultadosDiv.appendChild(card1);
});
}

// Chamar carregarAlunos quando a página carregar
window.addEventListener('DOMContentLoaded', carregarAlunos);
