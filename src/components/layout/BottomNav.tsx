/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import { MdHome, MdOutlineAssignment, MdBook, MdPlayCircleOutline, MdInfoOutline, MdOutlineCalendarMonth, MdEmojiEvents, MdNotificationsNone } from 'react-icons/md'

export type Tab = 'dashboard' | 'tugas' | 'materi' | 'video' | 'pengumuman' | 'jadwal' | 'nilai' | 'notifikasi'

interface TabDef {
  id: Tab
  icon: (active: boolean) => ReactNode
  label: string
}

export const TABS: TabDef[] = [
  { id: 'dashboard', icon: (a) => <MdHome size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Home' },
  { id: 'tugas', icon: (a) => <MdOutlineAssignment size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Tugas' },
  { id: 'materi', icon: (a) => <MdBook size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Materi' },
  { id: 'video', icon: (a) => <MdPlayCircleOutline size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Video' },
  { id: 'pengumuman', icon: (a) => <MdInfoOutline size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Info' },
  { id: 'jadwal', icon: (a) => <MdOutlineCalendarMonth size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Jadwal' },
  { id: 'nilai', icon: (a) => <MdEmojiEvents size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Nilai' },
  { id: 'notifikasi', icon: (a) => <MdNotificationsNone size={24} color={a ? '#2196F3' : '#9CA3AF'} />, label: 'Notif' },
]

interface Props {
  activeTab: Tab
  unreadCount: number
  onChange: (tab: Tab) => void
}

export default function BottomNav({ activeTab, unreadCount, onChange }: Props) {
  return (
    <nav className="bottom-nav-new">
      {TABS.map((t) => {
        const active = activeTab === t.id
        return (
          <button key={t.id} className={`nav-btn ${active ? 'nav-active' : ''}`} onClick={() => onChange(t.id)}>
            <span style={{ position: 'relative' }}>
              {t.icon(active)}
              {t.id === 'notifikasi' && unreadCount > 0 && <span className="nav-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </span>
            <span className={`nav-label-new ${active ? 'nav-label-active' : ''}`}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
