import { useEffect, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/lib/auth';
import { Btn, H, Sub } from '../src/lib/ui';
import { t } from '../src/lib/theme';

export default function Index() {
  const { session, displayName, loading, register } = useAuth();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session && displayName) router.replace('/events');
  }, [session, displayName, loading]);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center' }}>
      <ActivityIndicator color={t.accent} />
    </View>
  );

  async function go() {
    setErr(null);
    if (!name.trim()) return setErr('Bitte einen Namen eingeben');
    setBusy(true);
    try { await register(name); router.replace('/events'); }
    catch (e: any) { setErr(e.message ?? 'Anmeldung fehlgeschlagen'); }
    finally { setBusy(false); }
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 24, justifyContent: 'center' }}>
      <H>Prefme</H>
      <Sub>Einmal eintragen, was du isst. Der Rest ergibt sich.</Sub>
      <View style={{ height: 28 }} />
      <Text style={{ color: t.dim, fontSize: 13, marginBottom: 8 }}>Wie heisst du?</Text>
      <TextInput
        value={name} onChangeText={v => { setName(v); setErr(null); }}
        placeholder="Vorname" placeholderTextColor={t.faint}
        onSubmitEditing={go} returnKeyType="go"
        style={{ backgroundColor: t.tile, borderRadius: t.rs, color: t.text,
                 fontSize: 17, paddingHorizontal: 14, paddingVertical: 13 }} />
      {err && <Text style={{ color: t.danger, fontSize: 13, marginTop: 8 }}>{err}</Text>}
      <Btn title={busy ? 'Moment...' : 'Los'} onPress={go} />
      <Text style={{ color: t.faint, fontSize: 12, marginTop: 20, lineHeight: 18 }}>
        Kein Passwort noetig. Dein Zugang haengt an diesem Browser \u2014 loeschst du die
        Browserdaten oder wechselst das Geraet, brauchst du eine neue Einladung.
      </Text>
    </View>
  );
}
