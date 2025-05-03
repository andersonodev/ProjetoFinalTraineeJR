import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'powerUser' | 'member'>;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: ProtectedRouteProps) => {
  const { currentUser, userData, isAdmin, isPowerUser, isLoading } = useAuth();
  const location = useLocation();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  
  // Referencia se o toast de erro já foi mostrado
  const [errorShown, setErrorShown] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setInitialLoadComplete(true);
    }
  }, [isLoading]);

  useEffect(() => {
    if (initialLoadComplete && allowedRoles) {
      const userHasPermission = allowedRoles.some(role => {
        if (role === 'admin') return isAdmin;
        if (role === 'powerUser') return isPowerUser; 
        if (role === 'member') return true;
        return false;
      });
      
      setHasPermission(userHasPermission);
      
      // Mostrar toast de erro em um useEffect separado
      if (!userHasPermission && !errorShown) {
        setErrorShown(true);
      }
    }
  }, [initialLoadComplete, allowedRoles, isAdmin, isPowerUser, errorShown]);

  // Efeito separado para mostrar o toast
  useEffect(() => {
    if (errorShown) {
      toast.error("Você não tem permissão para acessar esta página");
    }
  }, [errorShown]);

  if (isLoading || !initialLoadComplete) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
        <span className="ml-2">Verificando permissões...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles) {
    return <>{children}</>;
  }

  if (!hasPermission) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
