/**
 * AppHeader — Header atas APK (sticky). Menampilkan judul, toggle tema, notif, avatar, logout.
 * Semua aksi di-inject via props agar mudah di-test & diganti.
 */
import { MdNotificationsNone, MdPerson, MdLogout } from 'react-icons/md'

interface Props {
  title?: string // default: "SMK Bagimu Negeriku"
  unreadCount: number // untuk badge merah di ikon lonceng
  darkMode: boolean
  userName: string // tampil di tooltip avatar
  onToggleDark: () => void
  onOpenNotifikasi: () => void
  onOpenProfile?: () => void
  onLogout: () => void // dipanggil setelah konfirmasi (ditangani di App.tsx)
}

export default function AppHeader({ title = 'SMK Bagimu Negeriku', unreadCount, darkMode, userName, onToggleDark, onOpenNotifikasi, onOpenProfile, onLogout }: Props) {
  return (
    <header className="app-header-new">
      <span className="header-title">{title}</span>
      <div className="header-actions">
        <button className="icon-btn" aria-label={darkMode ? 'Mode terang' : 'Mode gelap'} onClick={onToggleDark} title={darkMode ? 'Mode terang' : 'Mode gelap'}>
          <span style={{ fontSize: '18px' }}>{darkMode ? '☀️' : '🌙'}</span>
        </button>
        <button className="icon-btn" aria-label="Notifikasi" onClick={onOpenNotifikasi}>
          <div style={{ position: 'relative' }}>
            <MdNotificationsNone size={24} color={darkMode ? '#e5e7eb' : '#333'} />
            {unreadCount > 0 && <span className="header-badge" />}
          </div>
        </button>
        <button className="avatar-circle" title={userName} aria-label="Profil" onClick={onOpenProfile} style={{ border: 'none', cursor: onOpenProfile ? 'pointer' : 'default' }}>
          <MdPerson size={16} color="#fff" />
        </button>
        <button className="icon-btn" onClick={onLogout} aria-label="Keluar" title="Keluar">
          <MdLogout size={20} color={darkMode ? '#9ca3af' : '#666'} />
        </button>
      </div>
    </header>
  )
}
