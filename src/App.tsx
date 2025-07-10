import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import CreateUser from "./components/CreateUser";
import NotFound from "./components/NotFound";
import Profile from "./components/Profile";
import EsqueceuSenhaPage from "./components/pages/EsqueceuSenha";
import DefinirSenhaPage from "./components/pages/DefinirSenha";


import { ProtectedRoute } from "@/components/ProtectedRoute";

// App principal
const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/esqueceu-senha" element={<EsqueceuSenhaPage />} />
      <Route path="/definir-senha" element={<DefinirSenhaPage />} />
    
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/cadastrar-usuario" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <CreateUser />
        </ProtectedRoute>
      } />
      
      <Route path="/perfil" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
  

      
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
