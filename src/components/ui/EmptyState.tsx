import type { ReactNode } from 'react'

interface Props {
  message: string
  icon?: ReactNode
}

export default function EmptyState({ message, icon }: Props) {
  return (
    <div className="empty-card">
      {icon}
      <p className="kosong" style={{ padding: 0 }}>{message}</p>
    </div>
  )
}
