import { lazy, Suspense, useEffect, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import { fetchMe, logoutSiswa } from './lib/api'
import type { Me } from './lib/types'
import { clearAllCache } from './lib/cache'
import LoginScreen from './screens/LoginScreen'
import AppHeader from './components/layout/AppHeader'
import BottomNav from './components/layout/BottomNav'
import type { Tab } from './components/layout/BottomNav'
import { usePollingNotifikasi } from './hooks/usePollingNotifikasi'
import Loading from './components/ui/Loading'
import SplashScreen from './components/layout/SplashScreen'
import WelcomeScreen from './screens/WelcomeScreen'
import { toTitleCase } from './lib/format'

// Lazy screens — hanya load saat tab dibuka, initial bundle jadi ringan (minimalis, tidak kurangi UX)
const DashboardScreen = lazy(() => import('./screens/DashboardScreen'))
const TugasScreen = lazy(() => import('./screens/TugasScreen'))
const MateriScreen = lazy(() => import('./screens/MateriScreen'))
const VideoScreen = lazy(() => import('./screens/VideoScreen'))
const PengumumanScreen = lazy(() => import('./screens/PengumumanScreen'))
const JadwalScreen = lazy(() => import('./screens/JadwalScreen'))
const NilaiScreen = lazy(() => import('./screens/NilaiScreen'))
const NotifikasiScreen = lazy(() => import('./screens/NotifikasiScreen'))

interface Sesi {
  me: Me | null
  loading: boolean
}

/**
 * App — Root APK Siswa. Alur: Splash → (cek sesi) → Login → Welcome → AppShell (Header + Main + BottomNav).
 * Struktur folder: src/screens/* = halaman per fitur, src/components/* = UI reusable, src/lib/* = API & util.
 * Untuk pengembang baru: tambah tab baru → 1) tambah di BottomNav.tsx TABS, 2) tambah case di <main> bawah ini.
 */
export default function App() {
  const [sesi, setSesi] = useState<Sesi>({ me: null, loading: true })
  const [tab, setTab] = useState<Tab>('dashboard')
  const [showSplash, setShowSplash] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('siswa_dark') === '1' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem('siswa_dark', darkMode ? '1' : '0') } catch { void 0 }
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const { unreadCount, setUnreadCount } = usePollingNotifikasi(!!sesi.me && !showWelcome && !showSplash)

  // Prefetch tab lain saat idle agar perpindahan terasa instant (tidak tunggu download chunk)
  useEffect(() => {
    if (!sesi.me || showWelcome || showSplash) return
    const idle = (cb: () => void) => {
      if ('requestIdleCallback' in window) (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(cb)
      else setTimeout(cb, 1200)
    }
    idle(() => {
      void import('./screens/TugasScreen')
      void import('./screens/MateriScreen')
      void import('./screens/JadwalScreen')
    })
  }, [sesi.me, showWelcome, showSplash])

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!session) {
          setSesi({ me: null, loading: false })
          return
        }
        return fetchMe()
          .then((me) => {
            setSesi({ me, loading: false })
            setShowWelcome(true)
          })
          .catch(() => {
            supabase.auth.signOut()
            setSesi({ me: null, loading: false })
          })
      })
      .catch(() => setSesi({ me: null, loading: false }))
  }, [])

  // Logout sederhana dengan konfirmasi agar awam tidak salah tap.
  const handleLogout = async () => {
    const yakin = window.confirm('Keluar dari akun? Anda perlu login lagi untuk masuk.')
    if (!yakin) return
    await logoutSiswa()
    clearAllCache()
    setSesi({ me: null, loading: false })
    setShowWelcome(false)
    setTab('dashboard')
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />
  }

  if (sesi.loading) {
    return <Loading full message="Memuat..." />
  }

  if (!sesi.me) {
    return (
      <LoginScreen
        onSuccess={(me: Me) => {
          setSesi({ me, loading: false })
          setShowWelcome(true)
        }}
      />
    )
  }

  if (showWelcome) {
    const welcomeLabel = [sesi.me.kelas.nama_kelas, sesi.me.kelas.tahun_ajaran].filter(Boolean).join(' · ')
    return <WelcomeScreen nama={toTitleCase(sesi.me.siswa.nama_lengkap ?? 'Siswa')} kelasLabel={welcomeLabel} onMasuk={() => setShowWelcome(false)} />
  }

  const me = sesi.me
  const kelasLabel = [me.kelas.nama_kelas, me.kelas.tahun_ajaran]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="app-shell">
      <AppHeader unreadCount={unreadCount} darkMode={darkMode} userName={toTitleCase(me.siswa.nama_lengkap ?? '')} onToggleDark={() => setDarkMode((v) => !v)} onOpenNotifikasi={() => setTab('notifikasi')} onLogout={handleLogout} />

      <main className="app-main-new">
        <Suspense fallback={<Loading message="Memuat..." />}>
          {/* Keep-alive: semua tab tetap mounted agar perpindahan instant, hanya hide via display */}
          <div style={{ display: tab === 'dashboard' ? 'block' : 'none' }}>
            <DashboardScreen
              nama={toTitleCase(me.siswa.nama_lengkap ?? 'Siswa')}
              kelas={kelasLabel}
              onOpenTugas={() => setTab('tugas')}
              onOpenMateri={() => setTab('materi')}
              onOpenVideo={() => setTab('video')}
              onOpenNotifikasi={() => setTab('notifikasi')}
            />
          </div>
          <div style={{ display: tab === 'tugas' ? 'block' : 'none' }}><TugasScreen /></div>
          <div style={{ display: tab === 'materi' ? 'block' : 'none' }}><MateriScreen /></div>
          <div style={{ display: tab === 'video' ? 'block' : 'none' }}><VideoScreen /></div>
          <div style={{ display: tab === 'pengumuman' ? 'block' : 'none' }}><PengumumanScreen /></div>
          <div style={{ display: tab === 'jadwal' ? 'block' : 'none' }}><JadwalScreen /></div>
          <div style={{ display: tab === 'nilai' ? 'block' : 'none' }}><NilaiScreen /></div>
          <div style={{ display: tab === 'notifikasi' ? 'block' : 'none' }}><NotifikasiScreen onCountChange={setUnreadCount} /></div>
        </Suspense>
      </main>

      <BottomNav activeTab={tab} unreadCount={unreadCount} onChange={setTab} />
    </div>
  )
}
