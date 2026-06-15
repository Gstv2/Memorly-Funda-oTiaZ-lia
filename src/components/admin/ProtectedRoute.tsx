// Componente de rota protegida
// Verifica se o usuário está autenticado e tem permissão para acessar a rota
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Interface para as propriedades do componente
interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean; // Se true, só administradores podem acessar
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, loading } = useAuth();

  // Exibe loading enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não estiver logado, redireciona para a página de login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Se a rota exigir admin e o usuário não for admin, exibe mensagem de acesso negado
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar esta área.
          </p>
          <p className="text-sm text-muted-foreground">
            Entre em contato com um administrador para solicitar acesso.
          </p>
        </div>
      </div>
    );
  }

  // Se tudo estiver ok, renderiza o conteúdo filho
  return <>{children}</>;
};

export default ProtectedRoute;
