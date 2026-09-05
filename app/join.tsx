import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/lib/auth';
import { AuthForm } from '../src/lib/AuthForm';
import { Btn, H, Sub, Tile } from '../src/lib/ui';
import { t } from '../src/lib/theme';

type Preview = { title: string; host_name: string; people: number };

export default function Join() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { session, me, loading } = useAuth();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    supabase.rpc('event_preview', { code }).then(({ data }) => {
      setPreview(data?.[0] ?? null);
      if (!data?.[0]) setErr('Diese Einladung gibt es nicht mehr.');
    });
  }, [code]);

  async function join() {
    setBusy(true); setErr(null);
    const { data, error } = await supabase.rpc('join_event', { code });
    setBusy(false);
    if (error) return setErr(error.message);
    router.replace(`/event/${data}`);
  }

  useEffect(() => { if (session && me && preview) join(); }, [session, me, preview]);

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
        <Tile style={{ marginTop: 16, marginBottom: 20 }}>
          <Text style={{ color: t.text, fontSize: 19, fontWeight: '600' }}>{preview.title}</Text>
          <Sub>{preview.host_name} \u00b7 {preview.people} Zusagen</Sub>
        </Tile>
      )}
      {err && <Text style={{ color: t.danger, fontSize: 13, marginBottom: 8 }}>{err}</Text>}

      {session && me
        ? <Btn title={busy ? 'Moment...' : 'Beitreten'} onPress={join} />
        : <AuthForm onDone={join} cta="Beitreten" />}

      <Text style={{ color: t.faint, fontSize: 12, marginTop: 20, lineHeight: 18 }}>
        Danach traegst du im Profil ein, was du isst und was nicht. Du entscheidest
        pro Eintrag, ob dein Name dazu sichtbar ist.
      </Text>
    </View>
  );
}
