import logo from '../assets/gambar3.png'
import Button from '../components/ui/Button'

interface Props {
  nama: string
  kelasLabel: string
  onMasuk: () => void
  onLogout: () => void
}

export default function WelcomeScreen({ nama, kelasLabel, onMasuk, onLogout }: Props) {
  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <img src={logo} alt="Logo" className="welcome-logo" />
        <p className="welcome-hello">Selamat Datang 👋</p>
        <h1 className="welcome-name">{nama}</h1>
        <p className="welcome-kelas">{kelasLabel || 'Portal Siswa'}</p>
        <p className="welcome-desc">Terus belajar, terus berkembang — raih masa depan yang lebih baik.</p>
        <Button onClick={onMasuk} style={{ marginTop: '18px' }}>
          Masuk ke Portal →
        </Button>
        <button className="welcome-logout" onClick={onLogout}>
          Keluar akun lain
        </button>
      </div>
    </div>
  )
}
