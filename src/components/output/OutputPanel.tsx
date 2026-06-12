import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { generateWT, generateBat } from '@/lib/generators'
import { showToast } from '@/hooks/useKeyboard'

export function OutputPanel() {
  const tabs = useStore((s) => s.tabs)
  const outputFormat = useStore((s) => s.outputFormat)
  const fullscreen = useStore((s) => s.fullscreen)
  const maximized = useStore((s) => s.maximized)
  const projectName = useStore((s) => s.projectName)

  const script = useMemo(() => {
    if (outputFormat === 'wt') return generateWT(tabs, fullscreen, maximized, projectName)
    return generateBat(tabs, projectName)
  }, [tabs, outputFormat, fullscreen, maximized, projectName])

  const handleCopy = () => {
    navigator.clipboard.writeText(script).then(() => showToast('Copied to clipboard'))
  }

  const handleDownload = () => {
    const blob = new Blob([script], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${projectName || 'launcher'}.bat`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
    showToast('Script downloaded')
  }

  return (
    <div className="h-[156px] flex-shrink-0 border-t border-border bg-bg-surface flex flex-col">
      {/* Header */}
      <div className="h-[34px] flex items-center justify-between px-[14px] border-b border-border flex-shrink-0">
        <div className="flex items-center gap-[8px]">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="#13a10e" strokeWidth="1.2" />
            <path d="M3 4l1.5 1.5L3 7" stroke="#13a10e" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-text3 flex items-center gap-[8px]">
            Generated Script
            <span className="w-[5px] h-[5px] rounded-full bg-green badge-dot-pulse" />
          </span>
        </div>
        <div className="flex gap-[6px]">
          <button
            onClick={handleCopy}
            className="h-6 inline-flex items-center gap-[5px] px-[10px] rounded-[5px] text-[11px] font-semibold cursor-pointer border border-border-med bg-bg-elevated text-text2 transition-all duration-100 hover:bg-bg-hover hover:text-text font-sans"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <rect x="1" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M3 3V2a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H8" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="h-6 inline-flex items-center gap-[5px] px-[10px] rounded-[5px] text-[11px] font-semibold cursor-pointer border-none bg-accent text-text-inv transition-all duration-100 hover:brightness-110 font-sans"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v7M2.5 5.5l3 3 3-3M1 9.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        id="scriptOut"
        className="flex-1 px-4 py-[10px] overflow-auto font-mono text-[10.5px] leading-[1.7] text-green whitespace-pre-wrap break-all"
      >
        {script}
      </div>
    </div>
  )
}
