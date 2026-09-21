import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  variant?: 'ok' | 'warn'
  className?: string
}

export default function Badge({ children, variant = 'ok', className }: Props) {
  return <span className={['badge', variant === 'ok' ? 'badge-ok' : 'badge-warn', className].filter(Boolean).join(' ')}>{children}</span>
}
