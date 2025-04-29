import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const login = () => {
    if (usuario === 'admin' && senha === '12345') {
      alert('Logado com sucesso!');
      sessionStorage.setItem('loggedIn', 'true');
      navigate('/registros');
    } else {
      alert('Senha ou usuário incorretos!');
    }
  };

  return (
    <div className="login-wrapper">
      <img src="/logoibmecjr.png" alt="Logo Ibmec Jr" className="login-logo" />

      <div className="login-form">
        <h1>Login <hr /></h1>

        <label>Usuário</label>
        <input
          type="text"
          placeholder="Digite seu nome"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <span className="dica">*admin*</span>

        <label>Senha</label>
        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <span className="dica">*12345*</span>

        <a href="#">Esqueceu sua senha?</a>

        <button className="logar" onClick={login}>Login</button>
      </div>
    </div>
  );
}

export default LoginPage;
