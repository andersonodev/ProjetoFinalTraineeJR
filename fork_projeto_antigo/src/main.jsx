import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // OU BrowserRouter se não for usar GitHub Pages
import App from './App.jsx';
import './styles/LoginPage.css';
import './styles/RegistrosPage.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter> {/* OU <BrowserRouter> */}
      <App />
    </HashRouter>
  </StrictMode>
);
