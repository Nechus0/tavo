import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/lib/auth';
import { Btn, H, Sub } from '../src/lib/ui';
import { t } from '../src/lib/theme';

export default function Index() {
  const { session, loading, signIn } = useAuth();
  useEffect(() => { if (!loading && session) router.replace('/events'); }, [session, loading]);

  if (loading) return <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center' }}><ActivityIndicator color={t.accent} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 24, justifyContent: 'center' }}>
      <H>Tafel</H>
      <Sub>Einmal eintragen, was du isst. Der Rest ergibt sich.</Sub>
      <View style={{ height: 24 }} />
      <Btn title="Mit Google anmelden" onPress={() => signIn().catch(e => console.warn(e))} />
      <Text style={{ color: t.faint, fontSize: 12, marginTop: 16, lineHeight: 18 }}>
        Allergien und ähnliche Angaben sind Gesundheitsdaten. Du entscheidest pro Eintrag, wer sie sieht.
      </Text>
    </View>
  );
}
