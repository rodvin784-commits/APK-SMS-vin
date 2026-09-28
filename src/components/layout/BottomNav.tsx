/* eslint-disable react-refresh/only-export-components */
/**
 * BottomNav — Navigasi bawah APK Siswa (mobile). Maksimal 5 item agar lega di HP kecil.
 * Layar lain (Materi, Video, Info, Hadir, Notif) dibuka dari menu "Lainnya" di Beranda.
 */
import type { ReactNode } from 'react'
import { MdOutlineHome, MdOutlineAssignment, MdOutlineCalendarMonth, MdOutlineEmojiEvents, MdPersonOutline } from 'react-icons/md'

// Tipe tab yang diakui App.tsx — 'profile' tampil di nav; materi/video/dll tetap
// dirender App tapi dibuka dari menu "Lainnya" (bukan BottomNav).
export type Tab = 'dashboard' | 'tugas' | 'materi' | 'video' | 'pengumuman' | 'jadwal' | 'nilai' | 'presensi' | 'notifikasi' | 'profile'

// Definisi tiap tombol navigasi: id harus sama dengan Tab, label tampil di bawah ikon.
interface TabDef {
  id: Tab
  icon: (active: boolean) => ReactNode
  label: string
}

export const TABS: TabDef[] = [
  { id: 'dashboard', icon: () => <MdOutlineHome size={24} />, label: 'Home' },
  { id: 'tugas', icon: () => <MdOutlineAssignment size={24} />, label: 'Tugas' },
  { id: 'jadwal', icon: () => <MdOutlineCalendarMonth size={24} />, label: 'Jadwal' },
  { id: 'nilai', icon: () => <MdOutlineEmojiEvents size={24} />, label: 'Nilai' },
  { id: 'profile', icon: () => <MdPersonOutline size={24} />, label: 'Profil' },
]

interface Props {
  activeTab: Tab
  onChange: (tab: Tab) => void
}

export default function BottomNav({ activeTab, onChange }: Props) {
  return (
    <nav className="bottom-nav-new" aria-label="Navigasi utama">
      {TABS.map((t) => {
        const active = activeTab === t.id
        return (
          <button
            key={t.id}
            className={`nav-btn ${active ? 'nav-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            aria-label={t.label}
            onClick={() => onChange(t.id)}
          >
            {t.icon(active)}
            <span className={`nav-label-new ${active ? 'nav-label-active' : ''}`}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
