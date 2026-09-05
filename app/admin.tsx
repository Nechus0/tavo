import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/lib/auth';
import { Tile, Metric, Sub, Chip, Btn } from '../src/lib/ui';
import { Screen } from '../src/lib/Screen';
import { t } from '../src/lib/theme';
import { inviteUrl } from '../src/lib/invite';

type Row = {
  id: string; display_name: string; email: string | null;
  role: 'admin' | 'user'; status: 'pending' | 'active' | 'blocked'; created_at: string;
};

export default function Admin() {
  const { me } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.rpc('user_overview');
    setRows((data ?? []) as Row[]);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function newInvite() {
    const { data, error } = await supabase.rpc('create_invite',
      { p_event_id: null, p_email: null, p_max_uses: 1, p_days: 30 });
    if (error) return Alert.alert('Fehler', error.message);
    await Clipboard.setStringAsync(inviteUrl(data as string));
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  }

  async function toggle(r: Row) {
    const next = r.status === 'blocked' ? 'active' : 'blocked';
    const { error } = await supabase.rpc('set_user_state',
      { p_user: r.id, p_role: null, p_status: next });
    if (error) return Alert.alert('Fehler', error.message);
    load();
  }

  if (me?.role !== 'admin') return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 24, justifyContent: 'center' }}>
      <Stack.Screen options={{ title: 'Admin' }} />
      <Sub>Dieser Bereich ist nur für Administratoren.</Sub>
    </View>
  );

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Nutzer' }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Metric label="Nutzer" value={rows.length} />
        <Metric label="Admins" value={rows.filter(r => r.role === 'admin').length} />
        <Metric label="Gesperrt" value={rows.filter(r => r.status === 'blocked').length} />
      </View>

      <Tile>
        <Text style={{ color: t.text, fontWeight: '600' }}>Einladung für eine Person</Text>
        <Sub>Einmal einlösbar, gilt 30 Tage. Ohne Bezug zu einem Event.</Sub>
        <Btn title={copied ? 'Link kopiert' : 'Einladungslink erzeugen'} kind="ghost" onPress={newInvite} />
      </Tile>

      <Tile>
        <Text style={{ color: t.text, fontWeight: '600', marginBottom: 10 }}>Konten</Text>
        {rows.map(r => (
          <Pressable key={r.id} onLongPress={() => toggle(r)}>
            <View style={{ flexDirection: 'row', alignItems: 'center',
              backgroundColor: t.tile2, borderRadius: t.rs, padding: 12, marginBottom: 8,
              opacity: r.status === 'blocked' ? 0.5 : 1 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 15 }}>{r.display_name}</Text>
                <Text style={{ color: t.faint, fontSize: 12, marginTop: 2 }}>{r.email ?? 'keine E-Mail'}</Text>
                <Text style={{ color: t.faint, fontSize: 11, marginTop: 2 }}>
                  seit {new Date(r.created_at).toLocaleDateString('de-DE')}
                </Text>
              </View>
              {r.role === 'admin' && <Chip text="Admin" color={t.accent} />}
              {r.status === 'blocked' && <Chip text="Gesperrt" color={t.danger} />}
            </View>
          </Pressable>
        ))}
        {rows.length === 0 && <Sub>Noch niemand angemeldet.</Sub>}
        <Sub>Lange drücken zum Sperren oder Entsperren.</Sub>
      </Tile>

      <Text style={{ color: t.faint, fontSize: 12, lineHeight: 18 }}>
        Präferenzen anderer Nutzer sind hier bewusst nicht sichtbar. Wer "nur Anzahl"
        einstellt, verlässt sich darauf — auch gegenüber Administratoren.
      </Text>
    </Screen>
  );
}
