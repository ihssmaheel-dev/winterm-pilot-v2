import { useStore } from '@/store/useStore'

export function LayoutSection() {
  const splitSelected = useStore((s) => s.splitSelected)
  const deleteSelected = useStore((s) => s.deleteSelected)
  const selectedPaneId = useStore((s) => s.selectedPaneId)

  const disabled = !selectedPaneId

  return (
    <div className="px-[14px] py-[14px] border-b border-border">
      <div className="flex items-center gap-[6px] mb-[10px]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1 5h8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-text3">Layout</span>
      </div>

      <div className="grid grid-cols-3 gap-[6px] mt-[2px]">
        <button
          disabled={disabled}
          onClick={() => splitSelected('horizontal')}
          className="flex flex-col items-center justify-center gap-[5px] px-[6px] py-[10px] rounded-[8px] border border-border-med bg-bg-elevated text-[9px] font-bold tracking-[0.06em] uppercase text-text3 cursor-pointer transition-all duration-100 font-sans disabled:opacity-30 disabled:cursor-not-allowed hover:border-teal/30 hover:text-teal"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="14" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <rect x="2" y="10" width="14" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          Split H
        </button>

        <button
          disabled={disabled}
          onClick={() => splitSelected('vertical')}
          className="flex flex-col items-center justify-center gap-[5px] px-[6px] py-[10px] rounded-[8px] border border-border-med bg-bg-elevated text-[9px] font-bold tracking-[0.06em] uppercase text-text3 cursor-pointer transition-all duration-100 font-sans disabled:opacity-30 disabled:cursor-not-allowed hover:border-amber/30 hover:text-amber"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <rect x="10" y="2" width="6" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          Split V
        </button>

        <button
          disabled={disabled}
          onClick={deleteSelected}
          className="flex flex-col items-center justify-center gap-[5px] px-[6px] py-[10px] rounded-[8px] border border-border-med bg-bg-elevated text-[9px] font-bold tracking-[0.06em] uppercase text-text3 cursor-pointer transition-all duration-100 font-sans disabled:opacity-30 disabled:cursor-not-allowed hover:border-red/30 hover:text-rose"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 5h12M7 5V3.5h4V5M6.5 5l.5 9M11.5 5l-.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  )
}
