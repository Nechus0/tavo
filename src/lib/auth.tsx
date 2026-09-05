import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Me = { id: string; display_name: string; email: string | null; is_admin: boolean };

type Ctx = {
  session: Session | null;
  me: Me | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthCtx = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe(s: Session | null) {
    if (!s) return setMe(null);
    const { data } = await supabase.from('profiles')
      .select('id, display_name, email, is_admin').eq('id', s.user.id).maybeSingle();
    setMe(data as Me | null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session); await loadMe(data.session); setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); loadMe(s); });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signUp(name: string, email: string, password: string) {
    if (!name.trim()) throw new Error('Bitte einen Namen eingeben');
    if (password.length < 8) throw new Error('Das Passwort braucht mindestens 8 Zeichen');
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { display_name: name.trim() } },
    });
    if (error) throw error;
    if (!data.session) throw new Error('Bitte bestaetige zuerst die E-Mail und melde dich dann an.');
    await loadMe(data.session);
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    });
    if (error) throw new Error(error.message === 'Invalid login credentials'
      ? 'E-Mail oder Passwort stimmt nicht.' : error.message);
    await loadMe(data.session);
  }

  const signOut = async () => { await supabase.auth.signOut(); setMe(null); };

  return (
    <AuthCtx.Provider value={{ session, me, loading, signUp, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}
