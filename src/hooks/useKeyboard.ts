import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { downloadTextFile, getScriptContent, copyToClipboard } from '@/lib/export'

export function useKeyboard() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const s = useStore.getState()

      // Ctrl+Z / Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          s.redo()
        } else {
          s.undo()
        }
        return
      }

      // Ctrl+Tab / Ctrl+Shift+Tab = cycle tabs
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault()
        const tabs = useStore.getState().tabs
        if (tabs.length < 2) return
        const idx = tabs.findIndex((t) => t.id === useStore.getState().activeTabId)
        const next = e.shiftKey
          ? (idx - 1 + tabs.length) % tabs.length
          : (idx + 1) % tabs.length
        useStore.getState().switchTab(tabs[next].id)
        return
      }

      // Alt+Shift+Arrows = pane resize
      if (e.altKey && e.shiftKey) {
        e.preventDefault()
        switch (e.key) {
          case 'ArrowUp': s.resizePaneUp(); break
          case 'ArrowDown': s.resizePaneDown(); break
          case 'ArrowLeft': s.resizePaneLeft(); break
          case 'ArrowRight': s.resizePaneRight(); break
        }
        return
      }

      if (!e.altKey) return
      e.preventDefault()
      switch (e.key) {
        case 's': downloadScript(); break
        case 'c': copyScript(); break
        case 'h': s.splitSelected('horizontal'); break
        case 'v': s.splitSelected('vertical'); break
        case 'd': s.deleteSelected(); break
        case 't': s.addTab(); break
        case 'n': break // handled in AppPage
        case 'z': {
          const sp = s.selectedPane()
          if (sp) s.togglePaneZoom(sp.id)
          break
        }
        case 'ArrowUp': s.focusDirection('up'); break
        case 'ArrowDown': s.focusDirection('down'); break
        case 'ArrowLeft': s.focusDirection('left'); break
        case 'ArrowRight': s.focusDirection('right'); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}

function downloadScript() {
  const content = getScriptContent()
  if (!content) return
  downloadTextFile(content, `${useStore.getState().projectName || 'launcher'}.bat`)
  showToast('Script downloaded')
}

function copyScript() {
  const content = getScriptContent()
  if (!content) return
  copyToClipboard(content).then(() => showToast('Copied to clipboard')).catch(() => showToast('Failed to copy'))
}
let _toastCallback: ((msg: string) => void) | null = null

export function setToastCallback(fn: (msg: string) => void) {
  _toastCallback = fn
}

export function showToast(msg: string) {
  if (_toastCallback) _toastCallback(msg)
}
