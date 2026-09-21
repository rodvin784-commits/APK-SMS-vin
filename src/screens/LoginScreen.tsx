import { useState } from 'react'
import { loginSiswa } from '../lib/api'
import { mapErrorMessage } from '../lib/format'
import type { Me } from '../lib/types'
import logo from '../assets/logo-bn.png'

interface Props {
  onSuccess: (me: Me) => void
}

export default function LoginScreen({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        <p className="login-sub">Masuk dengan akun yang diberikan admin sekolah</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>Kata Sandi</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
