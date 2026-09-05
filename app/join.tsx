import { useEffect, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/lib/auth';
import { Btn, H, Sub, Tile } from '../src/lib/ui';
import { t } from '../src/lib/theme';

type Preview = { title: string; host_name: string; people: number };

export default function Join() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { session, displayName, loading, register } = useAuth();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    supabase.rpc('event_preview', { code }).then(({ data }) => {
      setPreview(data?.[0] ?? null);
      if (!data?.[0]) setErr('Diese Einladung gibt es nicht mehr.');
    });
  }, [code]);

  useEffect(() => { if (displayName) setName(displayName); }, [displayName]);

  async function join() {
    setErr(null);
    if (!name.trim()) return setErr('Bitte einen Namen eingeben');
    setBusy(true);
    try {
      if (!session || !displayName) await register(name);
      const { data, error } = await supabase.rpc('join_event', { code });
      if (error) throw error;
      router.replace(`/event/${data}`);
    } catch (e: any) {
      setErr(e.message ?? 'Beitritt fehlgeschlagen');
    } finally { setBusy(false); }
  }

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center' }}>
      <ActivityIndicator color={t.accent} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 24, justifyContent: 'center' }}>
      <Stack.Screen options={{ title: 'Einladung' }} />
      <H>Du bist eingeladen</H>
      {preview && (
        <Tile style={{ marginTop: 16 }}>
          <Text style={{ color: t.text, fontSize: 19, fontWeight: '600' }}>{preview.title}</Text>
          <Sub>{preview.host_name} \u00b7 {preview.people} Zusagen</Sub>
        </Tile>
      )}
      <View style={{ height: 20 }} />
      {!displayName && (
        <>
          <Text style={{ color: t.dim, fontSize: 13, marginBottom: 8 }}>Wie heisst du?</Text>
          <TextInput
            value={name} onChangeText={v => { setName(v); setErr(null); }}
            placeholder="Vorname" placeholderTextColor={t.faint}
            onSubmitEditing={join} returnKeyType="go"
            style={{ backgroundColor: t.tile, borderRadius: t.rs, color: t.text,
                     fontSize: 17, paddingHorizontal: 14, paddingVertical: 13 }} />
        </>
      )}
      {err && <Text style={{ color: t.danger, fontSize: 13, marginTop: 8 }}>{err}</Text>}
      <Btn title={busy ? 'Moment...' : 'Beitreten'} onPress={join} />
      <Text style={{ color: t.faint, fontSize: 12, marginTop: 20, lineHeight: 18 }}>
        Danach traegst du im Profil ein, was du isst und was nicht. Du entscheidest
        pro Eintrag, ob dein Name dazu sichtbar ist.
      </Text>
    </View>
  );
}
