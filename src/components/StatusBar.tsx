import { useStore } from '@/store/useStore'

export function StatusBar() {
  const outputFormat = useStore((s) => s.outputFormat)
  const tabs = useStore((s) => s.tabs)
  const totalPaneCount = useStore((s) => s.totalPaneCount())

  return (
    <div className="h-[22px] bg-bg-surface border-t border-border flex items-center px-3 gap-3 flex-shrink-0">
      <div className="flex items-center gap-1 text-[10px] font-mono text-text3">
        <span className="w-[5px] h-[5px] rounded-full bg-green" />
        Ready
      </div>
      <span className="text-border-strong">|</span>
      <div className="flex items-center gap-1 text-[10px] font-mono text-text3">
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <rect x="0.5" y="0.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" />
          <path d="M2 4.5h5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
        <span>{outputFormat === 'wt' ? 'Windows Terminal' : 'Simple Batch'}</span>
      </div>
      <span className="text-border-strong">|</span>
      <div className="flex items-center gap-1 text-[10px] font-mono text-text3">
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <rect x="0.5" y="0.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span>{tabs.length} tab{tabs.length !== 1 ? 's' : ''}</span>
      </div>
      <span className="text-border-strong">|</span>
      <div className="flex items-center gap-1 text-[10px] font-mono text-text3">
        <span className="w-[5px] h-[5px] rounded-full bg-accent" />
        <span>{totalPaneCount} pane{totalPaneCount !== 1 ? 's' : ''}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        {[
          { keys: '⌘Z', label: 'Undo' },
          { keys: '⌘⇧Z', label: 'Redo' },
          { keys: 'Alt+H/V', label: 'Split' },
          { keys: 'Alt+↑↓←→', label: 'Focus' },
          { keys: 'Alt+Shift+↑↓←→', label: 'Resize' },
          { keys: 'Alt+Z', label: 'Zoom' },
          { keys: 'Alt+S', label: 'Download' },
        ].map((h) => (
          <div key={h.keys} className="flex items-center gap-1 text-[9px] font-mono text-text3">
            <kbd className="inline-block px-[5px] py-[1px] rounded-[3px] bg-bg-elevated border border-border-med font-mono text-[9px] text-text2">
              {h.keys}
            </kbd>
            {h.label}
          </div>
        ))}
      </div>
    </div>
  )
}
