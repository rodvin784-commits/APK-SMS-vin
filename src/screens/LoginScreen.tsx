/**
 * LoginScreen — Form masuk siswa (mobile). Input email + password, validasi & pesan error ramah awam.
 * OnSuccess → App.tsx akan set sesi & tampilkan WelcomeScreen.
 */
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchMe, loginSiswa } from '../lib/api'
import { mapErrorMessage } from '../lib/format'
import type { Me } from '../lib/types'
import logo from '../assets/logo-bn.png'
import { MdVisibility, MdVisibilityOff, MdLockOutline, MdMailOutline, MdErrorOutline, MdLogin } from 'react-icons/md'

interface Props {
  onSuccess: (me: Me) => void // callback setelah login berhasil
}

export default function LoginScreen({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleGoogleLogin = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      // Supabase OAuth: akan buka browser sistem (Capacitor) / tab baru (web)
      // Pastikan di Supabase Dashboard → Auth → URL Configuration → Site URL & Redirect URLs sudah tambah
      // capacitor://localhost dan https://smk-bagimu-negeriku.vercel.app/auth/callback
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: { hd: 'smk.belajar.id', prompt: 'select_account' },
        },
      })
      if (error) throw error
      // Setelah redirect balik, App.tsx useEffect getSession + fetchMe akan handle.
      // Untuk flow tanpa redirect (detectSessionInUrl false di supabase.ts), polling singkat:
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 600))
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const me = await fetchMe()
          onSuccess(me)
          return
        }
      }
    } catch (err) {
      setError(mapErrorMessage(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <img src={logo} alt="Logo" className="login-logo" />
        <h1>Portal Siswa</h1>
        <p className="login-sub">Masuk dengan akun yang diberikan admin — aman & terverifikasi</p>

        {error && (
          <div className="alert alert-error">
            <MdErrorOutline size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* 10/10 Primary: Google Belajar (1 tap, tanpa ketik) */}
        <button type="button" onClick={handleGoogleLogin} disabled={googleLoading || loading} className="btn-primary login-btn" style={{ background: '#fff', color: '#1f2937', border: '1.5px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,.06)' }}>
          {googleLoading ? (
            <span className="btn-loading"><span className="btn-spinner" style={{ borderColor: '#e5e7eb', borderTopColor: '#111' }} /> Memproses Google...</span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><MdLogin size={18} /> Masuk dengan Akun Belajar @smk.belajar.id</span>
          )}
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#6b7280', margin: '6px 0 8px' }}>Tanpa ketik email — HP yang sudah login Google langsung 1 tap</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <span style={{ fontSize: 11, color: '#9ca3af' }}>atau</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        </div>

        <details>
          <summary style={{ fontSize: 13, fontWeight: 700, color: '#374151', cursor: 'pointer', listStyle: 'revert' }}>Cara lain: Masuk dengan password</summary>
          <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <label className="field">
            <span>Email</span>
            <div className="field-with-icon">
              <MdMailOutline className="field-icon" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.sch.id"
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
        <p className="login-foot"><a href="https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20lupa%20akun%20belajar" target="_blank" rel="noreferrer" style={{ color: '#0284c7', fontWeight: 700 }}>Hubungi admin via WA</a> jika lupa akun • SMK Bagimu Negeriku</p>
      </div>
    </div>
  )
}
