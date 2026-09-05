import { useCallback, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/lib/auth';
import { Tile, Metric, Sub, Chip } from '../src/lib/ui';
import { t } from '../src/lib/theme';

type Row = { id: string; display_name: string; email: string | null; is_admin: boolean; created_at: string };

export default function Admin() {
  const { me } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase.from('profiles')
      .select('id, display_name, email, is_admin, created_at')
      .order('created_at', { ascending: false });
    setRows((data ?? []) as Row[]);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!me?.is_admin) return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 24, justifyContent: 'center' }}>
      <Stack.Screen options={{ title: 'Admin' }} />
      <Sub>Dieser Bereich ist nur fuer Administratoren.</Sub>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Stack.Screen options={{ title: 'Admin' }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Metric label="Nutzer" value={rows.length} />
        <Metric label="Admins" value={rows.filter(r => r.is_admin).length} />
      </View>
      <Tile>
        <Text style={{ color: t.text, fontWeight: '600', marginBottom: 10 }}>Angemeldete Nutzer</Text>
        {rows.map(r => (
          <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center',
            backgroundColor: t.tile2, borderRadius: t.rs, padding: 12, marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 15 }}>{r.display_name}</Text>
              <Text style={{ color: t.faint, fontSize: 12, marginTop: 2 }}>{r.email ?? 'keine E-Mail'}</Text>
              <Text style={{ color: t.faint, fontSize: 11, marginTop: 2 }}>
                seit {new Date(r.created_at).toLocaleDateString('de-DE')}
              </Text>
            </View>
            {r.is_admin && <Chip text="Admin" color={t.accent} />}
          </View>
        ))}
        {rows.length === 0 && <Sub>Noch niemand angemeldet.</Sub>}
      </Tile>
      <Text style={{ color: t.faint, fontSize: 12, lineHeight: 18 }}>
        Praeferenzen anderer Nutzer sind hier bewusst nicht sichtbar. Wer welche
        Angaben macht, bleibt an die Sichtbarkeitseinstellung im Profil gebunden \u2014
        auch fuer Admins.
      </Text>
    </ScrollView>
  );
}
