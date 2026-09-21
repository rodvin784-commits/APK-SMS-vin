/**
 * WelcomeScreen — Layar sapa setelah login, menampilkan nama & kelas sebelum masuk dashboard.
 * Tombol "Masuk ke Portal" → App.tsx set showWelcome=false.
 */
import logo from '../assets/logo-bn.png'
import Button from '../components/ui/Button'
import { MdVerified, MdSchool, MdAssignment, MdPlayCircleOutline } from 'react-icons/md'
import { toTitleCase } from '../lib/format'

interface Props {
  nama: string
  kelasLabel: string // contoh: "XII RPL 1 · 2024/2025"
  onMasuk: () => void
}

export default function WelcomeScreen({ nama, kelasLabel, onMasuk }: Props) {
  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div className="welcome-badge">
          <MdVerified size={14} color="#0284c7" /> Portal Resmi Siswa
        </div>
        <img src={logo} alt="Logo" className="welcome-logo" />
        <p className="welcome-hello">Selamat Datang Kembali</p>
        <h1 className="welcome-name">{toTitleCase(nama)}</h1>
        <p className="welcome-kelas">{kelasLabel || 'Portal Siswa'}</p>
        <p className="welcome-desc">Akses tugas, materi, video & nilai dalam satu genggaman — tetap semangat belajar!</p>

        <div className="welcome-features">
          <span className="welcome-chip"><MdAssignment size={14} /> Tugas</span>
          <span className="welcome-chip"><MdSchool size={14} /> Materi</span>
          <span className="welcome-chip"><MdPlayCircleOutline size={14} /> Video</span>
        </div>

        <Button onClick={onMasuk} style={{ marginTop: '18px' }}>
          Masuk ke Portal →
        </Button>
        <p className="welcome-foot">SMK Bagimu Negeriku • 2026</p>
      </div>
    </div>
  )
}
