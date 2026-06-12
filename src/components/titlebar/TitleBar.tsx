import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { PANE_COLORS } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { downloadJsonFile, downloadTextFile, getScriptContent } from '@/lib/export'

interface MenuItem {
  label: string
  shortcut?: string
  icon?: ReactNode
  action: () => void
  divider?: boolean
  submenu?: { label: string; action: () => void; checked?: boolean }[]
}

function MenuDropdown({ label, items, isOpen, onToggle, onMouseEnter }: { label: string; items: MenuItem[]; isOpen: boolean; onToggle: () => void; onMouseEnter: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [activeSub, setActiveSub] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) { const t = setTimeout(() => setActiveSub(null), 0); return () => clearTimeout(t) }
  }, [isOpen])

  return (
    <div ref={ref} className="relative h-full" onKeyDown={(e) => {
      if (e.key === 'Escape') { onToggle(); return }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const buttons = ref.current?.querySelectorAll<HTMLElement>('[data-menuitem]')
        if (!buttons) return
        const idx = Array.from(buttons).findIndex((b) => b === document.activeElement)
        const next = e.key === 'ArrowDown'
          ? (idx + 1) % buttons.length
          : (idx - 1 + buttons.length) % buttons.length
        buttons[next]?.focus()
      }
    }}>
      <div
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={onToggle}
        onMouseEnter={onMouseEnter}
        className={`h-full flex items-center px-[10px] text-[12px] cursor-default transition-colors duration-100 outline-none focus-visible:bg-bg-hover select-none ${isOpen ? 'bg-bg-hover text-text' : 'text-text2 hover:bg-bg-hover'}`}
      >
        {label}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full left-0 z-[200] min-w-[220px] p-1 rounded-[12px] bg-bg-surface/85 backdrop-blur-acrylic border border-border-strong shadow-[0_16px_48px_rgba(0,0,0,0.4)]"
          >
            <div className="flex flex-col gap-[1px]">
              {items.map((item, i) => {
                if (item.divider) {
                  return <div key={i} className="h-[1px] bg-border-med mx-[6px] my-[3px]" />
                }
                if (item.submenu) {
                  return (
                    <div key={i} className="relative"
                      onMouseEnter={() => setActiveSub(item.label)}
                      onMouseLeave={() => setActiveSub(null)}
                    >
                      <div
                        data-menuitem
                        tabIndex={0}
                        className="flex items-center justify-between px-[10px] py-[7px] rounded-[6px] cursor-pointer transition-colors duration-100 hover:bg-bg-hover text-[12px] text-text"
                      >
                        <span>{item.label}</span>
                        <svg width="6" height="8" viewBox="0 0 6 8" fill="none">
                          <path d="M1 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <AnimatePresence>
                        {activeSub === item.label && (
                          <motion.div
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            transition={{ duration: 0.08 }}
                            className="absolute left-full top-0 z-[201] min-w-[160px] p-1 rounded-[10px] bg-bg-surface/85 backdrop-blur-acrylic border border-border-strong shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                          >
                            {item.submenu.map((sub, j) => (
                              <div
                                key={j}
                                data-menuitem
                                tabIndex={0}
                                onClick={() => { sub.action(); onToggle() }}
                                className="flex items-center justify-between px-[10px] py-[7px] rounded-[6px] cursor-pointer transition-colors duration-100 hover:bg-bg-hover text-[12px] text-text"
                              >
                                <span>{sub.label}</span>
                                {sub.checked !== undefined && (
                                  <div className={`w-[7px] h-[7px] rounded-full ${sub.checked ? 'bg-accent' : 'border border-border-med'}`} />
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }
                return (
                  <div
                    key={i}
                    data-menuitem
                    tabIndex={0}
                    onClick={() => { item.action(); onToggle() }}
                    className="flex items-center justify-between px-[10px] py-[7px] rounded-[6px] cursor-pointer transition-colors duration-100 hover:bg-bg-hover"
                  >
                    <div className="flex items-center gap-[10px]">
                      {item.icon && <span className="w-[14px] h-[14px] flex items-center justify-center text-text3">{item.icon}</span>}
                      <span className="text-[12px] text-text">{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <span className="text-[9px] font-mono text-text3 ml-4">{item.shortcut}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function TitleBar() {
  const navigate = useNavigate()
  const resetProject = useStore((s) => s.resetProject)
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const splitSelected = useStore((s) => s.splitSelected)
  const deleteSelected = useStore((s) => s.deleteSelected)
  const fullscreen = useStore((s) => s.fullscreen)
  const setFullscreen = useStore((s) => s.setFullscreen)
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const selectedPane = useStore((s) => s.selectedPane())
  const togglePaneZoom = useStore((s) => s.togglePaneZoom)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  const toggleMenu = useCallback((label: string) => {
    setActiveMenu((prev) => (prev === label ? null : label))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-menubar]') && !target.closest('[data-menuitem]')) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      <div className="h-8 bg-bg-surface border-b border-border flex items-center flex-shrink-0 user-select-none" data-menubar>
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className="w-8 h-8 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors duration-100 hover:bg-bg-hover"
          title="Home"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="12" height="12" rx="2" stroke="#00e5ff" strokeWidth="1.2" />
            <path d="M3 4.5l2 2-2 2" stroke="#38d9c0" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M7.5 8.5h3.5" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          </svg>
        </div>

        {/* Menus */}
        <div className="flex items-center h-full">
          {/* File */}
          <MenuDropdown label="File" isOpen={activeMenu === 'File'} onToggle={() => toggleMenu('File')} onMouseEnter={() => { if (activeMenu) setActiveMenu('File') }} items={[
            {
              label: 'New Project', shortcut: 'Ctrl+N', action: () => resetProject(),
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M6 3v6M3 6h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
            },
            { divider: true, label: '', action: () => { } },
            {
              label: 'Import Layout', shortcut: 'Ctrl+I', action: () => document.querySelector<HTMLElement>('[data-import]')?.click(),
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 11V3M3 6l3-3 3 3M11 10H1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            },
            {
              label: 'Export Layout', shortcut: 'Ctrl+E', action: () => {
                downloadJsonFile(useStore.getState().toJSON(), `${useStore.getState().projectName || 'layout'}.json`)
              },
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v8M3 6l3 3 3-3M11 10H1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            },
            { divider: true, label: '', action: () => { } },
            {
              label: 'Download Script', shortcut: 'Alt+S', action: () => {
                const content = getScriptContent()
                if (content) downloadTextFile(content, `${useStore.getState().projectName || 'launcher'}.bat`)
              },
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v8M3.5 6.5L6 9l2.5-2.5M1.5 11h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            },
          ]} />

          {/* Edit */}
          <MenuDropdown label="Edit" isOpen={activeMenu === 'Edit'} onToggle={() => toggleMenu('Edit')} onMouseEnter={() => { if (activeMenu) setActiveMenu('Edit') }} items={[
            {
              label: 'Undo', shortcut: 'Ctrl+Z', action: () => undo(),
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7 9H4a3 3 0 010-6h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M5.5 6.5L4 5l1.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            },
            {
              label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => redo(),
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 9h3a3 3 0 000-6H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.5 6.5L8 5 6.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            },
            { divider: true, label: '', action: () => { } },
            {
              label: 'Split Horizontal', shortcut: 'Alt+H', action: () => splitSelected('horizontal'),
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="1" y="6.5" width="10" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.2" /></svg>,
            },
            {
              label: 'Split Vertical', shortcut: 'Alt+V', action: () => splitSelected('vertical'),
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="4.5" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="6.5" y="1" width="4.5" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" /></svg>,
            },
            {
              label: 'Delete Pane', shortcut: 'Alt+D', action: () => deleteSelected(),
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3.5h8M5 3.5V2.5h2v1M4.5 3.5l.5 6M7.5 3.5l-.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
            },
          ]} />

          {/* View */}
          <MenuDropdown label="View" isOpen={activeMenu === 'View'} onToggle={() => toggleMenu('View')} onMouseEnter={() => { if (activeMenu) setActiveMenu('View') }} items={[
            {
              label: 'Toggle Fullscreen', shortcut: '', action: () => setFullscreen(!fullscreen),
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 4V2h2.5M7 2h2.5v2M9.5 8v2H7M4 10H1.5V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
            },
            {
              label: 'Zoom Pane', shortcut: 'Alt+Z', action: () => { if (selectedPane) togglePaneZoom(selectedPane.id) },
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1v4M5 1H1M11 7v4H7M11 11V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
            },
            { divider: true, label: '', action: () => { } },
            {
              label: 'Theme', action: () => { },
              submenu: [
                { label: 'Dark', action: () => setTheme({ mode: 'dark' }), checked: theme.mode === 'dark' },
                { label: 'Light', action: () => setTheme({ mode: 'light' }), checked: theme.mode === 'light' },
              ],
            },
            {
              label: 'Accent Color', action: () => { },
              submenu: PANE_COLORS.filter(c => c.value).map((c) => ({
                label: c.name,
                action: () => setTheme({ accent: c.value }),
                checked: theme.accent === c.value,
              })),
            },
          ]} />

          {/* Help */}
          <MenuDropdown label="Help" isOpen={activeMenu === 'Help'} onToggle={() => toggleMenu('Help')} onMouseEnter={() => { if (activeMenu) setActiveMenu('Help') }} items={[
            {
              label: 'Keyboard Shortcuts', action: () => navigate('/docs#shortcuts'),
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" /><path d="M4 6h4M4 8h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
            },
            {
              label: 'About WinTerm Pilot', action: () => setShowAbout(true),
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" /><path d="M6 5.5v3M6 4v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
            },
            { divider: true, label: '', action: () => { } },
            {
              label: 'Documentation', action: () => navigate('/docs'),
              icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2.5v7M3 5l3-2.5L9 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
            },
          ]} />
        </div>

        {/* Title */}
        <div className="flex-1 h-full flex items-center justify-center">
          <span className="text-[12px] text-text3 font-mono tracking-[0.02em]">
            WinTerm Pilot — Windows Terminal Script Builder
          </span>
        </div>

        {/* GitHub + Close */}
        <div className="flex h-full flex-shrink-0">
          <a
            href="https://github.com/ihssmaheel-dev/winterm-pilot-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[38px] h-full flex items-center justify-center text-text3 hover:text-accent transition-colors duration-100 hover:bg-bg-hover"
            title="View on GitHub"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
          <div
            onClick={() => navigate('/')}
            className="w-[46px] h-full flex items-center justify-center cursor-pointer transition-colors duration-100 hover:bg-bg-hover hover:bg-red hover:brightness-100"
            title="Close"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="#9090b0" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* About Modal */}
      <Modal open={showAbout} onClose={() => setShowAbout(false)} title="About WinTerm Pilot"
        actions={<Button variant="primary" size="sm" onClick={() => setShowAbout(false)}>Close</Button>}
      >
        <div className="flex flex-col gap-[14px]">
          <div className="flex items-center gap-[12px]">
            <svg width="32" height="32" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="2" stroke="#00e5ff" strokeWidth="1.2" />
              <path d="M3 4.5l2 2-2 2" stroke="#38d9c0" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M7.5 8.5h3.5" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            </svg>
            <div>
              <div className="text-[14px] font-bold text-text">WinTerm Pilot</div>
              <div className="text-[10px] text-text3">v1.0.0</div>
            </div>
          </div>
          <p className="text-[12px] text-text2 leading-[1.7]">
            A visual builder for Windows Terminal (wt.exe) launch scripts. Design multi-tab,
            multi-pane terminal layouts through an intuitive interface, configure every pane
            with its own shell, working directory, commands, environment variables, and color
            scheme, then export a production-ready script that recreates your entire dev
            environment with a single command.
          </p>
          <p className="text-[12px] text-text2 leading-[1.7]">
            Features include: visual split-pane layout editor, per-pane configuration, tab
            management, reusable profiles and snippets, four built-in templates, real-time
            script preview in two output formats (wt and bat), undo/redo history, project
            save/load, auto-save versioning, and shareable layout URLs.
          </p>
          <p className="text-[12px] text-text2 leading-[1.7]">
            Built with React, TypeScript, Zustand, Framer Motion, and Tailwind CSS.
          </p>
        </div>
      </Modal>
    </>
  )
}
