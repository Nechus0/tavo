import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Alert, TextInput, Pressable, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { inviteUrl } from '../../src/lib/invite';
import { People, RsvpBar, type Person } from '../../src/lib/People';
import { useAuth } from '../../src/lib/auth';
import { Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Tile, Metric, Chip, Btn, Sub } from '../../src/lib/ui';
import { Screen } from '../../src/lib/Screen';
import { t, sev } from '../../src/lib/theme';
import type { EventRow, Requirement, Track } from '../../src/lib/types';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ev, setEv] = useState<EventRow | null>(null);
  const [reqs, setReqs] = useState<Requirement[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [trackName, setTrackName] = useState('');
  const [copied, setCopied] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const { session } = useAuth();

  const load = useCallback(async () => {
    const [e, r, tr, pp] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.rpc('event_requirements', { e: id }),
      supabase.from('tracks').select('*').eq('event_id', id).order('sort_order'),
      supabase.rpc('event_people', { e: id }),
    ]);
    setEv(e.data); setReqs(r.data ?? []); setTracks(tr.data ?? []);
    setPeople((pp.data ?? []) as Person[]);
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function addTrack() {
    if (!trackName.trim()) return;
    const { error } = await supabase.from('tracks')
      .insert({ event_id: id, name: trackName.trim(), sort_order: tracks.length });
    if (error) return Alert.alert('Fehler', error.message);
    setTrackName(''); load();
  }

  async function copyInvite() {
    if (!ev) return;
    const { data, error } = await supabase.rpc('create_invite',
      { p_event_id: ev.id, p_email: null, p_max_uses: null, p_days: 60 });
    if (error) return Alert.alert('Fehler', error.message);
    const text = `Ich plane "${ev.title}" — trag kurz ein, was du isst und was nicht:\n${inviteUrl(data as string)}`;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const isHost = !!ev && !!session && ev.host_id === session.user.id;
  const mine = people.find(p => p.user_id === session?.user.id) ?? null;
  const safety = reqs.filter(r => r.severity === 'safety');
  const firm = reqs.filter(r => r.severity === 'conviction');
  const soft = reqs.filter(r => r.severity === 'taste');

  return (
    <Screen>
      <Stack.Screen options={{ title: ev?.title ?? 'Event' }} />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Metric label="Zusagen" value={people.filter(p => p.rsvp === 'yes').length} />
        <Metric label="Tracks" value={tracks.length} />
        <Metric label="Regeln" value={safety.length + firm.length} />
      </View>

      {mine && <RsvpBar eventId={id!} mine={mine.rsvp} onChange={load} />}

      {safety.length > 0 && (
        <Tile style={{ borderWidth: 1, borderColor: t.danger + '66' }}>
          <Text style={{ color: t.danger, fontWeight: '600', marginBottom: 6 }}>Sicherheit</Text>
          {safety.map(r => (
            <Text key={r.label} style={{ color: t.text, fontSize: 14, marginBottom: 2 }}>
              {r.label}{r.names.length ? ' — ' + r.names.join(', ') : ' — ' + r.people + ' Person(en)'}
            </Text>
          ))}
          <Text style={{ color: t.faint, fontSize: 11, marginTop: 6, lineHeight: 16 }}>
            Die App prüft keine Verpackungen und garantiert keine Kontaminationsfreiheit.
          </Text>
        </Tile>
      )}

      <Tile>
        <Text style={{ color: t.text, fontWeight: '600', marginBottom: 8 }}>Feste Anforderungen</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {firm.map(r => <Chip key={r.label} text={r.label + ' · ' + r.people} color={sev.conviction.color} />)}
          {firm.length === 0 && <Sub>Keine</Sub>}
        </View>
        <Text style={{ color: t.text, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>Geschmack</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {soft.map(r => <Chip key={r.label} text={r.label + ' · ' + r.people} />)}
          {soft.length === 0 && <Sub>Keine</Sub>}
        </View>
      </Tile>

      <Tile>
        <Text style={{ color: t.text, fontWeight: '600', marginBottom: 4 }}>Tracks</Text>
        <Sub>Parallele Lösungen. Grillen und vegan sind gleichwertig, kein Kompromiss.</Sub>
        <View style={{ marginTop: 10, gap: 8 }}>
          {tracks.map(tr => (
            <View key={tr.id} style={{ backgroundColor: t.tile2, borderRadius: t.rs, padding: 12 }}>
              <Text style={{ color: t.text, fontSize: 15, fontWeight: '600' }}>{tr.name}</Text>
              {tr.description ? <Sub>{tr.description}</Sub> : null}
            </View>
          ))}
          {tracks.length === 0 && <Sub>Noch keine Tracks.</Sub>}
        </View>
        {isHost && (
          <>
            <TextInput placeholder="Track hinzufügen, z. B. Vegan" placeholderTextColor={t.faint}
              value={trackName} onChangeText={setTrackName}
              style={{ color: t.text, fontSize: 15, marginTop: 12, paddingVertical: 6 }} />
            <Btn title="Track anlegen" kind="ghost" onPress={addTrack} />
          </>
        )}
      </Tile>

      <People people={people} tracks={tracks} isHost={isHost} onChange={load} />

      {ev && isHost && (
        <Tile>
          <Text style={{ color: t.text, fontWeight: '600' }}>Einladen</Text>
          <Sub>Erzeugt einen Einladungslink und legt ihn in die Zwischenablage — fertig zum Einfügen in WhatsApp. Der Link gilt 60 Tage für beliebig viele Personen.</Sub>
          <Btn title={copied ? 'Link kopiert' : 'Einladungslink kopieren'} onPress={copyInvite} />
        </Tile>
      )}
    </Screen>
  );
}
