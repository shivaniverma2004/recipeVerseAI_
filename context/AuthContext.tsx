'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { getOwnProfile } from '@/lib/actions/user';
import { UserWithCountType } from '@/types/user';

const supabase = getSupabaseBrowserClient();


interface AuthContextType {
  user: UserWithCountType | null;
  session: Session | null;
  loading: boolean;
  isAuth: boolean;
  q: string;
  fetchUser: () => Promise<void>;
  defineQ: (q: string) => void;
  updateUser: () => void;
  setAuth: (session: Session) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithCountType | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);


  const [q, setQ] = useState('');

  async function fetchUser() {
    const { user } = await getOwnProfile();
    if (user) {
      setUser(user);
      // setIsAuth(true);
    }
  }


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setIsAuth(true);
        fetchUser();
        setSession(session);
      } else {
        setIsAuth(false);
        setUser(null);
        setSession(null);
      }
      
      setLoading(false);
    });

  }, []);


  const setAuth = async (session: Session) => {
    setLoading(true);
    const { user } = await getOwnProfile();
    if (user) {
      setUser(user);
      setIsAuth(true);
    }
    setSession(session);
    setLoading(false);
  }

  const updateUser = () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        fetchUser()
        setSession(session);
      }

      setLoading(false);
    });
  }


  const defineQ = (q: string) => {
    setQ(q);
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("sb-access-token");
    localStorage.removeItem("sb-refresh-token");
    localStorage.removeItem("sb-refresh-token-ts");
    setIsAuth(false);
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAuth, q, fetchUser, defineQ, setAuth, updateUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}