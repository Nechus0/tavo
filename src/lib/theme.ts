export const t = {
  bg: '#0F1113',
  tile: '#191C1F',
  tile2: '#22262A',
  line: '#2E3338',
  text: '#F2F3F4',
  dim: '#9AA1A8',
  faint: '#6B7278',
  accent: '#5DCAA5',
  warn: '#EF9F27',
  danger: '#E24B4A',
  r: 14,
  rs: 10,
};
export const sev = {
  safety: { label: 'Sicherheit', color: t.danger },
  conviction: { label: 'Fest', color: t.warn },
  taste: { label: 'Geschmack', color: t.dim },
} as const;
