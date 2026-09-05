import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, SB_URL, SB_KEY } from './supabase';

export type Me = {
  id: string; display_name: string; email: string | null;
  role: 'admin' | 'user'; status: 'pending' | 'active' | 'blocked';
};

type Ctx = {
  session: Session | null;
  me: Me | null;
  loading: boolean;
  redeem: (token: string, name: string, email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthCtx = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthCtx);

function human(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-Mail oder Passwort stimmt nicht.';
  if (m.includes('email not confirmed')) return 'Das Konto ist noch nicht bestaetigt.';
  return msg;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe(s: Session | null) {
    if (!s) return setMe(null);
    const { data } = await supabase.from('profiles')
      .select('id, display_name, email, role, status').eq('id', s.user.id).maybeSingle();
    setMe(data as Me | null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session); await loadMe(data.session); setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); loadMe(s); });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    });
    if (error) throw new Error(human(error.message));
    await loadMe(data.session);
  }

  async function redeem(token: string, name: string, email: string, password: string) {
    const res = await fetch(`${SB_URL}/functions/v1/registrieren`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SB_KEY },
      body: JSON.stringify({ token: token.trim(), name: name.trim(), email: email.trim(), passwort: password }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.fehler ?? 'Registrierung fehlgeschlagen');
    await signIn(email, password);
    return (j.event_id as string | null) ?? null;
  }

  const signOut = async () => { await supabase.auth.signOut(); setMe(null); };

  return (
    <AuthCtx.Provider value={{ session, me, loading, redeem, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}
