import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DefinirSenha.css';

function DefinirSenhaPage() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const navigate = useNavigate();

  const senhaValida = senha.length >= 6 && senha === confirmarSenha;

  const handleDefinirSenha = () => {
    if (!senhaValida) {
      alert('As senhas devem ter pelo menos 6 caracteres e ser iguais.');
      return;
    }

    alert('Senha alterada com sucesso!');
    navigate('/');
  };

  return (
    <div className="pag-definir">
      <img src="./logoibmecjr.png" alt="Logo Ibmec Jr" className="logo-ibmecjr-pagesc" />

      <div className="form-definir">
        <h1>Definir Nova Senha <hr /></h1>

        <label>Nova Senha</label>
        <input
          type="password"
          placeholder="Digite a nova senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <label>Confirmar Senha</label>
        <input
          type="password"
          placeholder="Confirme a nova senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />

        {!senhaValida && confirmarSenha.length > 0 && (
          <span style={{ color: 'red' }}>As senhas não coincidem ou são muito curtas.</span>
        )}

        <button className="botao-definir" onClick={handleDefinirSenha} disabled={!senhaValida}>
          Confirmar Nova Senha
        </button>
      </div>
    </div>
  );
}

export default DefinirSenhaPage;