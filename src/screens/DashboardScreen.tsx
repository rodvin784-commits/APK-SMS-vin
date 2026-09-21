import { useEffect, useMemo, useState } from 'react'
import { fetchDashboard } from '../lib/api'
import type { DashboardData } from '../lib/types'
import { formatTanggal, formatJam, mapErrorMessage } from '../lib/format'
import {
  MdAssignment,
  MdBook,
  MdPlayCircleOutline,
  MdNotifications,
  MdCalendarMonth,
  MdCalendarToday,
  MdChevronRight,
  MdCampaign,
  MdSchool,
} from 'react-icons/md'

function ucapanSelamat(): string {
  const jam = new Date().getHours()
  if (jam < 11) return 'Selamat Pagi'
  if (jam < 15) return 'Selamat Siang'
  if (jam < 19) return 'Selamat Sore'
  return 'Selamat Malam'
}

function formatTanggalLengkap(): string {
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const now = new Date()
  const h = hari[now.getDay()]
  const t = now.getDate()
  const b = bulan[now.getMonth()]
  const th = now.getFullYear()
  const jam = String(now.getHours()).padStart(2, '0')
  const menit = String(now.getMinutes()).padStart(2, '0')
  return `${h}, ${t} ${b} ${th}\n${jam}:${menit} WIB`
}

function getDeadlineBadge(deadline: string): { text: string; color: string; bg: string } {
  const now = new Date()
  const dl = new Date(deadline)
  const diff = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { text: 'Terlewat', color: '#F44336', bg: '#FFEBEE' }
  if (diff <= 3) return { text: 'Segera', color: '#F44336', bg: '#FFEBEE' }
  if (diff <= 7) return { text: `${diff} hari lagi`, color: '#2196F3', bg: '#E3F2FD' }
  return { text: formatTanggal(deadline), color: '#6B7280', bg: '#F3F4F6' }
}

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
  const [muatUlang, setMuatUlang] = useState(0)
  const ucapan = useMemo(() => ucapanSelamat(), [])
  const [tanggal, setTanggal] = useState(formatTanggalLengkap())

  useEffect(() => {
    const interval = setInterval(() => {
      setTanggal(formatTanggalLengkap())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const muat = () => {
    setLoading(true)
    setMuatUlang((k) => k + 1)
  }

  useEffect(() => {
    async function init() {
      try {
        const d = await fetchDashboard()
        setData(d)
        setError(null)
      } catch (err) {
        setError(mapErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [muatUlang])

  if (loading) return <div className="loading">Memuat dashboard...</div>
  if (error) {
    return (
      <div className="screen">
        <div className="alert alert-error">{error}</div>
        <button className="btn-primary" onClick={muat}>Coba lagi</button>
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="dashboard-screen">
      {/* Greeting Section */}
      <div className="greeting-container">
        <div className="greeting-left">
          <p className="greeting-text">{ucapan},</p>
          <h2 className="user-name">{nama} 👋</h2>
          <p className="welcome-text">Selamat datang di Portal Siswa</p>
        </div>
        <div className="date-container">
          <MdCalendarToday size={14} color="#666" />
          <span className="date-text">{tanggal}</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-text">
          <span className="hero-subtitle">{kelas}</span>
          <h3 className="hero-title">{nama}</h3>
          <p className="hero-desc">Terus belajar, terus berkembang,{'\n'}raih masa depan yang lebih baik.</p>
        </div>
        <MdSchool size={60} color="#fff" className="hero-icon" />
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <button className="stat-card stat-tugas" onClick={onOpenTugas}>
          <div className="stat-header">
            <MdAssignment size={24} color="#2196F3" />
            <MdChevronRight size={20} color="#999" />
          </div>
          <span className="stat-count">{data.counts.tugas}</span>
          <span className="stat-title">Tugas</span>
        </button>
        <button className="stat-card stat-materi" onClick={() => {}}>
          <div className="stat-header">
            <MdBook size={24} color="#4CAF50" />
            <MdChevronRight size={20} color="#999" />
          </div>
          <span className="stat-count">{data.counts.materi}</span>
          <span className="stat-title">Materi</span>
        </button>
        <button className="stat-card stat-video" onClick={() => {}}>
          <div className="stat-header">
            <MdPlayCircleOutline size={24} color="#9C27B0" />
            <MdChevronRight size={20} color="#999" />
          </div>
          <span className="stat-count">{data.counts.video}</span>
          <span className="stat-title">Video</span>
        </button>
        <button className="stat-card stat-notif" onClick={onOpenNotifikasi}>
          <div className="stat-header">
            <MdNotifications size={24} color="#FF9800" />
            <MdChevronRight size={20} color="#999" />
          </div>
          <span className="stat-count">{data.counts.notifikasi_belum_dibaca}</span>
          <span className="stat-title">Notifikasi Baru</span>
        </button>
      </div>

      {/* Jadwal Hari Ini */}
      <div className="section-header">
        <div className="section-header-left">
          <MdCalendarMonth size={20} color="#2196F3" />
          <h3 className="section-title">Jadwal Hari Ini</h3>
        </div>
      </div>
      {data.jadwal_hari_ini.length === 0 ? (
        <div className="empty-card">
          <MdCalendarToday size={48} color="#D1D5DB" />
          <p className="empty-text">Tidak ada jadwal hari ini.</p>
        </div>
      ) : (
        data.jadwal_hari_ini.map((j) => (
          <div key={j.id} className="jadwal-card">
            <div className="jadwal-time">
              <span>{formatJam(j.jam_mulai)}</span>
              <span>-</span>
              <span>{formatJam(j.jam_selesai)}</span>
            </div>
            <div className="jadwal-info">
              <strong>{j.mapel_nama}</strong>
              <span>{j.guru_nama} · {j.ruangan || '—'}</span>
            </div>
          </div>
        ))
      )}

      {/* Tugas Terbaru */}
      <div className="section-header">
        <div className="section-header-left">
          <MdAssignment size={20} color="#2196F3" />
          <h3 className="section-title">Tugas Terbaru</h3>
        </div>
        <button className="see-all" onClick={onOpenTugas}>Lihat Semua →</button>
      </div>
      {data.tugas_terbaru.length === 0 ? (
        <div className="empty-card">
          <MdAssignment size={48} color="#D1D5DB" />
          <p className="empty-text">Belum ada tugas.</p>
        </div>
      ) : (
        data.tugas_terbaru.slice(0, 3).map((t) => {
          const badge = getDeadlineBadge(t.deadline)
          return (
            <div key={t.id} className="task-card" onClick={onOpenTugas} role="button">
              <div className="icon-box icon-box-blue">
                <MdAssignment size={24} color="#2196F3" />
              </div>
              <div className="card-content">
                <span className="card-title">{t.judul}</span>
                <span className="card-subtitle">{t.mapel_nama} | {t.guru_nama} • deadline {formatTanggal(t.deadline)}</span>
              </div>
              <span className="task-badge" style={{ backgroundColor: badge.bg, color: badge.color }}>{badge.text}</span>
              <MdChevronRight size={24} color="#999" />
            </div>
          )
        })
      )}

      {/* Pengumuman Terbaru */}
      <div className="section-header">
        <div className="section-header-left">
          <MdCampaign size={20} color="#2196F3" />
          <h3 className="section-title">Pengumuman Terbaru</h3>
        </div>
      </div>
      {data.pengumuman_terbaru.length === 0 ? (
        <div className="empty-card">
          <MdCampaign size={48} color="#D1D5DB" />
          <p className="empty-text">Belum ada pengumuman.</p>
        </div>
      ) : (
        data.pengumuman_terbaru.slice(0, 3).map((p) => (
          <div key={p.id} className="announcement-card">
            <div className="icon-box icon-box-purple">
              <MdCampaign size={24} color="#9C27B0" />
            </div>
            <div className="card-content">
              <span className="card-title">{p.judul}</span>
              <span className="card-subtitle">{p.isi.slice(0, 60)}{p.isi.length > 60 ? '…' : ''}</span>
              <span className="card-date">📅 {formatTanggal(p.created_at)}</span>
            </div>
            <MdChevronRight size={24} color="#999" />
          </div>
        ))
      )}

      <div style={{ height: 20 }} />
    </div>
  )
}
