async function validarAluno() {
    let nomeDigitado = document.getElementById('nome').value.trim();
    let setorDigitado = document.getElementById('curso').value.trim();
    let infoAluno = document.getElementById('infoAluno');
  
    fetch('alunos.json')
      .then(response => response.json())
      .then(alunos => {
        const alunoValido = alunos.find(aluno =>
          aluno.nome.toLowerCase() === nomeDigitado.toLowerCase() &&
          aluno.setor.toLowerCase() === setorDigitado.toLowerCase()
        );
  
        if (alunoValido) {
          window.location.href = `Resultados\index.html'
            Nome: ${alunoValido.nome}<br>
            Setor: ${alunoValido.setor}
          `;
        } else {
          infoAluno.innerHTML = "Nome ou setor incorretos.";
        }
      })
      .catch(() => {
        infoAluno.innerHTML = "Erro ao carregar os dados.";
      });
  }
  