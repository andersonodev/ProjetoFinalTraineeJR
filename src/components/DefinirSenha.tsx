import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../lib/firebase'; // Certifique-se de importar sua instância do Firebase
import '../styles/DefinirSenha.css';

function DefinirSenhaPage() {
  const [searchParams] = useSearchParams();
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();

  const oobCode = searchParams.get('oobCode');
  const senhaValida = senha.length >= 6 && senha === confirmarSenha;

  const handleDefinirSenha = async () => {
    if (!senhaValida) {
      setErro('As senhas devem ter pelo menos 6 caracteres e ser iguais.');
      return;
    }
    if (!oobCode) {
      setErro('Código de redefinição inválido ou ausente.');
      return;
    }
    try {
      await confirmPasswordReset(auth, oobCode, senha);
      setSucesso(true);
      setErro('');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error(error);
      setErro('Erro ao redefinir a senha. O link pode ter expirado.');
    }
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

        {erro && <span style={{ color: 'red' }}>{erro}</span>}
        {sucesso && <span style={{ color: 'green' }}>Senha redefinida com sucesso!</span>}

        <button className="botao-definir" onClick={handleDefinirSenha} disabled={!senhaValida}>
          Confirmar Nova Senha
        </button>
      </div>
    </div>
  );
}

export default DefinirSenhaPage;