// Lapisan API: semua panggilan dari APK ke backend project-tim-vin-vines.
// Setiap request menyertakan Authorization: Bearer <access_token> dari sesi Supabase.
import { supabase } from './supabase'
import { API_BASE_URL } from './env'
import type {
  DashboardData,
  JadwalItem,
  MateriItem,
  Me,
  NilaiItem,
  NotifikasiItem,
  PengumumanItem,
  TugasItem,
  VideoItem,
} from './types'

class ApiRequestError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

async function authHeader(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? `Bearer ${token}` : null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const authorization = await authHeader()
  if (!authorization) {
    throw new ApiRequestError('Sesi berakhir. Silakan login kembali.', 401)
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        Authorization: authorization,
      },
    })
  } catch {
    throw new ApiRequestError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
  }

  if (res.status === 401) {
    await supabase.auth.signOut()
    throw new ApiRequestError('Sesi berakhir. Silakan login kembali.', 401)
  }

  const json = (await res.json().catch(() => null)) as unknown

  if (!res.ok) {
    const message =
      json && typeof json === 'object' && 'error' in json && typeof json.error === 'string'
        ? json.error
        : `Terjadi kesalahan server (${res.status}).`
    throw new ApiRequestError(message, res.status)
  }

  return json as T
}

// ---------- Auth & profil ----------

export async function loginSiswa(email: string, password: string): Promise<Me> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new ApiRequestError(error.message)

  const me = await request<Me>('/api/siswa/me')
  return me
}

export async function logoutSiswa(): Promise<void> {
  await supabase.auth.signOut()
}

export async function fetchMe(): Promise<Me> {
  return request<Me>('/api/siswa/me')
}

// ---------- Dashboard ----------

export function fetchDashboard(): Promise<DashboardData> {
  return request<DashboardData>('/api/siswa/dashboard')
}

// ---------- Tugas ----------

export async function fetchTugas(): Promise<TugasItem[]> {
  const json = await request<{ tugas: TugasItem[] }>('/api/siswa/tugas')
  return json.tugas
}

export async function downloadLampiranTugas(tugasId: string): Promise<{ url: string; nama_file: string | null }> {
  return request('/api/siswa/tugas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: tugasId }),
  })
}

export async function fetchPengumpulan(tugasId: string): Promise<{
  pengumpulan: { id: string; status: string | null; nama_file: string | null; catatan: string | null; submitted_at: string | null } | null
}> {
  const json = await request<{ pengumpulan: TugasItem['pengumpulan'] }>(
    `/api/siswa/pengumpulan?tugas_id=${encodeURIComponent(tugasId)}`
  )
  return { pengumpulan: json.pengumpulan }
}

export async function uploadPengumpulan(
  tugasId: string,
  file: File,
  catatan: string
): Promise<{ message: string; status: string }> {
  const form = new FormData()
  form.append('tugas_id', tugasId)
  form.append('file', file)
  form.append('catatan', catatan)

  const authorization = await authHeader()
  if (!authorization) throw new ApiRequestError('Sesi berakhir. Silakan login kembali.', 401)

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/api/siswa/pengumpulan`, {
      method: 'POST',
      headers: { Authorization: authorization },
      body: form,
    })
  } catch {
    throw new ApiRequestError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
  }

  const json = (await res.json().catch(() => null)) as { message?: string; error?: string; status?: string } | null

  if (!res.ok) {
    throw new ApiRequestError(json?.error ?? `Gagal mengunggah (${res.status}).`, res.status)
  }
  return { message: json?.message ?? 'Berhasil.', status: json?.status ?? '' }
}

export async function downloadJawaban(pengumpulanId: string): Promise<{ url: string; nama_file: string | null }> {
  return request('/api/siswa/pengumpulan/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pengumpulan_id: pengumpulanId }),
  })
}

// ---------- Materi ----------

export async function fetchMateri(): Promise<MateriItem[]> {
  const json = await request<{ materi: MateriItem[] }>('/api/siswa/materi')
  return json.materi
}

export async function downloadMateri(materiId: string): Promise<{ url: string; nama_file: string | null }> {
  return request('/api/siswa/materi/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: materiId }),
  })
}

// ---------- Video ----------

export async function fetchVideo(): Promise<VideoItem[]> {
  const json = await request<{ video: VideoItem[] }>('/api/siswa/video')
  return json.video
}

// ---------- Pengumuman ----------

export async function fetchPengumuman(): Promise<PengumumanItem[]> {
  const json = await request<{ pengumuman: PengumumanItem[] }>('/api/siswa/pengumuman')
  return json.pengumuman
}

// ---------- Jadwal ----------

export async function fetchJadwal(): Promise<JadwalItem[]> {
  const json = await request<{ jadwal: JadwalItem[] }>('/api/siswa/jadwal')
  return json.jadwal
}

// ---------- Nilai ----------

export async function fetchNilai(): Promise<NilaiItem[]> {
  const json = await request<{ nilai: NilaiItem[] }>('/api/siswa/nilai')
  return json.nilai
}

// ---------- Notifikasi ----------

export async function fetchNotifikasi(): Promise<{ items: NotifikasiItem[]; belumDibaca: number }> {
  const json = await request<{ notifikasi: NotifikasiItem[]; belum_dibaca: number }>('/api/siswa/notifikasi')
  return { items: json.notifikasi, belumDibaca: json.belum_dibaca }
}

export async function tandaiNotifikasiDibaca(ids: string[]): Promise<void> {
  await request('/api/siswa/notifikasi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
}
