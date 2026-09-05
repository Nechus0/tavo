import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuth } from './auth';
import { Btn } from './ui';
import { t } from './theme';

const field = {
  backgroundColor: t.tile, borderRadius: t.rs, color: t.text,
  fontSize: 16, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10,
} as const;

export function AuthForm({ onDone, cta = 'Los' }: { onDone: () => void; cta?: string }) {
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<'up' | 'in'>('up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    if (!email.trim()) return setErr('Bitte eine E-Mail eingeben');
    if (!pw) return setErr('Bitte ein Passwort eingeben');
    if (mode === 'up' && !name.trim()) return setErr('Bitte einen Namen eingeben');
    setBusy(true);
    try {
      if (mode === 'up') await signUp(name, email, pw); else await signIn(email, pw);
      onDone();
    } catch (e: any) { setErr(e.message ?? 'Hat nicht geklappt'); }
    finally { setBusy(false); }
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {(['up', 'in'] as const).map(m => (
          <Pressable key={m} onPress={() => { setMode(m); setErr(null); }} style={{ flex: 1 }}>
            <View style={{
              borderRadius: t.rs, paddingVertical: 9, alignItems: 'center',
              backgroundColor: mode === m ? t.tile2 : 'transparent',
              borderWidth: 1, borderColor: mode === m ? t.line : 'transparent',
            }}>
              <Text style={{ color: mode === m ? t.text : t.faint, fontSize: 14 }}>
                {m === 'up' ? 'Neu hier' : 'Anmelden'}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {mode === 'up' && (
        <TextInput value={name} onChangeText={v => { setName(v); setErr(null); }}
          placeholder="Vorname" placeholderTextColor={t.faint}
          autoCapitalize="words" style={field} />
      )}
      <TextInput value={email} onChangeText={v => { setEmail(v); setErr(null); }}
        placeholder="E-Mail" placeholderTextColor={t.faint}
        autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={field} />
      <TextInput value={pw} onChangeText={v => { setPw(v); setErr(null); }}
        placeholder={mode === 'up' ? 'Passwort, mindestens 8 Zeichen' : 'Passwort'}
        placeholderTextColor={t.faint} secureTextEntry
        onSubmitEditing={submit} returnKeyType="go" style={field} />

      {err && <Text style={{ color: t.danger, fontSize: 13, marginTop: 2 }}>{err}</Text>}
      <Btn title={busy ? 'Moment...' : cta} onPress={submit} />
    </View>
  );
}
