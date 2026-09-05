import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { supabase } from './supabase';
import { useAuth } from './auth';
import { Btn } from './ui';
import { t } from './theme';

const field = {
  backgroundColor: t.tile, borderRadius: t.rs, color: t.text,
  fontSize: 16, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10,
} as const;

type Check = { valid: boolean; reason: string | null; email: string | null; event_title: string | null };

export function AuthForm({ initialToken = '', onDone }: {
  initialToken?: string;
  onDone: (eventId: string | null) => void;
}) {
  const { signIn, redeem } = useAuth();
  const [mode, setMode] = useState<'invite' | 'login'>(initialToken ? 'invite' : 'login');
  const [token, setToken] = useState(initialToken);
  const [check, setCheck] = useState<Check | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function verify(value: string) {
    if (!value.trim()) return setCheck(null);
    const { data } = await supabase.rpc('check_invite', { p_token: value.trim() });
    const r = (Array.isArray(data) ? data[0] : data) as Check | undefined;
    setCheck(r ?? null);
    if (r?.email) setEmail(r.email);
  }
  useEffect(() => { if (initialToken) verify(initialToken); }, [initialToken]);

  async function submit() {
    setErr(null);
    if (mode === 'login') {
      if (!email.trim() || !pw) return setErr('Bitte E-Mail und Passwort eingeben');
      setBusy(true);
      try { await signIn(email, pw); onDone(null); }
      catch (e: any) { setErr(e.message); } finally { setBusy(false); }
      return;
    }
    if (!token.trim()) return setErr('Bitte den Einladungscode eingeben');
    if (!name.trim()) return setErr('Bitte einen Namen eingeben');
    if (!email.trim()) return setErr('Bitte eine E-Mail eingeben');
    if (pw.length < 8) return setErr('Das Passwort braucht mindestens 8 Zeichen');
    if (pw !== pw2) return setErr('Die beiden Passwoerter stimmen nicht ueberein');
    setBusy(true);
    try { const ev = await redeem(token, name, email, pw); onDone(ev); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {([['login', 'Anmelden'], ['invite', 'Einladung einloesen']] as const).map(([m, l]) => (
          <Pressable key={m} onPress={() => { setMode(m); setErr(null); }} style={{ flex: 1 }}>
            <View style={{
              borderRadius: t.rs, paddingVertical: 9, alignItems: 'center',
              backgroundColor: mode === m ? t.tile2 : 'transparent',
              borderWidth: 1, borderColor: mode === m ? t.line : 'transparent',
            }}>
              <Text style={{ color: mode === m ? t.text : t.faint, fontSize: 14 }}>{l}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {mode === 'invite' && (
        <>
          <TextInput value={token} onChangeText={v => { setToken(v); setErr(null); }}
            onBlur={() => verify(token)} placeholder="Einladungscode"
            placeholderTextColor={t.faint} autoCapitalize="none" style={field} />
          {check && (
            <Text style={{ color: check.valid ? t.accent : t.danger, fontSize: 13, marginBottom: 10 }}>
              {check.valid
                ? 'Einladung gueltig' + (check.event_title ? ' \u00b7 ' + check.event_title : '')
                : check.reason}
            </Text>
          )}
          <TextInput value={name} onChangeText={v => { setName(v); setErr(null); }}
            placeholder="Vorname" placeholderTextColor={t.faint} autoCapitalize="words" style={field} />
        </>
      )}

      <TextInput value={email} onChangeText={v => { setEmail(v); setErr(null); }}
        placeholder="E-Mail" placeholderTextColor={t.faint}
        autoCapitalize="none" keyboardType="email-address" style={field} />
      <TextInput value={pw} onChangeText={v => { setPw(v); setErr(null); }}
        placeholder={mode === 'invite' ? 'Passwort, mindestens 8 Zeichen' : 'Passwort'}
        placeholderTextColor={t.faint} secureTextEntry style={field} />
      {mode === 'invite' && (
        <TextInput value={pw2} onChangeText={v => { setPw2(v); setErr(null); }}
          placeholder="Passwort wiederholen" placeholderTextColor={t.faint}
          secureTextEntry onSubmitEditing={submit} returnKeyType="go" style={field} />
      )}

      {err && <Text style={{ color: t.danger, fontSize: 13, marginTop: 2 }}>{err}</Text>}
      <Btn title={busy ? 'Moment...' : mode === 'invite' ? 'Konto anlegen' : 'Anmelden'} onPress={submit} />
      {mode === 'login' && (
        <Text style={{ color: t.faint, fontSize: 12, marginTop: 16, lineHeight: 18 }}>
          Ein Konto entsteht nur ueber einen Einladungslink. Wenn du einen bekommen
          hast, oeffne ihn oder wechsle oben auf "Einladung einloesen".
        </Text>
      )}
    </View>
  );
}
