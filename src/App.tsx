import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import { fetchMe, logoutSiswa } from './lib/api'
import type { Me } from './lib/types'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import TugasScreen from './screens/TugasScreen'
import MateriScreen from './screens/MateriScreen'
import VideoScreen from './screens/VideoScreen'
import PengumumanScreen from './screens/PengumumanScreen'
import JadwalScreen from './screens/JadwalScreen'
import NilaiScreen from './screens/NilaiScreen'
import NotifikasiScreen from './screens/NotifikasiScreen'

type Tab =
  | 'dashboard'
  | 'tugas'
  | 'materi'
  | 'video'
  | 'pengumuman'
  | 'jadwal'
  | 'nilai'
  | 'notifikasi'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '🏠', label: 'Home' },
  { id: 'tugas', icon: '📝', label: 'Tugas' },
  { id: 'materi', icon: '📚', label: 'Materi' },
  { id: 'video', icon: '🎬', label: 'Video' },
  { id: 'pengumuman', icon: '📢', label: 'Info' },
  { id: 'jadwal', icon: '📅', label: 'Jadwal' },
  { id: 'nilai', icon: '🏆', label: 'Nilai' },
  { id: 'notifikasi', icon: '🔔', label: 'Notif' },
]

interface Sesi {
  me: Me | null
  loading: boolean
}

export default function App() {
  const [sesi, setSesi] = useState<Sesi>({ me: null, loading: true })
  const [tab, setTab] = useState<Tab>('dashboard')

  // Pulihkan sesi saat app dibuka (persist di localStorage).
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!session) {
          setSesi({ me: null, loading: false })
          return
        }
        return fetchMe()
          .then((me) => setSesi({ me, loading: false }))
          .catch(() => {
            // Token invalid / bukan siswa -> paksa login ulang.
            supabase.auth.signOut()
            setSesi({ me: null, loading: false })
          })
      })
      .catch(() => setSesi({ me: null, loading: false }))
  }, [])

  const handleLogout = async () => {
    await logoutSiswa()
    setSesi({ me: null, loading: false })
    setTab('dashboard')
  }

  if (sesi.loading) {
    return <div className="loading loading-full">Memuat...</div>
  }

  if (!sesi.me) {
    return <LoginScreen onSuccess={() => setSesi({ me: null, loading: true })} />
  }

  const me = sesi.me
  const kelasLabel = [me.kelas.nama_kelas, me.kelas.tahun_ajaran]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">🎓 Portal Siswa</span>
        <button className="btn-logout" onClick={handleLogout} title="Keluar">
          ⏻
        </button>
      </header>

      <main className="app-main">
        {tab === 'dashboard' && (
          <DashboardScreen
            nama={me.siswa.nama_lengkap ?? 'Siswa'}
            kelas={kelasLabel}
            onOpenTugas={() => setTab('tugas')}
            onOpenNotifikasi={() => setTab('notifikasi')}
          />
        )}
        {tab === 'tugas' && <TugasScreen />}
        {tab === 'materi' && <MateriScreen />}
        {tab === 'video' && <VideoScreen />}
        {tab === 'pengumuman' && <PengumumanScreen />}
        {tab === 'jadwal' && <JadwalScreen />}
        {tab === 'nilai' && <NilaiScreen />}
        {tab === 'notifikasi' && <NotifikasiScreen />}
      </main>

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-item ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="nav-icon">{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
