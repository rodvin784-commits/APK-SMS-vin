import { useEffect, useState } from 'react'
import { fetchJadwal } from '../lib/api'
import type { JadwalItem } from '../lib/types'
import { formatJam, mapErrorMessage } from '../lib/format'
import { cacheJadwal, getCachedJadwal } from '../lib/cache'
import Loading from '../components/ui/Loading'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { MdCalendarToday } from 'react-icons/md'

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export default function JadwalScreen() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [muatUlang, setMuatUlang] = useState(0)

  useEffect(() => {
    async function init() {
      const cached = getCachedJadwal()
      try {
        const data = await fetchJadwal()
        setJadwal(data)
        cacheJadwal(data)
        setError(null)
      } catch (err) {
        if (cached) {
          setJadwal(cached)
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

  const muat = () => {
    setLoading(true)
    setMuatUlang((k) => k + 1)
  }

  if (loading) return <Loading message="Memuat jadwal..." />
  if (error) {
    return (
      <div className="screen">
        <Alert variant="error" action={<Button variant="secondary" onClick={muat}>Coba lagi</Button>}>{error}</Alert>
      </div>
    )
  }

  if (jadwal.length === 0) return <div className="screen"><EmptyState message="Belum ada jadwal untuk kelas Anda." icon={<MdCalendarToday size={42} color="#cbd5e1" />} /></div>

  return (
    <div className="screen">
      {HARI.filter((h) => jadwal.some((j) => j.hari === h)).map((hari) => (
        <section key={hari} className="section">
          <h3>{hari}</h3>
          {jadwal.filter((j) => j.hari === hari).map((j) => (
            <div key={j.id} className="jadwal-card">
              <div className="jadwal-time">
                <span>{formatJam(j.jam_mulai)}</span>
                <span>—</span>
                <span>{formatJam(j.jam_selesai)}</span>
              </div>
              <div className="jadwal-info">
                <strong>{j.mapel_nama}</strong>
                <span>{j.guru_nama} · {j.ruangan || '—'}</span>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
