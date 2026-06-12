import { ProjectSection } from './ProjectSection'
import { LayoutSection } from './LayoutSection'
import { PaneProperties } from './PaneProperties'
import { SnippetsBrowser } from './SnippetsBrowser'

export function Sidebar() {
  return (
    <div className="w-[300px] flex-shrink-0 flex flex-col border-r border-border bg-bg-surface overflow-hidden">
      <ProjectSection />
      <LayoutSection />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="px-[14px] py-[14px]">
          <div className="flex items-center gap-[6px] mb-[10px]">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M3 4l1.5 1.5L3 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M6 7h1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            </svg>
            <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-text3">
              Pane Properties
            </span>
          </div>
          <PaneProperties />
        </div>
      </div>
      <SnippetsBrowser />
    </div>
  )
}
