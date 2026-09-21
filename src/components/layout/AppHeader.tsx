import { MdNotificationsNone, MdPerson, MdLogout } from 'react-icons/md'

interface Props {
  title?: string
  unreadCount: number
  darkMode: boolean
  userName: string
  onToggleDark: () => void
  onOpenNotifikasi: () => void
  onLogout: () => void
}

export default function AppHeader({ title = 'SMK Bagimu Negeriku', unreadCount, darkMode, userName, onToggleDark, onOpenNotifikasi, onLogout }: Props) {
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
        <div className="avatar-circle" title={userName}>
          <MdPerson size={16} color="#fff" />
        </div>
        <button className="icon-btn" onClick={onLogout} aria-label="Keluar" title="Keluar">
          <MdLogout size={20} color={darkMode ? '#9ca3af' : '#666'} />
        </button>
      </div>
    </header>
  )
}
