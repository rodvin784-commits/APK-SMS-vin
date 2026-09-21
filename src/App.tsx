import { useEffect, useRef, useState, type ReactNode } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import { fetchMe, fetchNotifikasi, logoutSiswa } from './lib/api'
import type { Me } from './lib/types'
import { clearAllCache } from './lib/cache'
import { requestNotificationPermission, showNotification } from './lib/notification'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import TugasScreen from './screens/TugasScreen'
import MateriScreen from './screens/MateriScreen'
import VideoScreen from './screens/VideoScreen'
import PengumumanScreen from './screens/PengumumanScreen'
import JadwalScreen from './screens/JadwalScreen'
import NilaiScreen from './screens/NilaiScreen'
import NotifikasiScreen from './screens/NotifikasiScreen'
import {
  MdHome,
  MdOutlineAssignment,
  MdBook,
  MdPlayCircleOutline,
  MdInfoOutline,
  MdOutlineCalendarMonth,
  MdEmojiEvents,
  MdNotificationsNone,
  MdPerson,
  MdLogout,
} from 'react-icons/md'

type Tab =
  | 'dashboard'
  | 'tugas'
  | 'materi'
  | 'video'
  | 'pengumuman'
  | 'jadwal'
  | 'nilai'
  | 'notifikasi'

interface TabDef {
  id: Tab
  icon: (active: boolean) => ReactNode
  label: string
}

const TABS: TabDef[] = [
  { id: 'dashboard', icon: (a) => <MdHome size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Home' },
  { id: 'tugas', icon: (a) => <MdOutlineAssignment size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Tugas' },
  { id: 'materi', icon: (a) => <MdBook size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Materi' },
  { id: 'video', icon: (a) => <MdPlayCircleOutline size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Video' },
  { id: 'pengumuman', icon: (a) => <MdInfoOutline size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Info' },
  { id: 'jadwal', icon: (a) => <MdOutlineCalendarMonth size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Jadwal' },
  { id: 'nilai', icon: (a) => <MdEmojiEvents size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Nilai' },
  { id: 'notifikasi', icon: (a) => <MdNotificationsNone size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Notif' },
]

interface Sesi {
  me: Me | null
  loading: boolean
}

export default function App() {
  const [sesi, setSesi] = useState<Sesi>({ me: null, loading: true })
  const [tab, setTab] = useState<Tab>('dashboard')
  const [unreadCount, setUnreadCount] = useState(0)
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('siswa_dark') === '1' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem('siswa_dark', darkMode ? '1' : '0') } catch {}
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const notifiedIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!sesi.me) return

    let cancelled = false

    async function poll() {
      try {
        const { items, belumDibaca } = await fetchNotifikasi()
        if (cancelled) return
        setUnreadCount(belumDibaca)

        const baru = items.filter((n) => !n.is_read && !notifiedIdsRef.current.has(n.id))
        for (const n of baru) {
          notifiedIdsRef.current.add(n.id)
          showNotification(n.judul, n.pesan ?? 'Anda memiliki notifikasi baru.')
        }
      } catch {
        // ignore
      }
    }

    requestNotificationPermission().finally(() => {
      if (!cancelled) poll()
    })

    const interval = setInterval(poll, 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [sesi.me])

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
            supabase.auth.signOut()
            setSesi({ me: null, loading: false })
          })
      })
      .catch(() => setSesi({ me: null, loading: false }))
  }, [])

  const handleLogout = async () => {
    await logoutSiswa()
    clearAllCache()
    setSesi({ me: null, loading: false })
    setTab('dashboard')
  }

  if (sesi.loading) {
    return <div className="loading loading-full">Memuat...</div>
  }

  if (!sesi.me) {
    return (
      <LoginScreen
        onSuccess={(me: Me) => setSesi({ me, loading: false })}
      />
    )
  }

  const me = sesi.me
  const kelasLabel = [me.kelas.nama_kelas, me.kelas.tahun_ajaran]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="app-shell">
      <header className="app-header-new">
        <span className="header-title">SMK Bagimu Negeriku</span>
        <div className="header-actions">
          <button className="icon-btn" aria-label={darkMode ? 'Mode terang' : 'Mode gelap'} onClick={() => setDarkMode((v) => !v)} title={darkMode ? 'Mode terang' : 'Mode gelap'}>
            <span style={{ fontSize: '18px' }}>{darkMode ? '☀️' : '🌙'}</span>
          </button>
          <button className="icon-btn" aria-label="Notifikasi" onClick={() => setTab('notifikasi')}>
            <div style={{ position: 'relative' }}>
              <MdNotificationsNone size={24} color={darkMode ? '#e5e7eb' : '#333'} />
              {unreadCount > 0 && <span className="header-badge" />}
            </div>
          </button>
          <div className="avatar-circle" title={me.siswa.nama_lengkap ?? ''}>
            <MdPerson size={16} color="#fff" />
          </div>
          <button className="icon-btn" onClick={handleLogout} aria-label="Keluar" title="Keluar">
            <MdLogout size={20} color={darkMode ? '#9ca3af' : '#666'} />
          </button>
        </div>
      </header>

      <main className="app-main-new">
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
        {tab === 'notifikasi' && <NotifikasiScreen onCountChange={setUnreadCount} />}
      </main>

      <nav className="bottom-nav-new">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              className={`nav-btn ${active ? 'nav-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span style={{ position: 'relative' }}>
                {t.icon(active)}
                {t.id === 'notifikasi' && unreadCount > 0 && (
                  <span className="nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </span>
              <span className={`nav-label-new ${active ? 'nav-label-active' : ''}`}>{t.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
