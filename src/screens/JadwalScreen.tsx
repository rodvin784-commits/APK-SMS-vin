import { useEffect, useState } from 'react'
import { fetchJadwal } from '../lib/api'
import type { JadwalItem } from '../lib/types'
import { formatJam } from '../lib/format'

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export default function JadwalScreen() {
  const [jadwal, setJadwal] = useState<JadwalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJadwal()
      .then(setJadwal)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat jadwal.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Memuat jadwal...</div>
  if (error) return <div className="alert alert-error">{error}</div>

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
