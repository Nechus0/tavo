import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, Alert } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/lib/auth';
import { Tile, Btn, Sub } from '../src/lib/ui';
import { t } from '../src/lib/theme';
import type { EventRow } from '../src/lib/types';

export default function Events() {
  const { session, me } = useAuth();
  const [rows, setRows] = useState<EventRow[]>([]);
  const [title, setTitle] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    setRows(data ?? []);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function create() {
    if (!title.trim() || !session) return;
    const { data, error } = await supabase.from('events')
      .insert({ title: title.trim(), host_id: session.user.id }).select().single();
    if (error) return Alert.alert('Fehler', error.message);
    await supabase.from('participants').insert({ event_id: data.id, user_id: session.user.id, rsvp: 'yes' });
    setTitle(''); load();
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 16, alignItems: 'center' }}>
      <View style={{ width: '100%', maxWidth: 460, flex: 1 }}>
      <Stack.Screen options={{ title: 'Events', headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 14 }}>
          {me?.role === 'admin' && (
            <Pressable onPress={() => router.push('/admin')}>
              <Text style={{ color: t.dim }}>Nutzer</Text></Pressable>)}
          <Pressable onPress={() => router.push('/profile')}>
            <Text style={{ color: t.accent }}>Profil</Text></Pressable>
        </View>) }} />
      <Tile>
        <TextInput placeholder="Neues Event, z. B. Grillabend" placeholderTextColor={t.faint}
          value={title} onChangeText={setTitle}
          style={{ color: t.text, fontSize: 16, paddingVertical: 6 }} />
        <Btn title="Anlegen" onPress={create} />
      </Tile>
      <FlatList
        style={{ marginTop: 14 }}
        data={rows}
        keyExtractor={i => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={<Sub>Noch keine Events.</Sub>}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/event/${item.id}`)}>
            <Tile>
              <Text style={{ color: t.text, fontSize: 17, fontWeight: '600' }}>{item.title}</Text>
              <Sub>{item.location ?? 'Kein Ort'}</Sub>
            </Tile>
          </Pressable>
        )} />
      </View>
    </View>
  );
}
