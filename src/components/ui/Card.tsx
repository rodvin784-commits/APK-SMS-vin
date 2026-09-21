/**
 * Card — Komponen kartu generik untuk Materi, Pengumuman, dll.
 * Gunakan CardHead untuk judul, CardMeta untuk info kecil, CardDesc untuk paragraf, CardActions untuk tombol.
 */
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  onClick?: () => void // jika ada → kartu jadi tombol (role=button)
}

export function Card({ children, className, onClick }: Props) {
  return (
    <div className={['item-card', className].filter(Boolean).join(' ')} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  )
}

export function CardHead({ children }: { children: ReactNode }) {
  return <div className="item-head">{children}</div>
}

export function CardMeta({ children }: { children: ReactNode }) {
  return <span className="item-meta">{children}</span>
}

export function CardDesc({ children }: { children: ReactNode }) {
  return <p className="item-desc">{children}</p>
}

export function CardActions({ children }: { children: ReactNode }) {
  return <div className="item-actions">{children}</div>
}
