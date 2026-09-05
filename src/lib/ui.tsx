import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { t } from './theme';

export const Tile = ({ children, style }: any) => <View style={[s.tile, style]}>{children}</View>;

export const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <View style={[s.tile, { flex: 1, paddingVertical: 12 }]}>
    <Text style={s.metricLabel}>{label}</Text>
    <Text style={s.metricValue}>{value}</Text>
  </View>
);

export const Chip = ({ text, color = t.dim }: { text: string; color?: string }) => (
  <View style={[s.chip, { borderColor: color + '55' }]}>
    <Text style={{ color, fontSize: 12 }}>{text}</Text>
  </View>
);

export const Btn = ({ title, onPress, kind = 'primary' }: any) => (
  <Pressable onPress={onPress} style={({ pressed }) => [
    s.btn, kind === 'primary' ? { backgroundColor: t.accent } : { borderWidth: 1, borderColor: t.line },
    pressed && { opacity: 0.7 }]}>
    <Text style={{ color: kind === 'primary' ? '#04342C' : t.text, fontWeight: '600', fontSize: 15 }}>{title}</Text>
  </Pressable>
);

export const H = ({ children }: any) => <Text style={s.h}>{children}</Text>;
export const Sub = ({ children }: any) => <Text style={s.sub}>{children}</Text>;

const s = StyleSheet.create({
  tile: { backgroundColor: t.tile, borderRadius: t.r, padding: 14 },
  metricLabel: { color: t.faint, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 },
  metricValue: { color: t.text, fontSize: 26, fontWeight: '600', marginTop: 2 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  btn: { borderRadius: t.rs, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  h: { color: t.text, fontSize: 24, fontWeight: '700', letterSpacing: -0.4 },
  sub: { color: t.dim, fontSize: 13, marginTop: 2 },
});
