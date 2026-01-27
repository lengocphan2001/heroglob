import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getMe, login as apiLogin } from '../api/auth';
import { setOnUnauthorized, setStoredToken } from '../api/client';

const USER_KEY = 'admin:user';

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isInitialized: boolean;
};

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiLogin(email.trim(), password);
      setStoredToken(data.access_token);
      setUser(data.user);
      saveUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
    saveUser(null);
  }, []);

  const logoutRef = useRef(logout);
  logoutRef.current = logout;
  useEffect(() => {
    setOnUnauthorized(() => {
      logoutRef.current();
      window.location.href = '/login';
    });
    return () => setOnUnauthorized(null);
  }, []);

  useEffect(() => {
    if (isInitialized) return;
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('admin:token') : null;
    if (token) {
      getMe()
        .then((res) => {
          setUser(res.user);
          saveUser(res.user);
        })
        .catch(() => {
          setStoredToken(null);
          setUser(null);
          saveUser(null);
        });
    } else {
      setUser(null);
      saveUser(null);
    }
    setIsInitialized(true);
  }, [isInitialized]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user && !!(typeof localStorage !== 'undefined' && localStorage.getItem('admin:token')),
      login,
      logout,
      isLoading,
      isInitialized,
    }),
    [user, login, logout, isLoading, isInitialized],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
