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
    // WAJIB true untuk login Google: setelah OAuth redirect kembali ke WebView
    // (http://localhost/?code=...), client harus menukar code PKCE jadi sesi.
    // Dengan false, polling getSession tidak akan pernah menemukan sesi baru.
    detectSessionInUrl: true,
    // Minta alur PKCE (?code=...) ke Supabase. Catatan: server kadang tetap pulang
    // via fragment (#access_token=...) untuk deep link custom scheme — App.tsx
    // menangani KEDUA format di listener appUrlOpen, jadi login tidak mentok.
    flowType: 'pkce',
  },
})
