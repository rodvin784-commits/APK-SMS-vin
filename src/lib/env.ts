// Konfigurasi koneksi APK siswa ke backend (project-tim-vin-vines).
//
// Buat file .env.local di root APK dengan isi:
//   VITE_API_BASE_URL=http://localhost:3000
//   VITE_SUPABASE_URL=https://<project>.supabase.co
//   VITE_SUPABASE_ANON_KEY=<anon-key>
//
// VITE_API_BASE_URL menunjuk ke Next.js backend. Untuk perangkat fisik,
// ganti localhost dengan IP LAN komputer, mis. http://192.168.1.10:3000.

const raw = import.meta.env

function resolveApiBaseUrl(): string {
  const value = raw.VITE_API_BASE_URL?.replace(/\/$/, '')
  if (import.meta.env.DEV) {
    return value || 'http://localhost:3000'
  }
  // Production: VITE_API_BASE_URL wajib diisi
  if (!value) {
    throw new Error(
      'VITE_API_BASE_URL wajib diisi di environment production.'
    )
  }
  return value
}

export const API_BASE_URL = resolveApiBaseUrl()

export const SUPABASE_URL = raw.VITE_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = raw.VITE_SUPABASE_ANON_KEY ?? ''

export function assertConfig(): void {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY wajib diisi di .env.local APK.'
    )
  }
}
