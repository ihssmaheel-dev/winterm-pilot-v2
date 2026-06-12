import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'

const TEMPLATE_LIST = [
  {
    name: 'Full Stack (2 Panes)',
    desc: 'Frontend + Backend side-by-side',
    key: 'fullstack',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5.5" height="12" rx="1.5" stroke="#00e5ff" strokeWidth="1.2" />
        <rect x="7.5" y="1" width="5.5" height="12" rx="1.5" stroke="#38d9c0" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    name: '3-Tier Application',
    desc: 'Frontend, API, Database stacked',
    key: '3tier',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="12" height="4" rx="1.5" stroke="#00e5ff" strokeWidth="1.2" />
        <rect x="1" y="7" width="5.5" height="6" rx="1.5" stroke="#38d9c0" strokeWidth="1.2" />
        <rect x="7.5" y="7" width="5.5" height="6" rx="1.5" stroke="#c19c00" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    name: 'Microservices (Multi-Tab)',
    desc: 'Gateway tab + 4-pane services tab',
    key: 'microservices',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="#00e5ff" strokeWidth="1.2" />
        <rect x="7.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="#38d9c0" strokeWidth="1.2" />
        <rect x="1" y="7.5" width="5.5" height="5.5" rx="1.2" stroke="#c19c00" strokeWidth="1.2" />
        <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1.2" stroke="#f06a6a" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    name: 'Monorepo Quad',
    desc: '4-pane workspace for monorepos',
    key: 'monorepo',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="#13a10e" strokeWidth="1.2" />
        <rect x="7.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="#13a10e" strokeWidth="1.2" />
        <rect x="1" y="7.5" width="5.5" height="5.5" rx="1.2" stroke="#13a10e" strokeWidth="1.2" />
        <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1.2" stroke="#13a10e" strokeWidth="1.2" />
      </svg>
    ),
  },
]

interface TemplateDropdownProps {
  onSelect: (name: string) => void
}

export function TemplateDropdown({ onSelect }: TemplateDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="relative" ref={ref}>
      <Button variant={open ? 'active' : 'ghost'} onClick={() => setOpen(!open)}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="7" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="1" y="7" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="7" y="7" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
        Templates
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1.5 2.5L4 5l2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className="absolute top-[calc(100%+4px)] left-0 z-[200] min-w-[220px] p-1 rounded-[12px] bg-bg-surface/85 backdrop-blur-acrylic border border-border-strong shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
          >
            <div className="px-[10px] py-[5px] text-[9px] font-bold tracking-[0.12em] uppercase text-text3 border-b border-border mb-[2px]">
              Choose a template
            </div>
            <div className="flex flex-col gap-[1px]">
              {TEMPLATE_LIST.map((item) => (
                <div
                  key={item.key}
                  onClick={() => { onSelect(item.key); setOpen(false) }}
                  className="flex items-start gap-[10px] px-[10px] py-[8px] rounded-[6px] cursor-pointer transition-colors duration-100 hover:bg-bg-hover"
                >
                  <div className="w-7 h-7 rounded-[6px] bg-bg-elevated border border-border-med flex items-center justify-center flex-shrink-0 mt-[1px]">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-text">{item.name}</div>
                    <div className="text-[10px] text-text3 mt-[1px]">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
