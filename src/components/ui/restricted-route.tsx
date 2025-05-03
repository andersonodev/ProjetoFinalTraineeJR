import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

type RestrictedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Array<"admin" | "powerUser" | "member">;
  fallbackPath?: string;
};

/**
 * Componente para restringir acesso a rotas com base nas permissões do usuário
 */
export const RestrictedRoute = ({
  children,
  allowedRoles = ["admin", "powerUser", "member"],
  fallbackPath = "/dashboard",
}: RestrictedRouteProps) => {
  const { isAdmin, isPowerUser, isLoading, currentUser } = useAuth();

  // Enquanto carrega, mostra spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
        <span className="ml-2">Carregando permissões...</span>
      </div>
    );
  }

  // Verificar se o usuário está autenticado
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário tem permissão com base nos roles permitidos
  const hasAccess = (
    (isAdmin && allowedRoles.includes("admin")) ||
    (isPowerUser && allowedRoles.includes("powerUser")) ||
    (!isAdmin && !isPowerUser && allowedRoles.includes("member"))
  );

  // Se não tem acesso, redireciona para o fallbackPath
  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Se tem acesso, renderiza o conteúdo
  return <>{children}</>;
};
