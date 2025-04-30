import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegistrosPage.css';

function RegistrosPage() {
  const [alunos, setAlunos] = useState([]);
  const [nomeInput, setNomeInput] = useState('');
  const [setorInput, setSetorInput] = useState('');
  const [resultados, setResultados] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const [mostrarTitulo, setMostrarTitulo] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('loggedIn') !== 'true') {
      alert('Você precisa estar logado!');
      navigate('/login');
    } else {
      carregarAlunos();
    }
  }, []);

  async function carregarAlunos() {
    try {
      const response = await fetch('./src/components/json/alunos.json'); // Corrigir o caminho do arquivo
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const data = await response.json();
      console.log('Alunos carregados:', data); // Debug
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao carregar os dados dos alunos:', error);
    }
  }

  function buscarAlunos() {
    const nome = nomeInput.trim().toLowerCase(); // Garantir case-insensitive
    const setor = setorInput.trim().toLowerCase(); // Garantir case-insensitive

    setMensagemErro('');
    setMostrarTitulo(false);
    setResultados([]);
    setAlunoSelecionado(null);

    if (!nome && !setor) {
      setMensagemErro('Preencha pelo menos um dos campos.');
      return;
    }

    const filtrados = alunos.filter((aluno) => {
      const nomeAluno = aluno.nome?.toLowerCase() || ''; // Garantir case-insensitive
      const setorAluno = aluno.setor?.toLowerCase() || ''; // Garantir case-insensitive
      const nomeCombina = nome ? nomeAluno.includes(nome) : true;
      const setorCombina = setor ? setorAluno.includes(setor) : true;
      return nomeCombina && setorCombina;
    });

    if (filtrados.length === 0) {
      setMensagemErro('Nenhum aluno encontrado.');
      return;
    }

    setMostrarTitulo(true);
    setResultados(filtrados);
  }

  function selecionarAluno(aluno) {
    setAlunoSelecionado(aluno);
  }

  function limparPesquisa() {
    setNomeInput('');
    setSetorInput('');
    setMensagemErro('');
    setResultados([]);
    setMostrarTitulo(false);
    setAlunoSelecionado(null);
  }

  return (
    <div>
      <header>
        <div className="containerTop">
          <button className="btn-top" onClick={() => navigate('/')}>Home</button>
          <button className="btn-top" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-top" onClick={() => navigate('/registros')}>Registros</button>
        </div>
      </header>

      <div className="container2">
        <div className="containerregistro">
          {mostrarTitulo && (
            <h4 id="tituloResultados">Resultados:</h4>
          )}

          {mensagemErro && (
            <div id="mensagemErro" className="mensagem-erro">{mensagemErro}</div>
          )}

          <div id="resultados" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {resultados.map((aluno) => (
              <div className="card" key={aluno.nome} onClick={() => selecionarAluno(aluno)}>
                <h3>Nome: {aluno.nome}</h3>
                <p>Setor: {aluno.setor}</p>
              </div>
            ))}
          </div>

          {alunoSelecionado && (
            <div className="card1">
              <h1>{alunoSelecionado.nome}</h1>
              <h2>Setor: {alunoSelecionado.setor}</h2>
              <p>Curso: {alunoSelecionado.curso}</p>
              <p>Idade: {alunoSelecionado.idade}</p>
              <p>Entrou: {alunoSelecionado.dataEntradaEmpresa}</p>
              <h3>Advertências: {alunoSelecionado.advertencias}</h3>
              <h3>Notificações: {alunoSelecionado.notificacoes}</h3>
              <button className="selecionar-btn">Selecionar</button>
              <button className="enviar-btn">Enviar</button>
            </div>
          )}
        </div>

        <div className="containerbusca">
          <div className="busca">
            <h1 className="pesquisa">Busca de aluno</h1>
            <input
              type="text"
              placeholder="Nome do aluno"
              value={nomeInput}
              onChange={(e) => setNomeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarAlunos()}
            />
            <input
              type="text"
              placeholder="Setor do aluno"
              value={setorInput}
              onChange={(e) => setSetorInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarAlunos()}
            />
            <button className="buscar" onClick={buscarAlunos}>Buscar</button>
            {resultados.length > 0 && (
              <button id="limparButton" onClick={limparPesquisa}>
                Limpar Pesquisa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrosPage;
