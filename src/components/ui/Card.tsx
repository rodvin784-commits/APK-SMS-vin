import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  onClick?: () => void
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
