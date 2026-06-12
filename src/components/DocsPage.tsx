import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'


const SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    content: `WinTerm Pilot is a visual builder for Windows Terminal (wt.exe) launch scripts. Instead of hand-writing complex wt command-line arguments, you design your terminal layout visually — add tabs, split panes horizontally or vertically, configure each pane's shell, directory, commands, and color scheme — then export a ready-to-run script.

The main interface has four areas: the title bar (menus), the toolbar (quick actions), the sidebar (pane properties, themes, profiles, snippets, projects), and the canvas (the visual layout editor). The output panel at the bottom shows the generated script in real time.`,
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: `From the landing page, click "Open Builder" or press Enter to start. The canvas shows your first tab and pane. Use the toolbar to add panes, split them, or apply a template.

Keyboard shortcuts:
  · Ctrl+N — New project (resets everything)
  · Ctrl+Z / Ctrl+Shift+Z — Undo / Redo
  · Alt+H / Alt+V — Split pane horizontal / vertical
  · Alt+D — Delete selected pane
  · Alt+Z — Toggle zoom on selected pane
  · Ctrl+Tab / Ctrl+Shift+Tab — Cycle tabs forward / backward
  · Arrow keys — Navigate between panes`,
  },
  {
    id: 'tabs',
    title: 'Tabs',
    content: `Tabs are top-level containers that each hold an independent layout tree. Use them to separate different concerns — one tab for backend services, another for frontend tooling, a third for database monitors.

Add a tab with the + button in the tab bar. Rename a tab by double-clicking its label. Reorder tabs by dragging them. Remove a tab using the context menu (right-click) or by selecting it and pressing the delete key — the last tab cannot be removed.

Each tab remembers its own pane structure, split positions, and per-pane configuration independently.`,
  },
  {
    id: 'layout-builder',
    title: 'Layout Builder',
    content: `The canvas is a WYSIWYG editor for your terminal layout. Each rectangle represents a terminal pane that will become a wt.exe pane at runtime.

Split a pane in two by selecting it and using Split Horizontal (Alt+H) or Split Vertical (Alt+V). The original pane stays on the left/top, and a new pane appears on the right/bottom. You can continue splitting any pane to build complex layouts.

Drag the divider between panes to resize them. The sizes update in real time and the output script adjusts accordingly.

Delete a pane (Alt+D) to remove it from the layout. If a split has only one child after deletion, it collapses automatically.

Click any pane to select it — the sidebar shows its configuration. The selected pane has a highlighted border.`,
  },
  {
    id: 'pane-config',
    title: 'Pane Configuration',
    content: `Select a pane on the canvas to configure it in the sidebar:

  · Name — A label for the pane (used in the output script as --title)
  · Working Directory — The starting directory for the terminal (the -d flag)
  · Commands — One or more commands to execute on launch. Add multiple commands to run them sequentially within the pane.
  · Shell — The executable to run: cmd.exe, powershell.exe, pwsh.exe, wsl.exe, or a custom path
  · Environment Variables — Key=value pairs set before the commands execute
  · Startup Delay — Milliseconds to wait before running commands (useful for services that need initialization time)
  · Tab Color — A color swatch applied to the terminal tab
  · Color Scheme — A Windows Terminal color scheme (One Half Dark, Solarized, Vintage, etc.)

Changes apply immediately and the output script updates in real time.`,
  },
  {
    id: 'profiles',
    title: 'Profiles',
    content: `Profiles let you save a pane's configuration (all settings except the pane ID) and reapply it to any other pane with one click.

To create a profile: configure a pane the way you want, click "Save as Profile" in the sidebar properties, give it a name, and it's stored locally.

To apply a profile: select any pane, find the profile in the Profiles section of the sidebar, and click its name. The pane inherits all settings from the profile.

Profiles persist across sessions via localStorage. Delete unwanted profiles from the Profiles panel.`,
  },
  {
    id: 'snippets',
    title: 'Snippets',
    content: `Snippets are reusable command sequences. Save a set of commands with a name and optional working directory, then apply them to any pane in one click.

Use snippets for common tasks like starting a dev server, running tests, or launching docker containers. They're stored locally and available across sessions.`,
  },
  {
    id: 'themes',
    title: 'Themes & Appearance',
    content: `The application has two visual themes: Dark (default) and Light. Toggle between them in View > Theme or in the Theme panel in the sidebar.

The accent color controls highlights throughout the UI — buttons, borders, cursors, and selection indicators. Choose from preset colors in View > Accent Color or the Theme panel.

The accent color does not affect the generated Windows Terminal script — use per-pane color schemes for that.`,
  },
  {
    id: 'templates',
    title: 'Templates',
    content: `Templates provide a starting point with preconfigured multi-pane layouts. Four templates are available:

  · Fullstack — Client and server panes with shared tooling tab
  · 3-Tier — Presentation, business logic, and data layer tabs
  · Microservices — Multiple independent service panes in a grid
  · Monorepo — Packages, apps, and shared configuration tabs

Select a template from the toolbar dropdown. It replaces the current layout (undo is available). Each template sets sensible defaults for directories and commands that you can customize afterward.`,
  },
  {
    id: 'output-formats',
    title: 'Output Formats',
    content: `Two output formats are available, toggled from the toolbar:

  · wt (Windows Terminal) — Generates a full wt.exe command with new-tab, split-pane, --tabColor, -d, -p, --colorScheme, and other flags. This is the preferred format for Windows Terminal users.

  · bat (Batch File) — Generates a simple batch script that uses start commands. Each pane becomes a new window running its configured shell and commands. No Windows Terminal-specific features like color schemes or split panes.

The output panel shows the generated script. Click the copy icon to copy it to your clipboard, or use File > Download Script (Alt+S) to save it as a .bat file.`,
  },
  {
    id: 'export-import',
    title: 'Export & Import',
    content: `  · Export Layout (Ctrl+E) — Saves the entire layout (tabs, panes, all configuration) as a JSON file. Import it later or share with others.

  · Import Layout (Ctrl+I) — Opens a JSON file to restore a previously exported layout. The current layout is replaced (undo is available).

  · Share via URL — The app reads a ?layout= parameter from the URL on load. Encode your layout as base64 JSON and pass it as the layout query parameter to share a layout as a link.

  · Auto-Save — The app saves a snapshot every 30 seconds. Up to 10 versions are retained in localStorage.`,
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    content: `  · Script doesn't launch? Make sure Windows Terminal (wt.exe) is installed and available in your PATH. Run wt --version from a command prompt to verify.

  · WSL not working? Ensure the WSL distribution is installed. Use wsl.exe as the shell and ~ as the working directory for WSL paths.

  · Layout looks wrong? Zones display within a pane may not match the output layout exactly due to differences in how zones vs wt split-pane work. The output script is authoritative.

  · Data lost? Check localStorage for winterm-pilot (auto-save state), winterm-versions (version history), and winterm-projects (saved projects). The app does not use server-side storage.`,
  },
]

export function DocsPage() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash) {
      const el = document.getElementById(hash)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
      }
    }
  }, [location.hash])

  return (
    <div className="fixed inset-0 z-50 bg-bg-base overflow-y-auto">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 20%, black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 20%, black 0%, transparent 100%)',
          }}
        />
        <div
          className="absolute left-1/2 top-[10%] -translate-x-1/2 w-[700px] h-[500px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,229,255,0.05) 0%, transparent 65%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[860px] mx-auto px-6 py-[48px]">
        {/* Back link */}
        <button
          onClick={() => navigate('/app')}
          className="flex items-center gap-[6px] text-[11px] text-text3 hover:text-accent transition-colors mb-[28px] cursor-pointer bg-transparent border-none font-sans"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Builder
        </button>

        {/* Header */}
        <div className="mb-[36px]">
          <div className="flex items-center gap-[10px] mb-[10px]">
            <div className="w-[32px] h-[32px] rounded-[8px] bg-accent/15 flex items-center justify-center text-accent">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3 4.5l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M7.5 8.5h3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
              </svg>
            </div>
            <h1 className="text-[22px] font-extrabold tracking-[-0.03em] text-text">Documentation</h1>
          </div>
          <p className="text-[13px] text-text2 leading-[1.7] max-w-[720px]">
            Everything you need to know about building, configuring, and exporting Windows Terminal
            launch scripts with WinTerm Pilot.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-[32px] bg-bg-surface border border-border-med rounded-[10px] p-[14px]">
          <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-text3 mb-[8px]">Contents</div>
          <div className="flex flex-wrap gap-x-[16px] gap-y-[4px]">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-[11px] text-text2 hover:text-accent transition-colors no-underline"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <div
            key={section.id}
            id={section.id}
            className="mb-[20px] bg-bg-surface border border-border-med rounded-[10px] p-[18px] scroll-mt-[24px]"
          >
            <h2 className="text-[14px] font-bold text-text mb-[10px]">{section.title}</h2>
            <div className="text-[12px] text-text2 leading-[1.8] whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}

        {/* Keyboard Shortcuts */}
        <div
          id="shortcuts"
          className="mb-[24px] bg-bg-surface border border-border-med rounded-[10px] p-[18px] scroll-mt-[24px]"
        >
          <h2 className="text-[14px] font-bold text-text mb-[10px]">Keyboard Shortcuts Reference</h2>
          <div className="grid grid-cols-[1fr_1fr] gap-x-[20px] gap-y-[6px]">
            {[
              { keys: 'Ctrl+N', desc: 'New project' },
              { keys: 'Ctrl+Z', desc: 'Undo' },
              { keys: 'Ctrl+Shift+Z', desc: 'Redo' },
              { keys: 'Ctrl+I', desc: 'Import layout' },
              { keys: 'Ctrl+E', desc: 'Export layout' },
              { keys: 'Alt+S', desc: 'Download script' },
              { keys: 'Alt+H', desc: 'Split horizontal' },
              { keys: 'Alt+V', desc: 'Split vertical' },
              { keys: 'Alt+D', desc: 'Delete selected pane' },
              { keys: 'Alt+Z', desc: 'Toggle pane zoom' },
              { keys: 'Ctrl+Tab', desc: 'Cycle tabs forward' },
              { keys: 'Ctrl+Shift+Tab', desc: 'Cycle tabs backward' },
              { keys: 'Alt+N', desc: 'New project (with confirmation)' },
              { keys: '↑ ↓ ← →', desc: 'Navigate panes' },
              { keys: 'Enter', desc: 'Open builder (on landing page)' },
            ].map((shortcut) => (
              <div key={shortcut.keys} className="flex items-center justify-between py-[2px]">
                <kbd className="px-[5px] py-[1px] rounded-[3px] bg-bg-elevated border border-border-strong text-[9px] font-mono text-accent whitespace-nowrap">
                  {shortcut.keys}
                </kbd>
                <span className="text-[11px] text-text2 ml-3">{shortcut.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub */}
        <div className="text-center pb-[48px]">
          <a
            href="https://github.com/your-username/winterm-pilot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[8px] px-[16px] py-[9px] rounded-[8px] bg-bg-surface border border-border-med text-[12px] text-text2 hover:text-accent hover:border-accent/30 transition-all duration-200 no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
