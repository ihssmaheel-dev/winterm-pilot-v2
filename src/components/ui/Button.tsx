import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'icon' | 'active'
  size?: 'sm' | 'md'
  children: ReactNode
}

const variants = {
  primary:
    'bg-accent text-text-inv hover:brightness-110 shadow-[0_0_20px_var(--color-accent-glow)]',
  ghost: 'bg-transparent text-text2 hover:bg-bg-hover hover:text-text',
  danger: 'bg-transparent text-text2 hover:bg-red/10 hover:text-rose',
  icon: 'bg-transparent text-text3 hover:bg-bg-hover hover:text-text',
  active: 'bg-bg-hover text-text',
}

const sizes = {
  sm: 'h-6 px-2 text-[11px] gap-1',
  md: 'h-7 px-[10px] text-[12px] gap-[5px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-[5px] font-medium whitespace-nowrap transition-all duration-100 disabled:opacity-[0.35] disabled:cursor-not-allowed tracking-[-0.01em] ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
