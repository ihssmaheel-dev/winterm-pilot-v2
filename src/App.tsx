import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { LaunchScreen } from '@/components/LaunchScreen'
import { AppPage } from '@/components/AppPage'
import { DocsPage } from '@/components/DocsPage'
import { Toast } from '@/components/ui/Toast'
import type { SavedState } from '@/types'

export default function App() {
  const navigate = useNavigate()
  const hydrate = useStore((s) => s.hydrate)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('winterm-pilot')
      if (saved) {
        const parsed: SavedState = JSON.parse(saved)
        hydrate(parsed)
      }
    } catch { /* ignore */ }
  }, [hydrate])

  useEffect(() => {
    const unsubscribe = useStore.subscribe((state) => {
      try {
        const { tabs, projectName, outputFormat, fullscreen, activeTabId, selectedPaneId } = state
        localStorage.setItem(
          'winterm-pilot',
          JSON.stringify({ tabs, projectName, outputFormat, fullscreen, activeTabId, selectedPaneId }),
        )
      } catch { /* ignore */ }
    })
    return unsubscribe
  }, [])

  return (
    <>
      <Routes>
        <Route path="/" element={<LaunchScreen onOpen={() => navigate('/app')} />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
      <Toast />
    </>
  )
}
