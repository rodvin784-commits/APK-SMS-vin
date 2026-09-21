/**
 * Button — Tombol reusable APK. Varian: primary (gelap), secondary (outline abu), ghost (ikon transparan).
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'icon-btn',
}

export default function Button({ variant = 'primary', size = 'md', className, children, ...rest }: Props) {
  void size
  return (
    <button className={[variantClass[variant], className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </button>
  )
}
