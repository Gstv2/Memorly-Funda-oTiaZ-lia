import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface que define os dados e funções disponíveis no contexto de autenticação.
 */
interface AuthContextType {
  user: User | null;         // Usuário logado
  session: Session | null;   // Sessão ativa do Supabase
  isAdmin: boolean;          // Flag que indica se o usuário possui cargo de Admin
  loading: boolean;          // Estado de carregamento inicial do auth
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>; // Login
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>; // Cadastro
  signOut: () => Promise<void>; // Logout
}

// Criação do contexto com valor inicial indefinido
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provedor de Autenticação (Wrapper principal do App)
 * Gerencia o estado global de login e permissões.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Consulta a tabela 'user_roles' para verificar se o usuário é administrador.
   */
  const checkAdminRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar cargo de admin:', error);
      return false;
    }
    return !!data;
  };

  useEffect(() => {
    // 1. Escuta mudanças no estado de autenticação (Login, Logout, Refresh Token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Se houver um usuário, verifica imediatamente se ele é admin
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id).then(setIsAdmin);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // 2. Busca a sessão existente ao carregar a página pela primeira vez
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkAdminRole(session.user.id).then(setIsAdmin);
      }
      setLoading(false);
    });

    // Remove o listener ao destruir o componente
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Função de Login
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  /**
   * Função de Cadastro (inclui o nome completo no cadastro do Supabase)
   */
  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  /**
   * Função de Logout
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook customizado para acessar facilmente o contexto de autenticação em qualquer componente.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
