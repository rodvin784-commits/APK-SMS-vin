/**
 * LoginScreen — Masuk siswa. Alur minimal: Logo → "Portal Siswa" → deskripsi →
 * tombol "Masuk dengan Akun Belajar" → "atau" → "Masuk dengan password" (lipat) →
 * "Lupa akun? Hubungi Admin via WhatsApp".
 * OnSuccess → App.tsx set sesi & tampilkan WelcomeScreen.
 */
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchMe, loginSiswa } from '../lib/api'
import { mapErrorMessage } from '../lib/format'
import type { Me } from '../lib/types'
import logo from '../assets/logo-bn.png'
import { MdVisibility, MdVisibilityOff, MdLockOutline, MdMailOutline, MdErrorOutline, MdArrowForward } from 'react-icons/md'

interface Props {
  onSuccess: (me: Me) => void // callback setelah login berhasil
  pesanAwal?: string | null // info dari App.tsx (mis. sesi ditolak karena akun guru)
}

export default function LoginScreen({ onSuccess, pesanAwal }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(pesanAwal ?? null)
  // Anti Welcome ganda: polling dihentikan saat layar dilepas (sesi sudah
  // ditangani App via deep link/listener) agar onSuccess yatim tidak
  // memunculkan Welcome kedua setelah user ketuk "Masuk ke Portal".
  const dibatalkan = useRef(false)
  useEffect(() => () => { dibatalkan.current = true }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const me = await loginSiswa(email, password)
      onSuccess(me)
    } catch (err) {
      setError(mapErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Login Google via browser sistem (Custom Tabs) + deep link kembali ke APK.
  // Kenapa tidak di WebView langsung: Google menolak OAuth di WebView embedded dan
  // redirect-nya kabur ke website. Deep link com.vin.siswa://login-callback ditangani
  // App.tsx (appUrlOpen → tukar code jadi sesi → cek siswa via /api/siswa/me).
  // WAJIB: daftarkan "com.vin.siswa://login-callback" di Supabase Dashboard →
  // Auth → URL Configuration → Redirect URLs.
  const handleGoogleLogin = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      const { Capacitor } = await import('@capacitor/core')
      const isNative = Capacitor.isNativePlatform()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: isNative ? 'com.vin.siswa://login-callback' : window.location.origin,
          queryParams: { hd: 'smk.belajar.id', prompt: 'select_account' },
          skipBrowserRedirect: true,
        },
      })
      if (error) throw error
      if (!data?.url) throw new Error('URL login Google tidak tersedia. Coba lagi.')
      if (!isNative) {
        // Web dev (npm run dev): redirect biasa, App.tsx getSession yang handle.
        window.location.href = data.url
        return
      }
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({ url: data.url, windowName: '_self' })
      // Fallback: jika deep link gagal kembali (mis. intent-filter belum kepasang),
      // polling sesi — kalau user menyelesaikan login, sesi ikut tersimpan di WebView.
      for (let i = 0; i < 20; i++) {
        if (dibatalkan.current) return
        await new Promise(r => setTimeout(r, 1000))
        if (dibatalkan.current) return
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await Browser.close().catch(() => undefined)
          if (dibatalkan.current) return
          const me = await fetchMe()
          // Cek lagi: layar bisa dilepas selama fetchMe (App sudah menangani sesi),
          // onSuccess di sini akan menghidupkan Welcome kedua.
          if (dibatalkan.current) return
          onSuccess(me)
          return
        }
      }
      await Browser.close().catch(() => undefined)
    } catch (err) {
      setError(mapErrorMessage(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <img src={logo} alt="Logo SMK Bagimu Negeriku" className="login-logo" />
        <h1>Portal Siswa</h1>
        <p className="login-sub">Masuk menggunakan akun yang telah diberikan admin.</p>

        {error && (
          <div className="alert alert-error">
            <MdErrorOutline size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <button type="button" onClick={handleGoogleLogin} disabled={googleLoading || loading} className="btn-primary btn-google login-btn">
          {googleLoading ? (
            <span className="btn-loading"><span className="btn-spinner btn-spinner-dark" /> Memproses...</span>
          ) : (
            <span className="btn-google-label"><MdArrowForward size={18} /> Masuk dengan Akun Belajar</span>
          )}
        </button>

        <div className="login-divider"><span>atau</span></div>

        <details className="login-details">
          <summary>Masuk dengan password</summary>
          <form onSubmit={handleSubmit} className="login-form">
            <label className="field">
              <span>Email</span>
              <div className="field-with-icon">
                <MdMailOutline className="field-icon" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@smk.belajar.id"
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="field">
              <span>Kata Sandi</span>
              <div className="field-with-icon">
                <MdLockOutline className="field-icon" size={18} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="field-eye" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Sembunyikan' : 'Tampilkan'}>
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </label>

            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="btn-spinner" /> Memproses...
                </span>
              ) : (
                'Masuk →'
              )}
            </button>
          </form>
        </details>

        <p className="login-foot">Lupa akun? <a href="https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20lupa%20akun%20belajar" target="_blank" rel="noreferrer">Hubungi Admin via WhatsApp</a></p>
      </div>
    </div>
  )
}
