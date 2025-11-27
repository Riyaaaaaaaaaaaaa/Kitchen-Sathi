import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser, fetchMe, loginUser, registerUser, setToken, getToken } from '../lib/api';

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await fetchMe();
      setUser({
        id: res.user.id,
        email: res.user.email || '',
        name: res.user.name || '',
        role: res.user.role,
        avatar: res.user.avatar
      });
    } catch (e) {
      console.warn('Failed to fetch /api/me', e);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { token, user } = await loginUser({ email, password });
    setToken(token);
    setUser(user);
    // Refresh user data to get full profile including avatar
    await refreshMe();
  }, [refreshMe]);

  const register = useCallback(async (email: string, name: string, password: string) => {
    setError(null);
    const { token, user } = await registerUser({ email, name, password });
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, error, login, register, logout, refreshMe }), [user, loading, error, login, register, logout, refreshMe]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

