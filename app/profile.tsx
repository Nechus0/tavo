import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/lib/auth';
import { Tile, Btn, Sub, Chip } from '../src/lib/ui';
import { t, sev } from '../src/lib/theme';
import type { Preference, Severity, Visibility } from '../src/lib/types';

const SEVS: Severity[] = ['safety', 'conviction', 'taste'];
const VIS: { k: Visibility; label: string }[] = [
  { k: 'named', label: 'Mit Namen' },
  { k: 'aggregated', label: 'Nur Anzahl' },
  { k: 'host_only', label: 'Nur Gastgeber' },
];

export default function Profile() {
  const { session, me, signOut } = useAuth();
  const [prefs, setPrefs] = useState<Preference[]>([]);
  const [label, setLabel] = useState('');
  const [severity, setSeverity] = useState<Severity>('taste');
  const [visibility, setVisibility] = useState<Visibility>('named');

  const load = useCallback(async () => {
    const { data } = await supabase.from('preferences').select('*').order('severity');
    setPrefs(data ?? []);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function add() {
    if (!label.trim() || !session) return;
    const { error } = await supabase.from('preferences').insert({
      user_id: session.user.id, domain: 'diet', label: label.trim(), severity, visibility,
    });
    if (error) return Alert.alert('Fehler', error.message);
    setLabel(''); load();
  }

  async function remove(id: string) {
    await supabase.from('preferences').delete().eq('id', id); load();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Stack.Screen options={{ title: 'Profil' }} />

      <Tile>
        <Text style={{ color: t.text, fontSize: 17, fontWeight: '600' }}>{me?.display_name}</Text>
        <Sub>{me?.email}</Sub>
      </Tile>

      <Tile>
        <Text style={{ color: t.text, fontWeight: '600', marginBottom: 8 }}>Neue Praeferenz</Text>
        <TextInput placeholder="z. B. Koriander, Erdnuss, vegan" placeholderTextColor={t.faint}
          value={label} onChangeText={setLabel}
          style={{ color: t.text, fontSize: 16, paddingVertical: 6 }} />

        <Sub>Wie hart ist das?</Sub>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {SEVS.map(k => (
            <Pressable key={k} onPress={() => setSeverity(k)}>
              <View style={{
                borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6,
                borderColor: severity === k ? sev[k].color : t.line,
                backgroundColor: severity === k ? sev[k].color + '22' : 'transparent',
              }}>
                <Text style={{ color: severity === k ? sev[k].color : t.dim, fontSize: 13 }}>{sev[k].label}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 10 }} />
        <Sub>Wer darf das sehen?</Sub>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
          {VIS.map(v => (
            <Pressable key={v.k} onPress={() => setVisibility(v.k)}>
              <View style={{
                borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6,
                borderColor: visibility === v.k ? t.accent : t.line,
                backgroundColor: visibility === v.k ? t.accent + '22' : 'transparent',
              }}>
                <Text style={{ color: visibility === v.k ? t.accent : t.dim, fontSize: 13 }}>{v.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        {severity === 'safety' && (
          <Text style={{ color: t.faint, fontSize: 11, marginTop: 10, lineHeight: 16 }}>
            Bei Sicherheitseintraegen wird der Name auch bei "Nur Anzahl" an Mitkochende weitergegeben.
          </Text>
        )}
        <Btn title="Hinzufuegen" onPress={add} />
      </Tile>

      <Tile>
        <Text style={{ color: t.text, fontWeight: '600', marginBottom: 8 }}>Meine Eintraege</Text>
        {prefs.length === 0 && <Sub>Noch nichts eingetragen.</Sub>}
        {prefs.map(p => (
          <Pressable key={p.id} onLongPress={() => remove(p.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: t.tile2, borderRadius: t.rs, padding: 12, marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 15 }}>{p.label}</Text>
                <Text style={{ color: t.faint, fontSize: 11, marginTop: 2 }}>
                  {VIS.find(v => v.k === p.visibility)?.label}
                </Text>
              </View>
              <Chip text={sev[p.severity].label} color={sev[p.severity].color} />
            </View>
          </Pressable>
        ))}
        <Sub>Lange druecken zum Loeschen.</Sub>
      </Tile>

      <Btn title="Abmelden" kind="ghost" onPress={async () => { await signOut(); router.replace('/'); }} />
    </ScrollView>
  );
}
