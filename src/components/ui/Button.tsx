import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'sm'

const variants: Record<Variant, string> = {
  primary: 'bg-signal text-white hover:bg-signal-hover',
  secondary: 'border border-line bg-paper text-ink hover:bg-canvas',
  ghost: 'bg-transparent text-ink-soft hover:bg-canvas hover:text-ink',
}

const sizes: Record<Size, string> = {
  md: 'min-h-11 px-4 text-sm',
  sm: 'min-h-11 px-3 text-[13px]',
}

function buttonClass(variant: Variant, size: Size, className?: string) {
  return [
    'inline-flex items-center justify-center rounded-md font-medium tracking-tight transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    sizes[size],
    className ?? '',
  ].join(' ')
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className, children, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  )
}

type ButtonLinkProps = {
  to: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

export function ButtonLink({ to, variant = 'primary', size = 'md', className, children }: ButtonLinkProps) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  )
}
