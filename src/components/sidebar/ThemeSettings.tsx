import { useStore } from '@/store/useStore'
import { PANE_COLORS } from '@/types'

export function ThemeSettings() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)

  return (
    <div className="px-[14px] py-[14px] border-t border-border">
      <div className="flex items-center gap-[6px] mb-[10px]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 1v1M5 8v1M1 5h1M8 5h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-text3">Theme</span>
      </div>

      {/* Light/Dark toggle */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setTheme({ mode: 'dark' })}
          className={`flex-1 text-[11px] py-[5px] rounded-[6px] font-medium transition-all ${
            theme.mode === 'dark'
              ? 'bg-accent text-text-inv'
              : 'bg-bg-elevated text-text2 hover:bg-bg-hover'
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => setTheme({ mode: 'light' })}
          className={`flex-1 text-[11px] py-[5px] rounded-[6px] font-medium transition-all ${
            theme.mode === 'light'
              ? 'bg-accent text-text-inv'
              : 'bg-bg-elevated text-text2 hover:bg-bg-hover'
          }`}
        >
          Light
        </button>
      </div>

      {/* Accent color */}
      <label className="block text-[11px] font-semibold text-text2 mb-[6px]">Accent Color</label>
      <div className="flex gap-[6px] flex-wrap">
        {PANE_COLORS.filter(c => c.value).map((c) => (
          <button
            key={c.value}
            onClick={() => setTheme({ accent: c.value })}
            className={`w-[20px] h-[20px] rounded-full border-2 transition-all duration-100 ${
              theme.accent === c.value
                ? 'border-text scale-110'
                : 'border-border-med hover:border-text3'
            }`}
            style={{ backgroundColor: c.value }}
            title={c.name}
          />
        ))}
        {/* Custom accent */}
        <label className="relative cursor-pointer">
          <div
            className="w-[20px] h-[20px] rounded-full border-2 border-border-med hover:border-text3 flex items-center justify-center"
            title="Custom"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M4 1v6M1 4h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="color"
            value={theme.accent}
            onChange={(e) => setTheme({ accent: e.target.value })}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  )
}
