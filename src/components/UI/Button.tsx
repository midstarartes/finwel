import { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary: 'text-white font-semibold',
  secondary: 'text-slate-300 font-medium',
  danger: 'text-white font-semibold',
  ghost: 'text-slate-400 font-medium hover:text-white',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const sizeClass = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }[size]

  const variantStyle: React.CSSProperties = {
    primary: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.3)', border: 'none' },
    secondary: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' },
    danger: { background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 15px rgba(239,68,68,0.3)', border: 'none' },
    ghost: { background: 'transparent', border: '1px solid transparent' },
  }[variant]

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl transition-all',
        variants[variant],
        sizeClass,
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{ ...variantStyle, ...style }}
      {...props}
    >
      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  )
}
