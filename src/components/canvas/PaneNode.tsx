import { useMemo } from 'react'
import type { Pane as PaneType } from '@/types'
import { useStore } from '@/store/useStore'
import { getScheme } from '@/lib/colorSchemes'
import { esc } from '@/lib/utils'

interface PaneNodeProps {
  node: PaneType
}

function hashCode(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function TerminalLine({ text, color = 'green/85', indent = 0 }: { text: string; color?: string; indent?: number }) {
  const prefixes = ['✓', '✗', '>', '•', '◉', '○', '◆', '→']
  const prefix = prefixes[text.length % prefixes.length]
  return (
    <div className={`text-${color} truncate`} style={{ paddingLeft: indent * 6 }}>
      <span className="opacity-50 mr-[3px]">{prefix}</span>{esc(text)}
    </div>
  )
}

const STATUS_MESSAGES = [
  'Initializing...',
  'Starting dev server...',
  'Compiling modules...',
  'Watching for changes...',
  'Server ready on port 3000',
  'Connected',
  'Build completed',
  'Hot reload enabled',
  'Waiting for changes...',
]

const SHELL_LABELS: Record<string, string> = {
  'cmd.exe': 'cmd',
  'powershell.exe': 'powershell',
  'pwsh.exe': 'pwsh',
  'wsl.exe': 'wsl',
}

export function PaneNode({ node }: PaneNodeProps) {
  const selectedPaneId = useStore((s) => s.selectedPaneId)
  const selectPane = useStore((s) => s.selectPane)
  const zoomedPaneId = useStore((s) => s.zoomedPaneId)
  const togglePaneZoom = useStore((s) => s.togglePaneZoom)
  const sel = node.id === selectedPaneId
  const isZoomed = zoomedPaneId === node.id

  const scheme = node.colorScheme ? getScheme(node.colorScheme) : undefined
  const dir = node.workingDirectory.split('\\').pop() || node.workingDirectory.split('/').pop() || 'project'
  const cmds = node.commands.filter((c) => c.trim()).slice(0, 3)
  const statusMsg = useMemo(
    () => STATUS_MESSAGES[Math.abs(hashCode(node.id)) % STATUS_MESSAGES.length],
    [node.id],
  )

  const borderColor = sel
    ? node.color || 'var(--color-accent)'
    : undefined

  const shellLabel = node.shell ? SHELL_LABELS[node.shell] || node.shell : null

  const style: React.CSSProperties = {
    border: `1px solid ${borderColor || (sel ? 'var(--color-accent)' : '#1a1a2e')}`,
    boxShadow: sel
      ? `0 0 0 1px ${node.color || 'var(--color-accent)'}, inset 0 0 30px ${node.color ? node.color + '15' : 'rgba(0,229,255,0.03)'}`
      : undefined,
  }

  return (
    <div
      onClick={(e) => { e.stopPropagation(); selectPane(node.id) }}
      className="flex-1 m-[2px] rounded-[5px] flex flex-col overflow-hidden cursor-pointer transition-all duration-150 min-w-0 min-h-0 relative group bg-bg-base"
      style={style}
    >
      {/* Title bar */}
      <div
        className="h-5 flex items-center gap-[5px] px-[7px] border-b border-[#1a1a2e] flex-shrink-0"
        style={{
          background: scheme
            ? `${scheme.background}dd`
            : node.color
              ? node.color + '15'
              : '#11111c',
        }}
      >
        <div className="flex gap-[3px]">
          {['r', 'y', 'g'].map((d) => (
            <div
              key={d}
              className="w-[6px] h-[6px] rounded-full transition-colors duration-100"
              style={{
                backgroundColor: sel
                  ? d === 'r' ? '#ff5f57' : d === 'y' ? '#febc2e' : '#28c840'
                  : node.color
                    ? node.color + '30'
                    : ['#ff5f5730', '#febc2e30', '#28c84030'][['r', 'y', 'g'].indexOf(d)],
              }}
            />
          ))}
        </div>
        <span
          className="text-[7.5px] font-mono ml-[2px] transition-colors duration-100"
          style={{ color: sel ? (node.color || 'var(--color-accent)') : '#3a3a5a' }}
        >
          {esc(node.name)}
        </span>
        {shellLabel && (
          <span className="text-[6px] text-cyan ml-auto opacity-70 font-mono">
            {shellLabel}
          </span>
        )}
        {node.delay && node.delay > 0 && (
          <span className="text-[6px] text-amber opacity-70">⏱{node.delay}s</span>
        )}
        {/* Zoom toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); togglePaneZoom(node.id) }}
          className="w-[12px] h-[12px] rounded-[2px] flex items-center justify-center opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity"
          title={isZoomed ? 'Exit zoom' : 'Zoom pane'}
        >
          <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
            {isZoomed ? (
              <path d="M1 1l5 5M6 1L1 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            ) : (
              <path d="M1 1v5h5V1z" stroke="currentColor" strokeWidth="1.2" />
            )}
          </svg>
        </button>
      </div>

      {/* Body */}
      <div
        className="flex-1 px-[8px] py-[6px] overflow-hidden font-mono text-[6.5px] leading-[1.65] flex flex-col gap-[1px]"
        style={{
          background: scheme ? `${scheme.background}88` : undefined,
          color: scheme?.foreground || undefined,
        }}
      >
        {/* Env vars */}
        {node.env && (
          <div className="text-amber/70 truncate">
            <span className="opacity-50 mr-[2px]">$</span>{esc(node.env)}
          </div>
        )}

        <div className="text-[#303050]" style={{ color: scheme ? `${scheme.foreground}55` : undefined }}>
          {shellLabel || 'PS'} {esc(dir)}&gt;
        </div>

        {cmds.map((c, i) => (
          <div key={i} className="text-green/85 truncate" style={{ color: scheme?.green || undefined }}>
            <span className="opacity-50 mr-[3px]">&gt;</span>{esc(c)}
          </div>
        ))}

        <TerminalLine text={statusMsg} color="text2/70" indent={0} />

        <div className="mt-auto">
          <span
            className="inline-block w-[4px] h-[7px] align-middle ml-[1px] cursor-blink"
            style={{ background: scheme?.cursorColor || node.color || 'var(--color-green)' }}
          />
        </div>
      </div>

      {/* Selected tag */}
      {sel && (
        <div
          className="absolute top-[3px] right-[4px] text-white text-[6px] px-[4px] py-[1px] rounded-[2px] font-sans font-bold tracking-[0.06em] uppercase"
          style={{ background: node.color || 'var(--color-accent)' }}
        >
          {isZoomed ? 'ZOOMED' : 'SELECTED'}
        </div>
      )}
    </div>
  )
}
