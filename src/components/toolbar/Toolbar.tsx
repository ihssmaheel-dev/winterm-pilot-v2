import { useRef, useState } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { TemplateDropdown } from './TemplateDropdown'
import { ProjectManager } from './ProjectManager'
import { showToast } from '@/hooks/useKeyboard'
import { downloadTextFile, downloadJsonFile, getScriptContent, copyToClipboard } from '@/lib/export'
import type { SavedState } from '@/types'

interface ToolbarProps {
  onNewProject?: () => void
}

export function Toolbar({ onNewProject }: ToolbarProps) {
  const [showProjectManager, setShowProjectManager] = useState(false)
  const fullscreen = useStore((s) => s.fullscreen)
  const setFullscreen = useStore((s) => s.setFullscreen)
  const setOutputFormat = useStore((s) => s.setOutputFormat)
  const outputFormat = useStore((s) => s.outputFormat)
  const totalPaneCount = useStore((s) => s.totalPaneCount())
  const splitSelected = useStore((s) => s.splitSelected)
  const deleteSelected = useStore((s) => s.deleteSelected)
  const duplicatePane = useStore((s) => s.duplicatePane)
  const resetSizes = useStore((s) => s.resetSizes)
  const maximized = useStore((s) => s.maximized)
  const setMaximized = useStore((s) => s.setMaximized)
  const loadTemplate = useStore((s) => s.loadTemplate)
  const toJSON = useStore((s) => s.toJSON)
  const hydrate = useStore((s) => s.hydrate)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const history = useStore((s) => s.history)
  const future = useStore((s) => s.future)
  const toJSONraw = useStore((s) => s.toJSON)

  const importRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    downloadJsonFile(toJSON(), `${useStore.getState().projectName || 'layout'}.json`)
    showToast('Layout exported')
  }

  function handleImport() {
    importRef.current?.click()
  }

  function validateImportData(data: unknown): data is { tabs: unknown[]; projectName?: string; outputFormat?: string; fullscreen?: boolean; activeTabId?: string; selectedPaneId?: string | null } {
    if (!data || typeof data !== 'object') return false
    const d = data as Record<string, unknown>
    if (!Array.isArray(d.tabs)) return false
    if (typeof d.projectName !== 'undefined' && typeof d.projectName !== 'string') return false
    if (typeof d.outputFormat !== 'undefined' && !['wt', 'bat'].includes(d.outputFormat as string)) return false
    if (typeof d.activeTabId !== 'undefined' && typeof d.activeTabId !== 'string') return false
    return true
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1024 * 1024) {
      showToast('File too large (max 1MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (validateImportData(data)) {
          hydrate(data as SavedState)
          showToast('Layout imported')
        } else {
          showToast('Invalid layout file')
        }
      } catch {
        showToast('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleDownload() {
    const content = getScriptContent()
    if (!content) return
    downloadTextFile(content, `${useStore.getState().projectName || 'launcher'}.bat`)
    showToast('Script downloaded')
  }

  function handleLaunch() {
    const content = getScriptContent()
    if (!content) return
    const lines = content.split('\n')
    const wtLine = lines.find((l) => l.trim().startsWith('wt'))
    if (wtLine) {
      copyToClipboard(wtLine.trim()).then(() => showToast('Launch command copied to clipboard')).catch(() => showToast('Failed to copy'))
    } else {
      showToast('No wt command found in script')
    }
  }

  function handleShare() {
    try {
      const data = toJSONraw()
      const json = JSON.stringify(data)
      const encoded = btoa(encodeURIComponent(json))
      const url = `${window.location.origin}${window.location.pathname}?layout=${encoded}`
      copyToClipboard(url).then(() => showToast('Share URL copied to clipboard')).catch(() => showToast('Failed to copy'))
    } catch {
      showToast('Failed to create share URL')
    }
  }

  return (
    <>
      <ProjectManager open={showProjectManager} onClose={() => setShowProjectManager(false)} />
      <div className="h-10 bg-bg-surface border-b border-border flex items-center px-2 gap-0.5 flex-shrink-0 overflow-x-auto">
        {/* Undo/Redo */}
        <Button variant="ghost" onClick={undo} disabled={history.length === 0} title="Undo" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M7.5 9.5H4a3.5 3.5 0 010-7h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.5 6.5L3.5 4.5l2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
        <Button variant="ghost" onClick={redo} disabled={future.length === 0} title="Redo" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M5.5 9.5H9a3.5 3.5 0 000-7H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.5 6.5L9.5 4.5l-2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>

        <span className="text-border-med mx-0.5 select-none flex-shrink-0">|</span>

        {/* New */}
        <Button variant="ghost" onClick={onNewProject} title="New" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M6.5 4v5M4 6.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span className="hidden md:inline">New</span>
        </Button>

        <span className="text-border-med mx-0.5 select-none flex-shrink-0">|</span>

        {/* Project Manager */}
        <Button variant="ghost" onClick={() => setShowProjectManager(true)} title="Projects" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 2.5V2a1 1 0 011-1h2a1 1 0 011 1v.5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span className="hidden md:inline">Projects</span>
        </Button>

        <span className="text-border-med mx-0.5 select-none flex-shrink-0">|</span>

        {/* Templates */}
        <span className="flex-shrink-0"><TemplateDropdown onSelect={(name) => loadTemplate(name)} /></span>

        <span className="text-border-med mx-0.5 select-none flex-shrink-0">|</span>

        {/* Import / Export */}
        <Button variant="ghost" onClick={handleImport} data-import title="Import" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 12V4M3.5 7l3-3 3 3M11.5 11h-10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden md:inline">Import</span>
        </Button>
        <Button variant="ghost" onClick={handleExport} title="Export" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v8M3.5 6l3 3 3-3M11.5 11h-10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden md:inline">Export</span>
        </Button>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <span className="text-border-med mx-0.5 select-none flex-shrink-0">|</span>

        {/* Split controls */}
        <Button variant="ghost" onClick={() => splitSelected('horizontal')} title="Split horizontal" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="1" width="11" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
            <rect x="1" y="7" width="11" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span className="hidden md:inline">Split H</span>
        </Button>
        <Button variant="ghost" onClick={() => splitSelected('vertical')} title="Split vertical" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="1" width="5" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
            <rect x="7" y="1" width="5" height="11" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span className="hidden md:inline">Split V</span>
        </Button>
        <Button variant="danger" onClick={deleteSelected} title="Delete pane" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 3.5h9M5 3.5V2.5h3v1M4.5 3.5l.5 7M8.5 3.5l-.5 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span className="hidden md:inline">Delete</span>
        </Button>
        <Button variant="ghost" onClick={duplicatePane} title="Duplicate pane" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="3.5" y="3" width="8" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
            <rect x="1.5" y="1" width="8" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
          </svg>
          <span className="hidden md:inline">Duplicate</span>
        </Button>
        <Button variant="ghost" onClick={resetSizes} title="Reset sizes" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1 6.5h11M6.5 1v11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
            <path d="M3.5 3.5l6 6M9.5 3.5l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span className="hidden md:inline">Reset</span>
        </Button>

        <span className="text-border-med mx-0.5 select-none flex-shrink-0">|</span>

        {/* Format select */}
        <span className="flex-shrink-0">
          <Select
            options={[
              { value: 'wt', label: 'Windows Terminal' },
              { value: 'bat', label: 'Simple Batch' },
            ]}
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as 'wt' | 'bat')}
            className="h-7 text-[11px]"
          />
        </span>

        <span className="text-border-med mx-0.5 select-none flex-shrink-0">|</span>

        {/* Window mode */}
        <Button
          variant={fullscreen ? 'primary' : 'ghost'}
          onClick={() => { setFullscreen(!fullscreen); if (!fullscreen) setMaximized(false) }}
          title="Fullscreen"
          className="flex-shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1 4.5V2h2.5M8.5 2H11v2.5M11 8.5V11H8.5M3.5 11H1V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span className="hidden md:inline">Fullscreen</span>
        </Button>
        <Button
          variant={maximized ? 'primary' : 'ghost'}
          onClick={() => { setMaximized(!maximized); if (!maximized) setFullscreen(false) }}
          title="Maximized"
          className="flex-shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="2" y="2" width="9" height="9" rx="1.3" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2 5h9" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span className="hidden md:inline">Maximized</span>
        </Button>

        <span className="text-border-med mx-0.5 select-none flex-shrink-0">|</span>

        {/* Pane count */}
        <Badge variant="dot">
          <span id="paneCount" className="whitespace-nowrap">{totalPaneCount}P</span>
        </Badge>

        <span className="text-border-med mx-0.5 select-none flex-shrink-0">|</span>

        {/* Share / Launch / Download */}
        <Button variant="ghost" onClick={handleShare} title="Share layout as URL" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="4.5" cy="9" r="2" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="8.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.3" />
            <line x1="6.5" y1="4.5" x2="5.5" y2="7.5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </Button>
        <Button variant="ghost" onClick={handleLaunch} title="Launch in Windows Terminal" className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <polygon points="2,2 2,11 10,6.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </Button>

        <Button variant="primary" onClick={handleDownload} className="flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v8M3.5 6.5l3 3 3-3M1.5 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download
        </Button>
      </div>
    </>
  )
}
