import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ReactNode
}

export function Modal({ open, onClose, title, children, actions }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative z-10 bg-bg-surface border border-border-strong rounded-[12px] shadow-[0_24px_64px_rgba(0,0,0,0.5)] w-[400px] max-w-[90vw]"
          >
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-[14px] font-semibold text-text">{title}</h2>
            </div>
            <div className="px-5 py-4 text-[13px] text-text2 leading-[1.6]">
              {children}
            </div>
            {actions && (
              <div className="px-5 py-3 border-t border-border flex items-center justify-end gap-2">
                {actions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
