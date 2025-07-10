import React, { useState } from 'react';

const DefinirSenhaPage: React.FC = () => {
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha && senha === confirmacao) {
      // Aqui você pode adicionar a lógica de definição de senha
      setSucesso(true);
    } else {
      alert('As senhas não coincidem!');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <h2>Definir nova senha</h2>
      {sucesso ? (
        <p>Senha definida com sucesso! Agora você pode fazer login.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="senha">Nova senha:</label>
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 12 }}
          />
          <label htmlFor="confirmacao">Confirme a senha:</label>
          <input
            id="confirmacao"
            type="password"
            value={confirmacao}
            onChange={e => setConfirmacao(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 12 }}
          />
          <button type="submit">Definir senha</button>
        </form>
      )}
    </div>
  );
};

export default DefinirSenhaPage; 