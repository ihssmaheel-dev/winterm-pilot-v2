import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { AppPage } from '@/components/AppPage'
import { Toast } from '@/components/ui/Toast'
import type { SavedState } from '@/types'

const LaunchScreen = lazy(() => import('@/components/LaunchScreen').then(m => ({ default: m.LaunchScreen })))
const DocsPage = lazy(() => import('@/components/DocsPage').then(m => ({ default: m.DocsPage })))

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
        <Route path="/" element={<Suspense fallback={null}><LaunchScreen onOpen={() => navigate('/app')} /></Suspense>} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/docs" element={<Suspense fallback={null}><DocsPage /></Suspense>} />
      </Routes>
      <Toast />
    </>
  )
}
