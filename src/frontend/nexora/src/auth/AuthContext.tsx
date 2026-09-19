import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { NexoraUser } from '../types/extended';

// ─── Demo credentials (clearly marked as demo only) ───────────────────────────
const DEMO_USERS: (NexoraUser & { password: string })[] = [
  {
    id: 'usr-admin-001',
    name: 'Aarav Mehta',
    email: 'admin@nexora.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'AM',
  },
  {
    id: 'usr-user-001',
    name: 'Jordan Lee',
    email: 'user@nexora.com',
    password: 'user123',
    role: 'user',
    region: 'Houston North',
    avatar: 'JL',
  },
  {
    id: 'usr-user-002',
    name: 'Sam Rivera',
    email: 'user2@nexora.com',
    password: 'user123',
    role: 'user',
    region: 'Houston South',
    avatar: 'SR',
  },
];

const AUTH_KEY = 'nexora_auth';

// ─── Context shape ─────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: NexoraUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NexoraUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? (JSON.parse(stored) as NexoraUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  function login(email: string, password: string): boolean {
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!found) return false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...safeUser } = found;
    setUser(safeUser);
    return true;
  }

  function logout() {
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
