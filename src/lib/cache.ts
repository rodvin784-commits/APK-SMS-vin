import type { TugasItem, MateriItem, JadwalItem, DashboardData, VideoItem, PengumumanItem, NilaiItem } from './types'

const CACHE_PREFIX = 'siswa_cache_'
const CACHE_EXPIRY_MS = 5 * 60 * 1000 // 5 menit

interface CacheEntry<T> {
  data: T
  timestamp: number
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() }
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry))
  } catch {
    // localStorage penuh atau tidak tersedia, abaikan
  }
}

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX))
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    // abaikan
  }
}

// Tugas
export function cacheTugas(data: TugasItem[]): void {
  setCache('tugas', data)
}

export function getCachedTugas(): TugasItem[] | null {
  return getCache<TugasItem[]>('tugas')
}

// Materi
export function cacheMateri(data: MateriItem[]): void {
  setCache('materi', data)
}

export function getCachedMateri(): MateriItem[] | null {
  return getCache<MateriItem[]>('materi')
}

// Jadwal
export function cacheJadwal(data: JadwalItem[]): void {
  setCache('jadwal', data)
}

export function getCachedJadwal(): JadwalItem[] | null {
  return getCache<JadwalItem[]>('jadwal')
}

// Dashboard — cache ringan agar perpindahan tab instant (stale-while-revalidate)
export function cacheDashboard(data: DashboardData): void {
  setCache('dashboard', data)
}
export function getCachedDashboard(): DashboardData | null {
  return getCache<DashboardData>('dashboard')
}

// Video
export function cacheVideo(data: VideoItem[]): void {
  setCache('video', data)
}
export function getCachedVideo(): VideoItem[] | null {
  return getCache<VideoItem[]>('video')
}
export function cachePengumuman(data: PengumumanItem[]): void {
  setCache('pengumuman', data)
}
export function getCachedPengumuman(): PengumumanItem[] | null {
  return getCache<PengumumanItem[]>('pengumuman')
}
export function cacheNilai(data: NilaiItem[]): void {
  setCache('nilai', data)
}
export function getCachedNilai(): NilaiItem[] | null {
  return getCache<NilaiItem[]>('nilai')
}
