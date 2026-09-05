import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

type Ctx = {
  session: Session | null;
  loading: boolean;
  displayName: string | null;
  register: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthCtx = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadName(s: Session | null) {
    if (!s) return setDisplayName(null);
    const { data } = await supabase.from('profiles').select('display_name').eq('id', s.user.id).maybeSingle();
    setDisplayName(data?.display_name ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadName(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      loadName(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function register(name: string) {
    const clean = name.trim();
    if (!clean) throw new Error('Bitte einen Namen eingeben');
    let current = session;
    if (!current) {
      const { data, error } = await supabase.auth.signInAnonymously({
        options: { data: { full_name: clean } },
      });
      if (error) throw error;
      current = data.session;
      setSession(current);
    }
    if (!current) throw new Error('Anmeldung fehlgeschlagen');
    const { error: pe } = await supabase.from('profiles')
      .upsert({ id: current.user.id, display_name: clean });
    if (pe) throw pe;
    setDisplayName(clean);
  }

  const signOut = async () => { await supabase.auth.signOut(); setDisplayName(null); };

  return (
    <AuthCtx.Provider value={{ session, loading, displayName, register, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}
