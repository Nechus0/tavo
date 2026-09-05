import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/lib/auth';
import { AuthForm } from '../src/lib/AuthForm';
import { H, Sub } from '../src/lib/ui';
import { t } from '../src/lib/theme';

export default function Index() {
  const { einladung } = useLocalSearchParams<{ einladung?: string }>();
  const { session, me, loading } = useAuth();

  useEffect(() => { if (!loading && session && me) router.replace('/events'); }, [session, me, loading]);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center' }}>
      <ActivityIndicator color={t.accent} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 24, justifyContent: 'center' }}>
      <H>Tavo</H>
      <Sub>Einmal eintragen, was du isst. Der Rest ergibt sich.</Sub>
      <View style={{ height: 28 }} />
      <AuthForm
        initialToken={einladung ?? ''}
        onDone={ev => router.replace(ev ? `/event/${ev}` : '/events')} />
      <Text style={{ color: t.faint, fontSize: 12, marginTop: 20, lineHeight: 18 }}>
        Es wird keine Bestaetigungsmail verschickt. Allergien und aehnliche Angaben
        sind Gesundheitsdaten \u2014 du entscheidest pro Eintrag, wer sie sieht.
      </Text>
    </View>
  );
}
