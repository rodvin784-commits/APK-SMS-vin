/**
 * DashboardScreen — Beranda siswa (mobile). Clean light theme (Tailwind + lucide).
 * Isi: sapaan + badge kelas + tanggal, stat scroll horizontal, jadwal ringkas,
 * tugas terdekat (urut deadline), menu "Lainnya". Data real dari GET /api/siswa/dashboard.
 * Navigasi via props onOpenX dari App.tsx — jangan hardcode navigate di sini.
 */
import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileCheck,
  Info,
  LayoutGrid,
  PlayCircle,
} from 'lucide-react'
import { fetchDashboard } from '../lib/api'
import type { DashboardData } from '../lib/types'
import { formatTanggal, formatJam, mapErrorMessage } from '../lib/format'
import { cacheDashboard, getCachedDashboard } from '../lib/cache'
import Loading from '../components/ui/Loading'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'

function ucapanSelamat(): string {
  const jam = new Date().getHours()
  if (jam < 11) return 'Selamat Pagi'
  if (jam < 15) return 'Selamat Siang'
  if (jam < 19) return 'Selamat Sore'
  return 'Selamat Malam'
}

// Satu baris: "Senin, 28 Sep 2026 • 13:59 WIB" (menyatu di header, bukan kartu).
function formatTanggalSatuBaris(): string {
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const now = new Date()
  const jam = String(now.getHours()).padStart(2, '0')
  const menit = String(now.getMinutes()).padStart(2, '0')
  return `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()} • ${jam}:${menit} WIB`
}

// Badge urgensi deadline (kelas Tailwind agar ikut tema).
function getDeadlineBadge(deadline: string): { text: string; cls: string } {
  const now = new Date()
  const dl = new Date(deadline)
  const diff = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0 || diff <= 3) return { text: diff < 0 ? 'Terlewat' : 'Segera', cls: 'bg-red-50 text-red-600' }
  if (diff <= 7) return { text: `${diff} hari lagi`, cls: 'bg-blue-50 text-blue-600' }
  return { text: formatTanggal(deadline), cls: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300' }
}

// Props: semua handler navigasi berasal dari App.tsx (single source of truth).
interface Props {
  nama: string
  kelas: string
  unreadCount: number
  onOpenTugas: () => void
  onOpenMateri: () => void
  onOpenVideo: () => void
  onOpenNotifikasi: () => void
  onOpenJadwal: () => void
  onOpenPengumuman: () => void
  onOpenPresensi: () => void
}

const cardCls =
  'rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]'
const sectionTitleCls = 'text-sm font-bold text-gray-900 dark:text-[var(--text)]'

export default function DashboardScreen({
  nama,
  kelas,
  unreadCount,
  onOpenTugas,
  onOpenMateri,
  onOpenVideo,
  onOpenNotifikasi,
  onOpenJadwal,
  onOpenPengumuman,
  onOpenPresensi,
}: Props) {
  const [data, setData] = useState<DashboardData | null>(() => getCachedDashboard())
  const [loading, setLoading] = useState(() => !getCachedDashboard())
  const [error, setError] = useState<string | null>(null)
  const [muatUlang, setMuatUlang] = useState(0)
  const ucapan = useMemo(() => ucapanSelamat(), [])
  const [tanggal, setTanggal] = useState(formatTanggalSatuBaris())

  useEffect(() => {
    const interval = setInterval(() => setTanggal(formatTanggalSatuBaris()), 60000)
    return () => clearInterval(interval)
  }, [])

  const muat = () => {
    setError(null)
    if (!data) setLoading(true)
    setMuatUlang((k) => k + 1)
  }

  useEffect(() => {
    async function init() {
      try {
        const d = await fetchDashboard()
        setData(d)
        cacheDashboard(d)
        setError(null)
      } catch (err) {
        if (!data) setError(mapErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muatUlang])

  // Tugas terdekat = urut deadline menaik, ambil 3 (data real, tanpa fetch baru).
  const tugasTerdekat = useMemo(() => {
    if (!data) return []
    return [...data.tugas_terbaru]
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3)
  }, [data])

  if (loading) return <Loading message="Memuat dashboard..." />
  if (error && !data) {
    return (
      <div className="screen">
        <Alert variant="error" action={<Button onClick={muat}>Coba lagi</Button>}>{error}</Alert>
      </div>
    )
  }
  if (!data) return null

  const badgeKelas = [data.kelas.nama_kelas, data.kelas.tahun_ajaran].filter(Boolean).join(' • ') || kelas

  const stats = [
    { label: 'Tugas', count: data.counts.tugas, onOpen: onOpenTugas, box: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300', Icon: ClipboardList },
    { label: 'Materi', count: data.counts.materi, onOpen: onOpenMateri, box: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300', Icon: BookOpen },
    { label: 'Video', count: data.counts.video, onOpen: onOpenVideo, box: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300', Icon: PlayCircle },
    { label: 'Notifikasi', count: unreadCount, onOpen: onOpenNotifikasi, box: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300', Icon: Bell },
  ]

  const lainnya = [
    { label: 'Materi', onOpen: onOpenMateri, box: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300', Icon: BookOpen },
    { label: 'Video', onOpen: onOpenVideo, box: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300', Icon: PlayCircle },
    { label: 'Pengumuman', onOpen: onOpenPengumuman, box: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300', Icon: Info },
    { label: 'Presensi', onOpen: onOpenPresensi, box: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300', Icon: FileCheck },
  ]

  return (
    <div className="space-y-5">
      {/* Sapaan + badge kelas + tanggal (menyatu, tanpa kartu profil ganda) */}
      <section aria-label="Sapaan">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-[var(--text)]">
          {ucapan}, {nama} 👋
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
            {badgeKelas}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-[var(--text-2)]">{tanggal}</p>
      </section>

      {/* Statistik — scroll horizontal, ikon kiri + angka/judul bertumpuk */}
      <section aria-label="Ringkasan">
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {stats.map(({ label, count, onOpen, box, Icon }) => (
            <button
              key={label}
              onClick={onOpen}
              aria-label={`Buka ${label}`}
              className={`${cardCls} flex min-h-[76px] min-w-[148px] flex-1 snap-start items-center gap-3 p-4 text-left transition-shadow hover:shadow active:scale-[0.98]`}
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${box}`} aria-hidden>
                <Icon className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block text-xl font-extrabold leading-tight text-gray-900 dark:text-[var(--text)]">{count}</span>
                <span className="block truncate text-xs font-medium text-gray-500 dark:text-[var(--text-2)]">{label}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Jadwal hari ini — ringkas */}
      <section aria-label="Jadwal hari ini" className={cardCls}>
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-[var(--border)]">
          <CalendarDays className="h-4 w-4 text-blue-600" aria-hidden />
          <h2 className={sectionTitleCls}>Jadwal Hari Ini</h2>
        </div>
        {data.jadwal_hari_ini.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-5 text-center">
            <CalendarDays className="h-9 w-9 text-gray-300 dark:text-gray-600" aria-hidden />
            <p className="mt-2 text-sm text-gray-500 dark:text-[var(--text-2)]">Tidak ada jadwal hari ini</p>
            <button
              onClick={onOpenJadwal}
              className="mt-2 min-h-[44px] rounded-full bg-blue-50 px-4 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300"
            >
              Lihat Besok
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-[var(--border)]">
            {data.jadwal_hari_ini.slice(0, 3).map((j) => (
              <li key={j.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-20 shrink-0 text-xs font-bold text-blue-600 dark:text-blue-300">
                  {formatJam(j.jam_mulai)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-gray-900 dark:text-[var(--text)]">{j.mapel_nama}</span>
                  <span className="block truncate text-xs text-gray-500 dark:text-[var(--text-2)]">{j.guru_nama} · {j.ruangan || '—'}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Tugas terdekat — urut deadline agar layar terisi info berguna */}
      <section aria-label="Tugas terdekat" className={cardCls}>
        <button onClick={onOpenTugas} className="flex min-h-[44px] w-full items-center justify-between px-4 py-3 text-left">
          <span className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-blue-600" aria-hidden />
            <span className={sectionTitleCls}>Tugas Terdekat</span>
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
        </button>
        {tugasTerdekat.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-gray-500 dark:text-[var(--text-2)]">Belum ada tugas.</p>
        ) : (
          <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-[var(--border)] dark:border-[var(--border)]">
            {tugasTerdekat.map((t) => {
              const badge = getDeadlineBadge(t.deadline)
              return (
                <li key={t.id}>
                  <button onClick={onOpenTugas} className="flex min-h-[44px] w-full items-center gap-3 px-4 py-2.5 text-left">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900 dark:text-[var(--text)]">{t.judul}</span>
                      <span className="block truncate text-xs text-gray-500 dark:text-[var(--text-2)]">{t.mapel_nama} • {formatTanggal(t.deadline)}</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badge.cls}`}>{badge.text}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Lainnya — pengganti tab yang keluar dari BottomNav */}
      <section aria-label="Menu lainnya" className={cardCls}>
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-[var(--border)]">
          <LayoutGrid className="h-4 w-4 text-gray-500" aria-hidden />
          <h2 className={sectionTitleCls}>Lainnya</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5 p-4">
          {lainnya.map(({ label, onOpen, box, Icon }) => (
            <button
              key={label}
              onClick={onOpen}
              className="flex min-h-[52px] items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3.5 text-left transition-colors hover:bg-gray-100 dark:border-[var(--border)] dark:bg-white/5 dark:hover:bg-white/10"
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${box}`} aria-hidden>
                <Icon className="h-5 w-5" />
              </span>
              <span className="truncate text-sm font-semibold text-gray-800 dark:text-[var(--text)]">{label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
