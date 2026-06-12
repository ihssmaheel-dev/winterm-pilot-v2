import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '@/hooks/useToast'

export function Toast() {
  const toast = useToast()

  return (
    <AnimatePresence>
      {toast.visible && (
        <motion.div
          id="toast"
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-5 right-5 z-[9999] flex items-center gap-[8px] px-4 py-[10px] rounded-[8px] bg-bg-elevated/90 backdrop-blur-acrylic border border-border-strong text-text text-[12px] font-semibold shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6.5l2.5 2.5L10 3"
              stroke="var(--color-green)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
