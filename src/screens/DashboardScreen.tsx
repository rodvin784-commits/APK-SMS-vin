import { useEffect, useState } from 'react'
import { fetchDashboard } from '../lib/api'
import type { DashboardData } from '../lib/types'
import { formatTanggal, formatJam } from '../lib/format'

interface Props {
  nama: string
  kelas: string
  onOpenTugas: () => void
  onOpenNotifikasi: () => void
}

export default function DashboardScreen({ nama, kelas, onOpenTugas, onOpenNotifikasi }: Props) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let aktif = true
    fetchDashboard()
      .then((d) => {
        if (aktif) setData(d)
      })
      .catch((err) => {
        if (aktif) setError(err instanceof Error ? err.message : 'Gagal memuat dashboard.')
      })
      .finally(() => {
        if (aktif) setLoading(false)
      })
    return () => {
      aktif = false
    }
  }, [])

  if (loading) return <div className="loading">Memuat dashboard...</div>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!data) return null

  return (
    <div className="screen">
      <div className="hero-card">
        <p className="hero-halo">Halo, 👋</p>
        <h2>{nama}</h2>
        <p className="hero-kelas">{kelas}</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card" onClick={onOpenTugas} role="button">
          <span className="stat-angka">{data.counts.tugas}</span>
          <span className="stat-label">Tugas</span>
        </div>
        <div className="stat-card">
          <span className="stat-angka">{data.counts.materi}</span>
          <span className="stat-label">Materi</span>
        </div>
        <div className="stat-card">
          <span className="stat-angka">{data.counts.video}</span>
          <span className="stat-label">Video</span>
        </div>
        <div className="stat-card" onClick={onOpenNotifikasi} role="button">
          <span className="stat-angka">{data.counts.notifikasi_belum_dibaca}</span>
          <span className="stat-label">Notif Baru</span>
        </div>
      </div>

      <section className="section">
        <h3>📅 Jadwal Hari Ini</h3>
        {data.jadwal_hari_ini.length === 0 ? (
          <p className="kosong">Tidak ada jadwal hari ini.</p>
        ) : (
          data.jadwal_hari_ini.map((j) => (
            <div key={j.id} className="item-card">
              <div className="item-jam">
                {formatJam(j.jam_mulai)}–{formatJam(j.jam_selesai)}
              </div>
              <div className="item-body">
                <strong>{j.mapel_nama}</strong>
                <span>{j.guru_nama} · {j.ruangan || '—'}</span>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="section">
        <h3>📝 Tugas Terbaru</h3>
        {data.tugas_terbaru.length === 0 ? (
          <p className="kosong">Belum ada tugas.</p>
        ) : (
          data.tugas_terbaru.map((t) => (
            <div key={t.id} className="item-card" onClick={onOpenTugas} role="button">
              <div className="item-body">
                <strong>{t.judul}</strong>
                <span>{t.mapel_nama} · deadline {formatTanggal(t.deadline)}</span>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="section">
        <h3>📢 Pengumuman Terbaru</h3>
        {data.pengumuman_terbaru.length === 0 ? (
          <p className="kosong">Belum ada pengumuman.</p>
        ) : (
          data.pengumuman_terbaru.map((p) => (
            <div key={p.id} className="item-card">
              <div className="item-body">
                <strong>{p.judul}</strong>
                <span>{p.isi.slice(0, 100)}{p.isi.length > 100 ? '…' : ''}</span>
                <small>{formatTanggal(p.created_at)}</small>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
