import React, { useState } from 'react';

const EsqueceuSenhaPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica de envio de email
    setEnviado(true);
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <h2>Esqueceu sua senha?</h2>
      {enviado ? (
        <p>Se o email existir, você receberá instruções para redefinir sua senha.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 12 }}
          />
          <button type="submit">Enviar</button>
        </form>
      )}
    </div>
  );
};

export default EsqueceuSenhaPage; 