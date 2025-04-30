import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EsqueceuSenha.css';

function EsqueceuSenhaPage() {
  const [email, setEmail] = useState('');
  const [isEmailValido, setEmailValido] = useState(false);
  const navigate = useNavigate();

  const validarEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValido(regex.test(value));
  };

  const mudar = (e) => {
    const value = e.target.value;
    setEmail(value);
    validarEmail(value);
  };

  const enviarRecuperacao = () => {
    if (!isEmailValido) {
      alert('Por favor, digite um e-mail válido.');
      return;
    }

    alert(`Enviaremos o email com as instruções para: ${email}`);
    navigate('/');
  };

  return (
    <div className="pag-esqueceu">
      <img src="./logoibmecjr.png" alt="Logo Ibmec Jr" className="logo-ibmecjr-pagesc" />

      <div className="form-esqueceu">
        <h1>Recuperar Senha <hr /></h1>

        <label>Email</label>
        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={mudar}
          className={email.length > 0 ? (isEmailValido ? 'valido' : 'invalido') : ''}
        />
        {!isEmailValido && email.length > 0 && (
          <span className="dica-paginaesqueceu" style={{ color: 'red' }}>Formato de e-mail inválido</span>
        )}

        <button className="logar-paginaesqueceu" onClick={enviarRecuperacao} disabled={!isEmailValido}>
          Recuperar Senha
        </button>

        <button className="logar-paginaesqueceu" onClick={() => navigate('/')}>
          Voltar ao Login
        </button>
      </div>
    </div>
  );
}

export default EsqueceuSenhaPage;