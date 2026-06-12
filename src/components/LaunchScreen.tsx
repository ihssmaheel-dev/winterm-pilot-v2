import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

interface LaunchScreenProps {
  onOpen: () => void
}

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
    color: 'text-accent',
    bg: 'bg-accent/10',
    title: 'Visual Layout Builder',
    desc: 'Design complex split-pane layouts visually. Add horizontal or vertical splits, reorder tabs, and see every change instantly in the live preview.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <rect x="1" y="3" width="5.5" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="7.5" y="3" width="5.5" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="14" y="3" width="3" height="3" rx="1" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
    color: 'text-teal',
    bg: 'bg-teal/10',
    title: 'Multi-Tab Workflows',
    desc: 'Organize panes into named tabs — one for services, another for databases, a third for monitoring. Each tab keeps its own layout, shells, and commands.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1.5" y="2" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 6l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 12h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    color: 'text-green',
    bg: 'bg-green/10',
    title: '2 Output Formats',
    desc: 'Generate Windows Terminal (.bat) scripts with full wt.exe flags — split-pane, tab colors, color schemes, shell profiles, and more. Simple batch fallback also included.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1.5" y="2" width="15" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="1.5" y="11" width="15" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 4.5h3M5 13.5h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    color: 'text-amber',
    bg: 'bg-amber/10',
    title: 'Ready-Made Templates',
    desc: 'Start fast with 4 built-in templates: Fullstack, 3-Tier, Microservices, and Monorepo. Each preconfigures a multi-pane layout with sensible defaults.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 9l4-4 3 3 3-3 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 5v8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
        <circle cx="9" cy="13" r="2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    color: 'text-blue',
    bg: 'bg-blue/10',
    title: 'Per-Pane Configuration',
    desc: 'Set working directory, startup commands, env variables, shell profiles, tab colors, and color schemes individually per pane. Save configs as reusable profiles.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2v14M2 9h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
        <path d="M5 5l8 8M13 5l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    color: 'text-rose',
    bg: 'bg-rose/10',
    title: 'Export, Share & Launch',
    desc: 'Download scripts directly, share layouts as shareable URLs, export/import JSON, or copy the wt command to clipboard in one click.',
  },
]

const TYPING_LINES = [
  { text: 'C:\\Projects> wt', delay: 1200 },
  { text: '  new-tab --title "App" --tabColor "#00e5ff" \\', delay: 600 },
  { text: '    -d "C:\\Projects\\client" -p "powershell.exe" \\', delay: 400 },
  { text: '    --colorScheme "One Half Dark" cmd /k "npm run dev"', delay: 400 },
  { text: '', delay: 300 },
  { text: '  ; split-pane -H -s 0.50 \\', delay: 500 },
  { text: '    -d "C:\\Projects\\server" --colorScheme "Vintage" \\', delay: 300 },
  { text: '    C:\\Projects\\server\\start.bat', delay: 300 },
  { text: '', delay: 300 },
  { text: '  ✔ Layout generated  ·  2 tabs  ·  4 panes  ·  812 chars', delay: 600 },
]

function useTypingEffect(lines: { text: string; delay: number }[]) {
  const [visible, setVisible] = useState<string[]>([])
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    if (lineIdx >= lines.length) { setDone(true); return }

    const line = lines[lineIdx]
    if (charIdx < line.text.length) {
      const t = setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev]
          if (next.length <= lineIdx) next.push('')
          next[lineIdx] = line.text.slice(0, charIdx + 1)
          return next
        })
        setCharIdx((c) => c + 1)
      }, 25)
      return () => clearTimeout(t)
    }

    const t = setTimeout(() => {
      setLineIdx((i) => i + 1)
      setCharIdx(0)
    }, line.delay)
    return () => clearTimeout(t)
  }, [lineIdx, charIdx, done, lines])

  return { visible, done }
}

export function LaunchScreen({ onOpen }: LaunchScreenProps) {
  const navigate = useNavigate()
  const { visible, done } = useTypingEffect(TYPING_LINES)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onOpen()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onOpen])

  return (
    <motion.div
      id="launch"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-bg-base overflow-y-auto"
    >
      {/* Background layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 70% 65% at 50% 40%, black 0%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 65% at 50% 40%, black 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute left-1/2 top-[25%] -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse, rgba(0,229,255,0.07) 0%, rgba(0,229,255,0.02) 50%, transparent 70%)',
          }}
        />
        <div className="orb1 absolute w-[450px] h-[450px] rounded-full bg-accent/8 blur-[100px] -top-[120px] -right-[60px]" />
        <div className="orb2 absolute w-[350px] h-[350px] rounded-full bg-teal/8 blur-[100px] -bottom-[80px] -left-[80px]" />
        <div className="orb3 absolute w-[200px] h-[200px] rounded-full bg-blue/6 blur-[80px] top-[55%] left-[65%]" />
      </div>

      {/* Scrollable content - top aligned */}
      <div className="relative z-10 flex flex-col items-center pt-[min(10vh,80px)] pb-[60px]">
        {/* ─── HERO ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-[90%] max-w-[800px]"
        >
          <div className="flex items-center gap-[12px] mb-[28px]">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-[48px] h-[48px] rounded-[12px] bg-gradient-to-br from-accent via-accent to-teal flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.25)]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2.5" stroke="white" strokeWidth="1.6" />
                <path d="M5 8.5l3.5 4L5 16.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 15.5h6" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
              </svg>
            </motion.div>
            <div>
              <div
                className="text-[24px] font-extrabold tracking-[-0.04em] leading-none"
                style={{
                  background: 'linear-gradient(135deg, #f0f0f0, #8ec5ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                WinTerm Pilot
              </div>
              <div className="text-[9px] font-mono font-bold tracking-[0.16em] uppercase text-text3 mt-[4px]">
                Windows Terminal Script Builder
              </div>
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-[36px] font-extrabold text-center tracking-[-0.04em] leading-[1.1] mb-[12px]"
          >
            Launch your entire
            <br />
            dev environment in{' '}
            <em
              className="not-italic"
              style={{
                background: 'linear-gradient(90deg, var(--color-accent), #6bd4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              one click
            </em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-[13px] leading-[1.7] text-center text-text2 max-w-[640px] mb-[28px] font-normal"
          >
            Design multi-tab terminal layouts visually, configure every pane down to the shell and
            color scheme, then generate a production-ready Windows Terminal script that launches
            everything exactly how you need it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-[12px]"
          >
            <button
              onClick={onOpen}
              className="group inline-flex items-center gap-[8px] px-[24px] py-[11px] rounded-[10px] bg-accent text-text-inv font-bold text-[13px] tracking-[-0.01em] border-none cursor-pointer shadow-[0_4px_28px_rgba(0,229,255,0.25)] transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] hover:shadow-[0_8px_36px_rgba(0,229,255,0.35)] active:translate-y-0 font-sans"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="group-hover:translate-x-[1px] transition-transform">
                <path d="M2.5 7.5h10M8.5 3l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Open Builder
            </button>
            <span className="text-[10px] text-text3 font-mono">
              or press{' '}
              <kbd className="inline-block px-[5px] py-[1px] rounded-[3px] bg-bg-elevated border border-border-strong text-[9px] font-mono text-text2">Enter</kbd>
            </span>
          </motion.div>
        </motion.div>

        {/* ─── DIVIDER ─── */}
        <div className="w-[90%] max-w-[800px] mt-[44px] mb-[36px] flex items-center gap-[16px] opacity-30">
          <div className="flex-1 h-[1px] bg-border-strong" />
          <span className="text-[9px] font-mono font-bold tracking-[0.12em] uppercase text-text3">Preview</span>
          <div className="flex-1 h-[1px] bg-border-strong" />
        </div>

        {/* ─── TERMINAL PREVIEW ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-[90%] max-w-[800px] mb-[44px]"
        >
          <div className="rounded-[8px] overflow-hidden border border-border-med bg-bg-surface shadow-[0_0_50px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-[7px] px-[12px] h-[30px] bg-bg-elevated border-b border-border-med">
              <div className="flex gap-[5px]">
                <div className="w-[8px] h-[8px] rounded-full bg-[#ff5f57]" />
                <div className="w-[8px] h-[8px] rounded-full bg-[#febc2e]" />
                <div className="w-[8px] h-[8px] rounded-full bg-[#28c840]" />
              </div>
              <span className="text-[9px] font-mono text-text3 ml-[7px]">Generated wt.exe Script</span>
              <span className="text-[7px] font-mono text-text3/40 ml-auto">● wt</span>
            </div>
            <div className="px-[14px] py-[12px] font-mono text-[11px] leading-[1.65] bg-[#08080c] min-h-[160px]">
              {visible.map((line, i) => (
                <div key={i} className="whitespace-pre">
                  {line.startsWith('C:\\') ? (
                    <>
                      <span className="text-accent">PS </span>
                      <span className="text-blue">{line.split('>')[0]}</span>
                      <span className="text-text3">&gt;</span>
                      <span className="text-text">{line.split('>').slice(1).join('>')}</span>
                    </>
                  ) : line.startsWith('  ✔') ? (
                    <span className="text-green">{line}</span>
                  ) : line.trim().startsWith('new-tab') || line.trim().startsWith('split-pane') ? (
                    <>
                      <span className="text-text3">{line.match(/^\s+/)?.[0] || ''}</span>
                      <span className="text-green">{line.trim().split(' ')[0]}</span>
                      <span className="text-text2"> {line.trim().slice(line.trim().split(' ')[0].length)}</span>
                    </>
                  ) : (
                    <span className="text-text2">{line}</span>
                  )}
                </div>
              ))}
              {!done && (
                <span className="inline-block w-[5px] h-[12px] align-middle ml-[1px] terminal-cursor" style={{ background: 'var(--color-accent)' }} />
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── FEATURES ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="w-[90%] max-w-[800px] mb-[36px]"
        >
          <div className="flex items-center gap-[16px] mb-[16px] opacity-30">
            <div className="flex-1 h-[1px] bg-border-strong" />
            <span className="text-[9px] font-mono font-bold tracking-[0.12em] uppercase text-text3">Features</span>
            <div className="flex-1 h-[1px] bg-border-strong" />
          </div>
          <div className="grid grid-cols-2 gap-[8px]">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group bg-bg-surface border border-border-med rounded-[10px] p-[12px] flex flex-col gap-[6px] transition-all duration-200 hover:border-accent/25 hover:shadow-[0_0_24px_rgba(0,229,255,0.04)]"
              >
                <div className={`w-[28px] h-[28px] rounded-[7px] flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${feat.bg} ${feat.color}`}>
                  {feat.icon}
                </div>
                <div className="text-[11px] font-bold text-text">{feat.title}</div>
                <div className="text-[10px] text-text3 leading-[1.55]">{feat.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ─── BOTTOM CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.4 }}
          className="relative flex flex-col items-center"
        >
          <div
            className="absolute -top-[20px] w-[240px] h-[60px] left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(0,229,255,0.07) 0%, transparent 70%)',
            }}
          />
          <button
            onClick={onOpen}
            className="inline-flex items-center gap-[8px] px-[26px] py-[11px] rounded-[10px] bg-accent text-text-inv font-bold text-[13px] tracking-[-0.01em] border-none cursor-pointer shadow-[0_4px_28px_rgba(0,229,255,0.25)] transition-all duration-200 hover:brightness-110 hover:-translate-y-[1px] hover:shadow-[0_8px_36px_rgba(0,229,255,0.35)] active:translate-y-0 font-sans"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2.5 7.5h10M8.5 3l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Get Started
          </button>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.5 }}
            className="mt-[24px]"
          >
            <button
              onClick={() => navigate('/docs')}
              className="inline-flex items-center gap-[6px] text-[11px] text-text3 hover:text-accent transition-colors bg-transparent border-none cursor-pointer font-sans"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2.5v7M3 5l3-2.5L9 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Documentation
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
