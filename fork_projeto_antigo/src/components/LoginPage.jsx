import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const login = () => {
    // Lógica de login hardcoded removida por segurança
    alert('Login desabilitado nesta versão.');
  };

  return (
    <div className="login-wrapper">
      <img src="./logoibmecjr.png" alt="Logo Ibmec Jr" className="login-logo" />

      <div className="login-form">
        <h1>Login <hr /></h1>

        <label>Usuário</label>
        <input
          type="text"
          placeholder="Digite seu nome"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        {/* Dica removida */}

        <label>Senha</label>
        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        {/* Dica removida */}

        <Link to="/esqueceu">Esqueceu sua senha?</Link>

        <button className="logar" onClick={login}>Login</button>
      </div>
    </div>
  );
}

export default LoginPage;
