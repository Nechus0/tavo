import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const SB_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
export const SB_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(SB_URL, SB_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
