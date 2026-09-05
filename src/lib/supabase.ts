import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Fallback, damit der Build auch ohne gesetzte Umgebungsvariablen laeuft.
// Der Publishable Key ist oeffentlich vorgesehen: geschuetzt wird über die
// Row-Level-Security-Regeln in der Datenbank, nicht über Geheimhaltung.
const URL_FALLBACK = 'https://doyfaavfzqftbduvkhle.supabase.co';
const KEY_FALLBACK = 'sb_publishable_FSno2CWGTFdLf5Sv4DfTCw_KCVR5Vc1';

export const SB_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || URL_FALLBACK;
export const SB_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || KEY_FALLBACK;

export const supabase = createClient(SB_URL, SB_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
