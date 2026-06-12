import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DropdownItem {
  label: string
  desc?: string
  icon?: ReactNode
  onClick: () => void
}

interface DropdownMenuProps {
  trigger: ReactNode
  items: DropdownItem[]
  header?: string
}

export function DropdownMenu({ trigger, items, header }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className="absolute top-[calc(100%+4px)] left-0 z-[200] min-w-[220px] p-1 rounded-[12px] bg-bg-surface/85 backdrop-blur-acrylic border border-border-strong shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
          >
            {header && (
              <div className="px-[10px] py-[5px] text-[9px] font-bold tracking-[0.12em] uppercase text-text3 border-b border-border mb-[2px]">
                {header}
              </div>
            )}
            <div className="flex flex-col gap-[1px]">
              {items.map((item, i) => (
                <div
                  key={i}
                  onClick={() => { item.onClick(); setOpen(false) }}
                  className="flex items-start gap-[10px] px-[10px] py-[8px] rounded-[6px] cursor-pointer transition-colors duration-100 hover:bg-bg-hover"
                >
                  {item.icon && (
                    <div className="w-7 h-7 rounded-[6px] bg-bg-elevated border border-border-med flex items-center justify-center flex-shrink-0 mt-[1px]">
                      {item.icon}
                    </div>
                  )}
                  <div>
                    <div className="text-[12px] font-semibold text-text">{item.label}</div>
                    {item.desc && (
                      <div className="text-[10px] text-text3 mt-[1px]">{item.desc}</div>
                    )}
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
