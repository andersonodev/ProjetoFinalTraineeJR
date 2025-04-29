import { Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegistrosPage from './components/RegistrosPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/registros" element={<RegistrosPage />} />
    </Routes>
  );
}

export default App;
