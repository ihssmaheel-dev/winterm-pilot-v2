import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'default' | 'dot'
  children: ReactNode
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-[5px] px-[8px] py-[3px] rounded-[4px] text-[10px] font-mono bg-bg-elevated border border-border-med text-text3">
      {variant === 'dot' && (
        <span className="w-[5px] h-[5px] rounded-full bg-green badge-dot-pulse" />
      )}
      {children}
    </span>
  )
}
