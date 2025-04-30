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
      const response = await fetch('./public/json/alunos.json');
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const data = await response.json();
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao carregar os dados dos alunos:', error);
    }
  }

  function criarCardAluno(aluno) {
    return (
      <div
        className="card"
        key={aluno.nome}
        onClick={() => {
          setResultados([
            <div className="card1" key="detalhes">
              <h1>{aluno.nome}</h1>
              <h2>Setor: {aluno.setor}</h2>
              <p>Curso: {aluno.curso}</p>
              <p>Idade: {aluno.idade}</p>
              <p>Entrou: {aluno.dataEntradaEmpresa}</p>
              <h3>Advertências: {aluno.advertencias}</h3>
              <h3>Notificações: {aluno.notificacoes}</h3>
              <button className="selecionar-btn">Selecionar</button>
              <button className="enviar-btn">Enviar</button>
            </div>,
          ]);
          setMostrarTitulo(false);
        }}
      >
        <h3>Nome: {aluno.nome}</h3>
        <p>Setor: {aluno.setor}</p>
      </div>
    );
  }

  function buscarAlunos() {
    const nome = nomeInput.trim().toLowerCase();
    const setor = setorInput.trim().toLowerCase();

    setMensagemErro('');
    setMostrarTitulo(false);
    setResultados([]);

    if (!nome && !setor) {
      setMensagemErro('Preencha pelo menos um dos campos.');
      return;
    }

    const filtrados = alunos.filter((aluno) => {
      const nomeAluno = aluno.nome?.toLowerCase() || '';
      const setorAluno = aluno.setor?.toLowerCase() || '';
      const nomeCombina = nome ? nomeAluno.includes(nome) : true;
      const setorCombina = setor ? setorAluno.includes(setor) : true;
      return nomeCombina && setorCombina;
    });

    if (filtrados.length === 0) {
      setMensagemErro('Nenhum aluno encontrado.');
      return;
    }

    setMostrarTitulo(true);
    setResultados(filtrados.map((aluno) => criarCardAluno(aluno)));
  }

  function limparPesquisa() {
    setNomeInput('');
    setSetorInput('');
    setMensagemErro('');
    setResultados([]);
    setMostrarTitulo(false);
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
          <h4 id="tituloResultados" style={{ display: mostrarTitulo ? 'block' : 'none' }}>
            Resultados:
          </h4>
          {resultados.length === 0 && <div id="resultadoPadrao">Nenhum resultado encontrado</div>}
          <div id="resultados" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {resultados}
          </div>
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
            <button id="limparButton" onClick={limparPesquisa} style={{ display: resultados.length > 0 ? 'inline-block' : 'none' }}>
              Limpar Pesquisa
            </button>
            <div id="mensagemErro" className="mensagem-erro">{mensagemErro}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrosPage;
