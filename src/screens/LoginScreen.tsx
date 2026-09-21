import { useState } from 'react'
import { loginSiswa } from '../lib/api'
import { mapErrorMessage } from '../lib/format'
import type { Me } from '../lib/types'
import logo from '../assets/logo-bn.png'
import { MdVisibility, MdVisibilityOff, MdLockOutline, MdMailOutline, MdErrorOutline } from 'react-icons/md'

interface Props {
  onSuccess: (me: Me) => void
}

export default function LoginScreen({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
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

        <form onSubmit={handleSubmit}>
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
          <p className="login-foot">Hubungi admin jika lupa akun • SMK Bagimu Negeriku</p>
        </form>
      </div>
    </div>
  )
}
