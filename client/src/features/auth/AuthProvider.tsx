import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentSession,
  getUserProfile,
  signInWithPassword,
  signOutLocal,
} from "./authService";
import type {
  AuthContextType,
  AuthUser,
  LoginResult,
  UserProfile,
} from "./authTypes";

// --- Contexto de Autenticação ---
// Cria o contexto que compartilhará o estado e as funções de autenticação.
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// --- Tipos ---
interface Props {
  children: React.ReactNode;
}

interface SessionPayload {
  user: AuthUser;
  profile: UserProfile | null;
}

// --- Componente Provedor ---
export function AuthProvider({ children }: Props) {
  // --- Estado ---
  // Gerencia o usuário, perfil, estado de carregamento e erros.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Funções Auxiliares de Estado ---
  // Funções para limpar e aplicar o estado da sessão de autenticação.
  const clearAuthState = useCallback(() => {
    setUser(null);
    setProfile(null);
  }, []);

  const applySession = useCallback(
    async (session: SessionPayload | null): Promise<UserProfile | null> => {
      if (!session?.user) {
        clearAuthState();
        return null;
      }

      setUser(session.user);
      setProfile(session.profile ?? null);

      return session.profile ?? null;
    },
    [clearAuthState]
  );

  // --- Funções Principais de Autenticação ---
  // Lógica para carregar sessão, atualizar perfil, login e logout.
  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { session } = await getCurrentSession();
      if (!session) {
        clearAuthState();
        return; 
      }
      await applySession(session);
    } catch {
      clearAuthState();
    } finally {
      setLoading(false);
    }
  }, [applySession, clearAuthState]);

  const refreshProfile = useCallback(async () => {
      try {
        setError(null);
        const userProfile = await getUserProfile();
        setProfile(userProfile);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao atualizar perfil."
        );
      }
    }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      try {
        setLoading(true);
        setError(null);

        const { user, profile, error } = await signInWithPassword(email, password);

        if (error || !user) {
          const message = error?.message || "Erro ao fazer login.";
          setError(message);
          clearAuthState();
          return { error: message, profile: null };
        }

        setUser(user);
        setProfile(profile ?? null);
        return {
          error: null,
          profile: profile ?? null,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao fazer login.";
        setError(message);
        clearAuthState();
        return { error: message, profile: null };
      } finally {
        setLoading(false);
      }
    },
    [clearAuthState]
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await signOutLocal();
      clearAuthState();
      window.location.href = "/";
    } catch (err) {
      clearAuthState();
      setError(err instanceof Error ? err.message : "Erro ao sair.");
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  }, [clearAuthState]);

  // --- Efeitos ---
  // Carrega a sessão do usuário ao montar o componente.
  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  // --- Valor do Contexto ---
  // Memoriza o objeto de contexto que será fornecido aos componentes filhos.
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      loading,
      error,
      isAuthenticated: !!user,
      login,
      logout,
      refreshProfile,
    }),
    [user, profile, loading, error, login, logout, refreshProfile]
  );

  // --- Renderização ---
  // Fornece o contexto de autenticação para a árvore de componentes da aplicação.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}