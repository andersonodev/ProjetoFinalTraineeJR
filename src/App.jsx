import { Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegistrosPage from './components/RegistrosPage';
import EsqueceuSenhaPage from './components/EsqueceuSenhaPage';
import DefinirSenhaPage from './components/DefinirSenhaPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/Login" element={<LoginPage />} />
      <Route path="/registros" element={<RegistrosPage />} />
      <Route path="/esqueceu" element={<EsqueceuSenhaPage />} />
      <Route path="/definir-senha" element={<DefinirSenhaPage />} />
    </Routes>
  );
}

export default App;
