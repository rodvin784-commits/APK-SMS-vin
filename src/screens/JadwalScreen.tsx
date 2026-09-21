import { useEffect, useState } from 'react'
import { fetchJadwal } from '../lib/api'
import type { JadwalItem } from '../lib/types'
import { formatJam, mapErrorMessage } from '../lib/format'
import { cacheJadwal, getCachedJadwal } from '../lib/cache'

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

  if (loading) return <div className="loading">Memuat jadwal...</div>
  if (error) {
    return (
      <div className="screen">
        <div className="alert alert-error">{error}</div>
        <button className="btn-primary" onClick={muat}>Coba lagi</button>
      </div>
    )
  }

  return (
    <div className="screen">
      {jadwal.length === 0 ? (
        <p className="kosong">Belum ada jadwal.</p>
      ) : (
        HARI.filter((h) => jadwal.some((j) => j.hari === h)).map((hari) => (
          <section key={hari} className="section">
            <h3>{hari}</h3>
            {jadwal
              .filter((j) => j.hari === hari)
              .map((j) => (
                <div key={j.id} className="item-card">
                  <div className="item-jam">
                    {formatJam(j.jam_mulai)}
                    <br />
                    {formatJam(j.jam_selesai)}
                  </div>
                  <div className="item-body">
                    <strong>{j.mapel_nama}</strong>
                    <span>{j.guru_nama} · {j.ruangan || '—'}</span>
                  </div>
                </div>
              ))}
          </section>
        ))
      )}
    </div>
  )
}
