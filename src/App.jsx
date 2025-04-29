import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/LoginPage';
import Registros from './components/RegistrosPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registros" element={<Registros />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
