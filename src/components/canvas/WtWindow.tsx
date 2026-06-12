import { useStore } from '@/store/useStore'
import { SplitNode } from './SplitNode'
import { PaneNode } from './PaneNode'
import { findNode } from '@/lib/tree'
import { esc } from '@/lib/utils'

export function WtWindow() {
  const tabs = useStore((s) => s.tabs)
  const activeTabId = useStore((s) => s.activeTabId)
  const zoomedPaneId = useStore((s) => s.zoomedPaneId)
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]

  const zoomedPane = zoomedPaneId
    ? findNode(activeTab.root, zoomedPaneId)
    : null

  const body = zoomedPane?.type === 'pane'
    ? <PaneNode node={zoomedPane} />
    : <SplitNode node={activeTab.root} />

  return (
    <div className="absolute inset-[14px] bg-bg-base rounded-[12px] border border-border-med flex flex-col overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
      {/* Chrome */}
      <div className="h-8 bg-[#0f0f16] flex items-center border-b border-border flex-shrink-0">
        <div className="flex gap-[5px] px-3 items-center">
          <div className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
          <div className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
          <div className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-end gap-[1px] flex-1 pl-1 overflow-hidden">
          {tabs.map((t) => (
            <div
              key={t.id}
              className={`px-3 py-1 text-[9.5px] rounded-t-[4px] font-mono ${
                t.id === activeTabId ? 'bg-bg-base text-[#aaa]' : 'text-[#555] bg-transparent'
              }`}
            >
              {esc(t.name)}
            </div>
          ))}
        </div>
        <div className="flex-1" />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex">
        {body}
      </div>
    </div>
  )
}
