/**
 * BelajarScreen — "1 opsi pembelajaran": daftar mapel (tap → masuk) berisi
 * materi + video dari guru mapel tersebut. Grouping di klien by mapel_kode
 * (backend tidak diubah). Tailwind + lucide, light-only, ramah jari 44px+.
 */
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, ChevronRight, Search } from 'lucide-react'
import { fetchMateri, fetchVideo } from '../lib/api'
import type { MateriItem, VideoItem } from '../lib/types'
import { mapErrorMessage } from '../lib/format'
import { cacheMateri, getCachedMateri, cacheVideo, getCachedVideo } from '../lib/cache'
import Loading from '../components/ui/Loading'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import MateriCard from '../components/belajar/MateriCard'
import VideoCard from '../components/belajar/VideoCard'

type TabDetail = 'semua' | 'materi' | 'video'

interface MapelGroup {
  kode: string
  nama: string
  materi: MateriItem[]
  video: VideoItem[]
}

function groupByMapel(materi: MateriItem[], video: VideoItem[]): MapelGroup[] {
  const map = new Map<string, MapelGroup>()
  const key = (kode: string) => (kode?.trim() ? kode.trim().toUpperCase() : 'LAINNYA')
  for (const m of materi) {
    const k = key(m.mapel_kode)
    let g = map.get(k)
    if (!g) { g = { kode: k, nama: m.mapel_nama || k, materi: [], video: [] }; map.set(k, g) }
    if (!g.nama && m.mapel_nama) g.nama = m.mapel_nama
    g.materi.push(m)
  }
  for (const v of video) {
    const k = key(v.mapel_kode)
    let g = map.get(k)
    if (!g) { g = { kode: k, nama: v.mapel_nama || k, materi: [], video: [] }; map.set(k, g) }
    if ((!g.nama || g.nama === k) && v.mapel_nama) g.nama = v.mapel_nama
    g.video.push(v)
  }
  return [...map.values()].sort((a, b) => a.nama.localeCompare(b.nama, 'id'))
}

export default function BelajarScreen() {
  const [materi, setMateri] = useState<MateriItem[]>(() => getCachedMateri() ?? [])
  const [video, setVideo] = useState<VideoItem[]>(() => getCachedVideo() ?? [])
  const [loading, setLoading] = useState(() => !getCachedMateri() && !getCachedVideo())
  const [error, setError] = useState<string | null>(null)
  const [muatUlang, setMuatUlang] = useState(0)
  const [cariMapel, setCariMapel] = useState('')
  const [mapelAktif, setMapelAktif] = useState<string | null>(null)
  const [tabDetail, setTabDetail] = useState<TabDetail>('semua')
  const [cariIsi, setCariIsi] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const [m, v] = await Promise.all([fetchMateri(), fetchVideo()])
        setMateri(m)
        setVideo(v)
        cacheMateri(m)
        cacheVideo(v)
        setError(null)
      } catch (err) {
        const cm = getCachedMateri()
        const cv = getCachedVideo()
        if (cm || cv) {
          setMateri(cm ?? [])
          setVideo(cv ?? [])
          setError('Menampilkan data cache (offline). ' + mapErrorMessage(err))
        } else {
          setError(mapErrorMessage(err))
        }
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [muatUlang])

  const groups = useMemo(() => groupByMapel(materi, video), [materi, video])

  const groupsSaring = useMemo(() => {
    const q = cariMapel.trim().toLowerCase()
    if (!q) return groups
    return groups.filter((g) => g.nama.toLowerCase().includes(q) || g.kode.toLowerCase().includes(q))
  }, [groups, cariMapel])

  const aktif = mapelAktif ? groups.find((g) => g.kode === mapelAktif) ?? null : null

  const isiSaring = useMemo(() => {
    if (!aktif) return { materi: [], video: [] }
    const q = cariIsi.trim().toLowerCase()
    const cocok = (judul: string, deskripsi: string | null) =>
      !q || judul.toLowerCase().includes(q) || (deskripsi ?? '').toLowerCase().includes(q)
    return {
      materi: aktif.materi.filter((m) => cocok(m.judul, m.deskripsi)),
      video: aktif.video.filter((v) => cocok(v.judul, v.deskripsi)),
    }
  }, [aktif, cariIsi])

  const muat = () => {
    setError(null)
    setLoading(true)
    setMuatUlang((k) => k + 1)
  }

  const bukaMapel = (kode: string) => {
    setMapelAktif(kode)
    setTabDetail('semua')
    setCariIsi('')
    setPlayingId(null)
  }

  if (loading) return <Loading message="Memuat pembelajaran..." />
  if (error && materi.length === 0 && video.length === 0) {
    return (
      <div className="screen">
        <Alert variant="error" action={<Button onClick={muat}>Coba lagi</Button>}>{error}</Alert>
      </div>
    )
  }

  // ---- Tingkat 2: isi satu mapel ----
  if (aktif) {
    const tampilMateri = tabDetail !== 'video' ? isiSaring.materi : []
    const tampilVideo = tabDetail !== 'materi' ? isiSaring.video : []
    const kosong = tampilMateri.length === 0 && tampilVideo.length === 0
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapelAktif(null)}
            aria-label="Kembali ke daftar mapel"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-800">{aktif.nama}</h1>
            <p className="text-xs font-medium text-slate-500">
              {aktif.materi.length} materi • {aktif.video.length} video
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1" role="tablist" aria-label="Jenis konten">
          {(['semua', 'materi', 'video'] as TabDetail[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tabDetail === t}
              onClick={() => setTabDetail(t)}
              className={`min-h-[44px] rounded-xl text-sm font-bold capitalize transition-colors ${
                tabDetail === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              {t === 'semua' ? 'Semua' : t}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={cariIsi}
            onChange={(e) => setCariIsi(e.target.value)}
            placeholder="Cari judul di mapel ini…"
            aria-label="Cari di mapel ini"
            className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {kosong ? (
          <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-slate-400 shadow-sm">
            {cariIsi ? 'Tidak cocok dengan pencarian.' : 'Belum ada konten di mapel ini.'}
          </p>
        ) : (
          <div className="space-y-3">
            {tampilVideo.map((v) => (
              <VideoCard key={v.id} v={v} playing={playingId === v.id} onPlay={setPlayingId} />
            ))}
            {tampilMateri.map((m) => (
              <MateriCard key={m.id} m={m} onError={setError} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ---- Tingkat 1: daftar mapel ----
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Belajar</h1>
        <p className="mt-0.5 text-sm text-slate-500">Pilih mapel, lalu lihat materi & videonya.</p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={cariMapel}
          onChange={(e) => setCariMapel(e.target.value)}
          placeholder="Cari mapel… (mis. Laravel)"
          aria-label="Cari mapel"
          className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {groupsSaring.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-slate-400 shadow-sm">
          {cariMapel ? 'Mapel tidak ditemukan.' : 'Belum ada materi atau video.'}
        </p>
      ) : (
        <div className="space-y-3">
          {groupsSaring.map((g) => (
            <button
              key={g.kode}
              onClick={() => bukaMapel(g.kode)}
              aria-label={`Buka ${g.nama}`}
              className="flex min-h-[72px] w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow active:scale-[0.99]"
            >
              <span className="rounded-xl bg-indigo-50 p-3 text-indigo-600" aria-hidden>
                <BookOpen className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-800">{g.nama}</span>
                <span className="mt-0.5 block text-xs font-medium text-slate-500">
                  {g.materi.length} materi • {g.video.length} video
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" aria-hidden />
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
