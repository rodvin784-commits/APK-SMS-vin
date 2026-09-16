// Klien Supabase untuk login siswa dari aplikasi.
// Hanya memakai ANON key (aman diekspos) — token sesi dipakai sebagai
// Bearer token ketika memanggil API backend. Service role dilarang di client.
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Sesi disimpan di localStorage WebView: login tetap tercatat setelah app ditutup.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})
