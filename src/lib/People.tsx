import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { supabase } from './supabase';
import { Tile, Sub } from './ui';
import { t } from './theme';
import type { Track } from './types';

export type Rsvp = 'invited' | 'yes' | 'no' | 'maybe';
export type Person = {
  participant_id: string; user_id: string | null; name: string;
  rsvp: Rsvp; is_host: boolean; track_id: string | null;
};

const LABEL: Record<Rsvp, string> = {
  invited: 'offen', yes: 'dabei', no: 'abgesagt', maybe: 'vielleicht',
};
const COLOR: Record<Rsvp, string> = {
  invited: t.faint, yes: t.accent, no: t.danger, maybe: t.warn,
};

export function People({ people, tracks, isHost, onChange }: {
  people: Person[]; tracks: Track[]; isHost: boolean; onChange: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);

  async function assign(pid: string, trackId: string | null) {
    const { error } = await supabase.rpc('set_track', { p_participant: pid, p_track: trackId });
    if (error) return Alert.alert('Fehler', error.message);
    setOpen(null); onChange();
  }

  return (
    <Tile>
      <Text style={{ color: t.text, fontWeight: '600', marginBottom: 4 }}>Wer kommt</Text>
      {isHost && tracks.length > 0 && <Sub>Antippen, um jemanden einem Track zuzuordnen.</Sub>}
      <View style={{ marginTop: 10, gap: 8 }}>
        {people.map(p => {
          const track = tracks.find(x => x.id === p.track_id);
          return (
            <View key={p.participant_id}>
              <Pressable
                disabled={!isHost || tracks.length === 0}
                onPress={() => setOpen(open === p.participant_id ? null : p.participant_id)}>
                <View style={{ flexDirection: 'row', alignItems: 'center',
                  backgroundColor: t.tile2, borderRadius: t.rs, padding: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text, fontSize: 15 }}>
                      {p.name}{p.is_host ? '  \u00b7  Gastgeber' : ''}
                    </Text>
                    <Text style={{ color: track ? t.accent : t.faint, fontSize: 12, marginTop: 2 }}>
                      {track ? track.name : 'kein Track'}
                    </Text>
                  </View>
                  <Text style={{ color: COLOR[p.rsvp], fontSize: 13 }}>{LABEL[p.rsvp]}</Text>
                </View>
              </Pressable>
              {open === p.participant_id && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 6 }}>
                  {tracks.map(tr => (
                    <Pressable key={tr.id} onPress={() => assign(p.participant_id, tr.id)}>
                      <View style={{ borderWidth: 1, borderColor: t.line, borderRadius: 999,
                        paddingHorizontal: 12, paddingVertical: 6 }}>
                        <Text style={{ color: t.text, fontSize: 13 }}>{tr.name}</Text>
                      </View>
                    </Pressable>
                  ))}
                  <Pressable onPress={() => assign(p.participant_id, null)}>
                    <View style={{ borderWidth: 1, borderColor: t.line, borderRadius: 999,
                      paddingHorizontal: 12, paddingVertical: 6 }}>
                      <Text style={{ color: t.faint, fontSize: 13 }}>keiner</Text>
                    </View>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
        {people.length === 0 && <Sub>Noch niemand dabei.</Sub>}
      </View>
    </Tile>
  );
}

export function RsvpBar({ eventId, mine, onChange }: {
  eventId: string; mine: Rsvp | null; onChange: () => void;
}) {
  async function set(v: Rsvp) {
    const { error } = await supabase.rpc('set_rsvp', { e: eventId, p_rsvp: v });
    if (error) return Alert.alert('Fehler', error.message);
    onChange();
  }
  return (
    <Tile>
      <Text style={{ color: t.text, fontWeight: '600', marginBottom: 8 }}>Bist du dabei?</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['yes', 'maybe', 'no'] as const).map(v => (
          <Pressable key={v} onPress={() => set(v)} style={{ flex: 1 }}>
            <View style={{
              borderRadius: t.rs, paddingVertical: 10, alignItems: 'center', borderWidth: 1,
              borderColor: mine === v ? COLOR[v] : t.line,
              backgroundColor: mine === v ? COLOR[v] + '22' : 'transparent',
            }}>
              <Text style={{ color: mine === v ? COLOR[v] : t.dim, fontSize: 14 }}>{LABEL[v]}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Tile>
  );
}
