import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import { fetchMe, logoutSiswa } from './lib/api'
import type { Me } from './lib/types'
import { clearAllCache, clearAllCacheIncludingScope, setSiswaScope } from './lib/cache'
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
const PresensiScreen = lazy(() => import('./screens/PresensiScreen'))
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'))
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
  // Pesan info untuk layar login (mis. akun ternyata milik guru) — agar user tidak bingung
  // saat sesi ditolak server. Dibersihkan setiap login sukses.
  const [infoLogin, setInfoLogin] = useState<string | null>(null)
  // Ref ke penukar sesi → dipakai listener deep link OAuth (didefinisikan di effect bawah).
  const masukRef = useRef<() => Promise<void>>(async () => undefined)
  // Anti Welcome ganda: Welcome tampil maksimal sekali per user per ronde login.
  // Duplikat lambat (SIGNED_IN + deep link + polling fallback jalan bareng) hanya
  // menyegarkan sesi tanpa memunculkan Welcome lagi setelah user menutupnya.
  // Direset saat logout agar login berikutnya tetap disapa.
  const sambutanTerkirimRef = useRef<string | null>(null)
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
    let batal = false
    // Tukar sesi Supabase → profil siswa. Dipakai getSession awal, listener SIGNED_IN,
    // dan deep link kembalian OAuth (appUrlOpen) di bawah.
    const masukDenganSesiInner = async () => {
      try {
        const me = await fetchMe()
        try { setSiswaScope(me.siswa.id) } catch { /* abaikan */ }
        if (batal) return
        setInfoLogin(null)
        setSesi({ me, loading: false })
        if (sambutanTerkirimRef.current !== me.siswa.id) {
          sambutanTerkirimRef.current = me.siswa.id
          setShowWelcome(true)
        }
      } catch (err) {
        await supabase.auth.signOut()
        if (batal) return
        const pesan = err instanceof Error ? err.message : 'Gagal memuat profil.'
        // Kasus umum: akun Google milik guru / bukan siswa aktif → jelaskan, jangan diam.
        setInfoLogin(
          /hanya siswa|tidak ditemukan/i.test(pesan)
            ? 'Akun ini terdaftar sebagai guru/admin atau belum jadi siswa aktif. APK ini khusus siswa — guru silakan login via web.'
            : pesan
        )
        setSesi({ me: null, loading: false })
      }
    }
    masukRef.current = masukDenganSesiInner
    const muatSesi = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (batal) return
        if (!session) {
          setSesi({ me: null, loading: false })
          return
        }
        await masukDenganSesiInner()
      } catch {
        if (!batal) setSesi({ me: null, loading: false })
      }
    }
    // Setelah OAuth redirect, penukaran code→sesi (PKCE) bisa selesai SETELAH getSession
    // pertama. Listener ini menutup balapan: sesi yang muncul belakangan tetap diproses.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (batal) return
      if (event === 'SIGNED_IN' && session) {
        void masukDenganSesiInner()
      } else if (event === 'SIGNED_OUT') {
        sambutanTerkirimRef.current = null
        setSesi({ me: null, loading: false })
        setShowWelcome(false)
      }
    })
    void muatSesi()
    return () => { batal = true; subscription.unsubscribe() }
  }, [])

  // Deep link kembalian OAuth Google (native): com.vin.siswa://login-callback
  // Supabase bisa pulang via 2 format: ?code=... (PKCE) atau #access_token=... (implicit).
  // Tangani keduanya → simpan sesi → lanjut seperti login biasa.
  useEffect(() => {
    let hapus: (() => void) | undefined
    ;(async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app')
        const { Browser } = await import('@capacitor/browser')
        const listener = await CapApp.addListener('appUrlOpen', async (event) => {
          try {
            await Browser.close().catch(() => undefined)
            const url = new URL(event.url)
            const code = url.searchParams.get('code')
            if (code) {
              const { error } = await supabase.auth.exchangeCodeForSession(code)
              if (error) {
                setInfoLogin('Login Google gagal: ' + error.message)
                setSesi({ me: null, loading: false })
                return
              }
            } else {
              // Format implicit: token menempel di fragment URL.
              const frag = new URLSearchParams(url.hash.replace(/^#/, ''))
              const access_token = frag.get('access_token')
              const refresh_token = frag.get('refresh_token') ?? ''
              if (!access_token) return
              const { error } = await supabase.auth.setSession({ access_token, refresh_token })
              if (error) {
                setInfoLogin('Login Google gagal: ' + error.message)
                setSesi({ me: null, loading: false })
                return
              }
            }
            await masukRef.current()
          } catch (err) {
            setInfoLogin(err instanceof Error ? err.message : 'Login Google gagal.')
            setSesi({ me: null, loading: false })
          }
        })
        hapus = () => { void listener.remove() }
      } catch { /* bukan native (web dev) — abaikan */ }
    })()
    return () => { hapus?.() }
  }, [])

  // Logout sederhana dengan konfirmasi agar awam tidak salah tap.
  const handleLogout = async () => {
    const yakin = window.confirm('Keluar dari akun? Anda perlu login lagi untuk masuk.')
    if (!yakin) return
    await logoutSiswa()
    clearAllCacheIncludingScope()
    sambutanTerkirimRef.current = null
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
        // Remount tiap pesan berubah agar pesanAwal selalu tampil tanpa effect setState.
        key={infoLogin ?? 'login'}
        pesanAwal={infoLogin}
        onSuccess={(me: Me) => {
          try { setSiswaScope(me.siswa.id); clearAllCache() } catch { /* abaikan */ }
          setInfoLogin(null)
          setSesi({ me, loading: false })
          if (sambutanTerkirimRef.current !== me.siswa.id) {
            sambutanTerkirimRef.current = me.siswa.id
            setShowWelcome(true)
          }
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
      <AppHeader unreadCount={unreadCount} darkMode={darkMode} userName={toTitleCase(me.siswa.nama_lengkap ?? '')} onToggleDark={() => setDarkMode((v) => !v)} onOpenNotifikasi={() => setTab('notifikasi')} onOpenProfile={() => setTab('profile')} />

      <main className="app-main-new">
        <Suspense fallback={<Loading message="Memuat..." />}>
          <>
            {/* P2: conditional render (unmount) untuk hemat memori + polling hanya tab aktif */}
            {tab === 'dashboard' && (
              <DashboardScreen
                nama={toTitleCase(me.siswa.nama_lengkap ?? 'Siswa')}
                kelas={kelasLabel}
                unreadCount={unreadCount}
                onOpenTugas={() => setTab('tugas')}
                onOpenMateri={() => setTab('materi')}
                onOpenVideo={() => setTab('video')}
                onOpenNotifikasi={() => setTab('notifikasi')}
                onOpenJadwal={() => setTab('jadwal')}
                onOpenPengumuman={() => setTab('pengumuman')}
                onOpenPresensi={() => setTab('presensi')}
              />
            )}
            {tab === 'tugas' && <TugasScreen />}
            {tab === 'materi' && <MateriScreen />}
            {tab === 'video' && <VideoScreen />}
            {tab === 'pengumuman' && <PengumumanScreen />}
            {tab === 'jadwal' && <JadwalScreen />}
            {tab === 'nilai' && <NilaiScreen />}
            {tab === 'presensi' && <PresensiScreen />}
            {tab === 'notifikasi' && <NotifikasiScreen onCountChange={setUnreadCount} />}
            {tab === 'profile' && <ProfileScreen me={me} onLogout={handleLogout} />}
          </>
        </Suspense>
      </main>

      <BottomNav activeTab={tab} onChange={setTab} />
    </div>
  )
}
