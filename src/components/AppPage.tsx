import { useEffect, useState, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { TitleBar } from '@/components/titlebar/TitleBar'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { Canvas } from '@/components/canvas/Canvas'
import { OutputPanel } from '@/components/output/OutputPanel'
import { StatusBar } from '@/components/StatusBar'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useKeyboard, setToastCallback } from '@/hooks/useKeyboard'
import { motion, AnimatePresence } from 'framer-motion'

export function AppPage() {
  const resetProject = useStore((s) => s.resetProject)
  const saveAutoVersion = useStore((s) => s.saveAutoVersion)
  const setTheme = useStore((s) => s.setTheme)
  const theme = useStore((s) => s.theme)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  useKeyboard()

  // Toast callback
  useEffect(() => {
    setToastCallback((msg: string) => {
      setToastMsg(msg)
      setTimeout(() => setToastMsg(null), 2000)
    })
  }, [])

  // Auto-save versioning every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveAutoVersion()
    }, 30000)
    return () => clearInterval(interval)
  }, [saveAutoVersion])

  // Apply theme on mount
  useEffect(() => {
    if (theme.mode === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    }
    document.documentElement.style.setProperty('--color-accent', theme.accent)
  }, [theme.mode, theme.accent])

  // Load layout from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const layout = params.get('layout')
    if (layout) {
      try {
        const json = decodeURIComponent(atob(layout))
        const data = JSON.parse(json)
        if (data && data.tabs) {
          resetProject()
          setTimeout(() => useStore.getState().hydrate(data), 100)
        }
      } catch { /* ignore invalid URLs */ }
    }
  }, [resetProject])

  // Alt+N keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'n') {
        e.preventDefault()
        setShowNewDialog(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex flex-col h-screen">
      <TitleBar />
      <Toolbar onNewProject={() => setShowNewDialog(true)} />
      <Modal
        open={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        title="Discard changes?"
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                resetProject()
                setShowNewDialog(false)
              }}
            >
              Discard
            </Button>
          </>
        }
      >
        Starting a new project will discard your current layout and all pane settings. This cannot be undone.
      </Modal>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden bg-bg-base">
          <Canvas />
          <OutputPanel />
        </div>
      </div>
      <StatusBar />

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[999] px-[14px] py-[7px] bg-bg-surface border border-border-strong rounded-[8px] text-[12px] text-text shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
