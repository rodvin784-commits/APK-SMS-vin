/**
 * AppHeader — Header atas APK (sticky). Lonceng notifikasi + avatar profil saja.
 * Logout pindah ke halaman Profil agar header ringkas. Light theme saja (sama kayak web).
 * Semua aksi di-inject via props agar mudah di-test & diganti.
 */
import { Bell, User } from 'lucide-react'

interface Props {
  title?: string // default: "SMK Bagimu Negeriku"
  unreadCount: number // untuk badge merah di ikon lonceng
  userName: string // tampil di tooltip avatar
  onOpenNotifikasi: () => void
  onOpenProfile?: () => void
}

export default function AppHeader({ title = 'SMK Bagimu Negeriku', unreadCount, userName, onOpenNotifikasi, onOpenProfile }: Props) {
  return (
    <header className="app-header-new">
      <span className="header-title">{title}</span>
      <div className="header-actions">
        <button className="icon-btn" aria-label="Notifikasi" onClick={onOpenNotifikasi}>
          <div style={{ position: 'relative' }}>
            <Bell size={24} color="#333" />
            {unreadCount > 0 && <span className="header-badge" />}
          </div>
        </button>
        <button className="avatar-circle" title={userName} aria-label="Profil" onClick={onOpenProfile} style={{ border: 'none', cursor: onOpenProfile ? 'pointer' : 'default' }}>
          <User size={16} color="#fff" />
        </button>
      </div>
    </header>
  )
}
