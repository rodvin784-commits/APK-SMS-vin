import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  variant?: 'error' | 'success'
  action?: ReactNode
}

export default function Alert({ children, variant = 'error', action }: Props) {
  return (
    <div className={`alert ${variant === 'error' ? 'alert-error' : 'alert-success'}`}>
      {children}
      {action}
    </div>
  )
}
