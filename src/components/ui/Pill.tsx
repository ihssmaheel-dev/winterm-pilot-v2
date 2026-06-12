import type { ReactNode } from 'react'

interface PillProps {
  label: string
  onClick?: () => void
  icon?: ReactNode
}

export function Pill({ label, onClick, icon }: PillProps) {
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-[4px] text-[10px] font-mono border border-border-med text-text3 bg-bg-elevated cursor-pointer transition-all duration-100 hover:bg-bg-hover hover:text-text hover:border-border-strong"
    >
      {icon}
      {label}
    </span>
  )
}
