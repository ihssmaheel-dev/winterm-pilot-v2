import { create } from 'zustand'
import type {
  Tab, TreeNode, Pane, OutputFormat, PaneDirection, SavedState,
  ThemeConfig, CommandSnippet, PaneProfile, ProjectMeta,
} from '@/types'
import { uid } from '@/lib/utils'
import { findNode, replaceNode, removeNode, updPane, resizeSplit, countPanes, findParentSplit, recalcSizes } from '@/lib/tree'
import { loadTemplate } from '@/lib/templates'
import { getPaneRects, findPath } from '@/lib/navigation'

const MAX_HISTORY = 50

function mkPane(name = 'Main', dir = 'C:\\Projects\\my-project', cmds: string[] = ['code .', 'npm run dev'], extra: Partial<Pane> = {}): Pane {
  return { id: uid(), type: 'pane', name, workingDirectory: dir, commands: [...cmds], ...extra }
}

function mkSplit(dir: PaneDirection, children: TreeNode[], sizes: number[]): TreeNode {
  return { id: uid(), type: 'split', direction: dir, children, sizes }
}

function snap(s: AppState): SavedState {
  return {
    tabs: s.tabs,
    projectName: s.projectName,
    outputFormat: s.outputFormat,
    fullscreen: s.fullscreen,
    maximized: s.maximized,
    activeTabId: s.activeTabId,
    selectedPaneId: s.selectedPaneId,
  }
}

interface AppState {
  projectName: string
  outputFormat: OutputFormat
  fullscreen: boolean
  maximized: boolean
  setFullscreen: (v: boolean) => void
  setMaximized: (v: boolean) => void
  setProjectName: (s: string) => void
  duplicatePane: () => void
  resetSizes: () => void
  hydrate: (s: SavedState) => void
  toJSON: () => SavedState

  // Undo/Redo
  undo: () => void
  redo: () => void
  pushHistory: () => void

  // Theme
  setTheme: (t: Partial<ThemeConfig>) => void

  // Snippets
  addSnippet: (s: Omit<CommandSnippet, 'id'>) => void
  removeSnippet: (id: string) => void

  // Profiles
  addProfile: (name: string, pane: Pane) => void
  removeProfile: (id: string) => void
  applyProfile: (profile: PaneProfile) => void

  // Projects
  saveProject: () => void
  loadProject: (id: string) => void
  deleteProject: (id: string) => void

  // Auto-save
  saveAutoVersion: () => void

  // Computed
  activeTab: () => Tab
  selectedPane: () => Pane | null
  totalPaneCount: () => number
}

const initialTab = { id: uid(), name: 'Dev', root: mkPane('Main') }

const defaultTheme: ThemeConfig = { mode: 'dark', accent: '#00e5ff' }

const savedTheme = (() => {
  try {
    const t = JSON.parse(localStorage.getItem('winterm-theme') || 'null')
    return t || defaultTheme
  } catch { return defaultTheme }
})()

const savedSnippets: CommandSnippet[] = (() => {
  try { return JSON.parse(localStorage.getItem('winterm-snippets') || '[]') } catch { return [] }
})()

const savedProfiles: PaneProfile[] = (() => {
  try { return JSON.parse(localStorage.getItem('winterm-profiles') || '[]') } catch { return [] }
})()

const savedProjects: ProjectMeta[] = (() => {
  try { return JSON.parse(localStorage.getItem('winterm-projects') || '[]') } catch { return [] }
})()

const savedVersions: SavedState[] = (() => {
  try { return JSON.parse(localStorage.getItem('winterm-versions') || '[]') } catch { return [] }
})()

export const useStore = create<AppState>((set, get) => ({
  projectName: 'my-project',
  outputFormat: 'wt' as OutputFormat,
  fullscreen: false,
  maximized: false,
  tabs: [initialTab],
  activeTabId: initialTab.id,
  selectedPaneId: initialTab.root.id,

  theme: savedTheme,
  snippets: savedSnippets,
  profiles: savedProfiles,
  projects: savedProjects,
  autoSaveVersions: savedVersions,

  zoomedPaneId: null,

  history: [],
  future: [],

  pushHistory: () => {
    set((s) => ({
      history: [...s.history.slice(-(MAX_HISTORY - 1)), snap(s as unknown as AppState)],
      future: [],
    }))
  },

  undo: () => {
    const s = get()
    if (!s.history.length) return
    const prev = s.history[s.history.length - 1]
    const newHistory = s.history.slice(0, -1)
    set({
      ...prev,
      history: newHistory,
      future: [snap(s as unknown as AppState), ...s.future],
    })
  },

  redo: () => {
    const s = get()
    if (!s.future.length) return
    const next = s.future[0]
    set({
      ...next,
      history: [...s.history, snap(s as unknown as AppState)],
      future: s.future.slice(1),
    })
  },

  addTab: () => {
    get().pushHistory()
    const id = uid()
    set((s) => ({
      tabs: [...s.tabs, { id, name: `Tab ${s.tabs.length + 1}`, root: mkPane('Main') }],
      activeTabId: id,
      selectedPaneId: id,
    }))
  },

  removeTab: (id: string) => {
    const s = get()
    if (s.tabs.length <= 1) return
    s.pushHistory()
    const newTabs = s.tabs.filter((t) => t.id !== id)
    let newId = s.activeTabId
    if (s.activeTabId === id) {
      newId = newTabs[0].id
    }
    set({ tabs: newTabs, activeTabId: newId, selectedPaneId: newTabs.find((t) => t.id === newId)?.root.id ?? null })
  },

  switchTab: (id: string) => {
    set((s) => {
      const t = s.tabs.find((t) => t.id === id)
      if (!t) return {}
      return { activeTabId: id, selectedPaneId: t.root.id }
    })
  },

  setTabName: (name: string) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === s.activeTabId ? { ...t, name } : t)),
    }))
  },

  setTabColor: (id: string, color: string | undefined) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, color } : t)),
    }))
  },

  reorderTabs: (from: number, to: number) => {
    set((s) => {
      const tabs = [...s.tabs]
      const [moved] = tabs.splice(from, 1)
      tabs.splice(to, 0, moved)
      return { tabs }
    })
  },

  splitSelected: (dir: PaneDirection) => {
    const s = get()
    s.pushHistory()
    const { selectedPaneId } = s
    if (!selectedPaneId) return
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab) return
    const target = findNode(tab.root, selectedPaneId)
    if (!target) return

    const np = mkPane(
      target.type === 'pane' ? target.name + ' (2)' : 'New Pane',
      target.type === 'pane' ? target.workingDirectory : 'C:\\Projects\\my-project',
    )
    const ns = mkSplit(dir, [target, np], [50, 50])
    const newRoot = replaceNode(tab.root, selectedPaneId, ns)
    set((st) => ({
      tabs: st.tabs.map((t) => (t.id === st.activeTabId ? { ...t, root: newRoot } : t)),
      selectedPaneId: np.id,
    }))
  },

  deleteSelected: () => {
    const s = get()
    s.pushHistory()
    const { selectedPaneId } = s
    if (!selectedPaneId) return
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab) return
    const nr = removeNode(tab.root, selectedPaneId)
    if (!nr) {
      const newPane = mkPane('Main')
      set((st) => ({
        tabs: st.tabs.map((t) => (t.id === st.activeTabId ? { ...t, root: newPane } : t)),
        selectedPaneId: newPane.id,
      }))
    } else {
      set((st) => ({
        tabs: st.tabs.map((t) => (t.id === st.activeTabId ? { ...t, root: nr } : t)),
        selectedPaneId: nr.id,
      }))
    }
  },

  selectPane: (id: string | null) => {
    set({ selectedPaneId: id })
  },

  updatePane: (id: string, updates: Partial<Pane>) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === s.activeTabId ? { ...t, root: updPane(t.root, id, updates) } : t)),
    }))
  },

  addCommand: (cmd: string) => {
    const s = get()
    const { selectedPaneId } = s
    if (!selectedPaneId) return
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab) return
    const n = findNode(tab.root, selectedPaneId)
    if (!n || n.type !== 'pane') return
    const updated = updPane(tab.root, selectedPaneId, { commands: [...n.commands, cmd] })
    set((st) => ({
      tabs: st.tabs.map((t) => (t.id === st.activeTabId ? { ...t, root: updated } : t)),
    }))
  },

  resizeSplit: (splitId: string, childIndex: number, delta: number) => {
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === s.activeTabId ? { ...t, root: resizeSplit(t.root, splitId, childIndex, delta) } : t)),
    }))
  },

  togglePaneZoom: (paneId: string) => {
    set((s) => ({
      zoomedPaneId: s.zoomedPaneId === paneId ? null : paneId,
    }))
  },

  focusUp: () => {
    const s = get()
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab || !s.selectedPaneId) return
    const rects = getPaneRects(tab.root, 0, 0, 1000, 1000)
    const cur = rects.get(s.selectedPaneId)
    if (!cur) return
    let best: string | null = null
    let bestOv = 0
    for (const [id, r] of rects.entries()) {
      if (id === s.selectedPaneId) continue
      if (Math.abs(cur.y - (r.y + r.h)) > 0.5) continue
      const ov = Math.max(0, Math.min(cur.x + cur.w, r.x + r.w) - Math.max(cur.x, r.x))
      if (ov > bestOv) { best = id; bestOv = ov }
    }
    if (best) set({ selectedPaneId: best })
  },

  focusDown: () => {
    const s = get()
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab || !s.selectedPaneId) return
    const rects = getPaneRects(tab.root, 0, 0, 1000, 1000)
    const cur = rects.get(s.selectedPaneId)
    if (!cur) return
    let best: string | null = null
    let bestOv = 0
    for (const [id, r] of rects.entries()) {
      if (id === s.selectedPaneId) continue
      if (Math.abs(r.y - (cur.y + cur.h)) > 0.5) continue
      const ov = Math.max(0, Math.min(cur.x + cur.w, r.x + r.w) - Math.max(cur.x, r.x))
      if (ov > bestOv) { best = id; bestOv = ov }
    }
    if (best) set({ selectedPaneId: best })
  },

  focusLeft: () => {
    const s = get()
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab || !s.selectedPaneId) return
    const rects = getPaneRects(tab.root, 0, 0, 1000, 1000)
    const cur = rects.get(s.selectedPaneId)
    if (!cur) return
    let best: string | null = null
    let bestOv = 0
    for (const [id, r] of rects.entries()) {
      if (id === s.selectedPaneId) continue
      if (Math.abs(cur.x - (r.x + r.w)) > 0.5) continue
      const ov = Math.max(0, Math.min(cur.y + cur.h, r.y + r.h) - Math.max(cur.y, r.y))
      if (ov > bestOv) { best = id; bestOv = ov }
    }
    if (best) set({ selectedPaneId: best })
  },

  focusRight: () => {
    const s = get()
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab || !s.selectedPaneId) return
    const rects = getPaneRects(tab.root, 0, 0, 1000, 1000)
    const cur = rects.get(s.selectedPaneId)
    if (!cur) return
    let best: string | null = null
    let bestOv = 0
    for (const [id, r] of rects.entries()) {
      if (id === s.selectedPaneId) continue
      if (Math.abs(r.x - (cur.x + cur.w)) > 0.5) continue
      const ov = Math.max(0, Math.min(cur.y + cur.h, r.y + r.h) - Math.max(cur.y, r.y))
      if (ov > bestOv) { best = id; bestOv = ov }
    }
    if (best) set({ selectedPaneId: best })
  },

  resizePaneUp: () => {
    const s = get()
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab || !s.selectedPaneId) return
    const found = findParentSplit(tab.root, s.selectedPaneId)
    if (!found || found.split.direction !== 'horizontal') return
    const before = (found.split.sizes[found.childIndex - 1] ?? 0)
    if (found.childIndex === 0 || before <= 15) return
    s.pushHistory()
    set((st) => ({
      tabs: st.tabs.map((t) =>
        t.id === st.activeTabId
          ? { ...t, root: resizeSplit(t.root, found.split.id, found.childIndex - 1, -5) }
          : t
      ),
    }))
  },

  resizePaneDown: () => {
    const s = get()
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab || !s.selectedPaneId) return
    const found = findParentSplit(tab.root, s.selectedPaneId)
    if (!found || found.split.direction !== 'horizontal') return
    const after = (found.split.sizes[found.childIndex + 1] ?? 0)
    if (found.childIndex >= found.split.children.length - 1 || after <= 15) return
    s.pushHistory()
    set((st) => ({
      tabs: st.tabs.map((t) =>
        t.id === st.activeTabId
          ? { ...t, root: resizeSplit(t.root, found.split.id, found.childIndex, 5) }
          : t
      ),
    }))
  },

  resizePaneLeft: () => {
    const s = get()
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab || !s.selectedPaneId) return
    const found = findParentSplit(tab.root, s.selectedPaneId)
    if (!found || found.split.direction !== 'vertical') return
    const before = (found.split.sizes[found.childIndex - 1] ?? 0)
    if (found.childIndex === 0 || before <= 15) return
    s.pushHistory()
    set((st) => ({
      tabs: st.tabs.map((t) =>
        t.id === st.activeTabId
          ? { ...t, root: resizeSplit(t.root, found.split.id, found.childIndex - 1, -5) }
          : t
      ),
    }))
  },

  resizePaneRight: () => {
    const s = get()
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab || !s.selectedPaneId) return
    const found = findParentSplit(tab.root, s.selectedPaneId)
    if (!found || found.split.direction !== 'vertical') return
    const after = (found.split.sizes[found.childIndex + 1] ?? 0)
    if (found.childIndex >= found.split.children.length - 1 || after <= 15) return
    s.pushHistory()
    set((st) => ({
      tabs: st.tabs.map((t) =>
        t.id === st.activeTabId
          ? { ...t, root: resizeSplit(t.root, found.split.id, found.childIndex, 5) }
          : t
      ),
    }))
  },

  loadTemplate: (name: string) => {
    get().pushHistory()
    const tabs = loadTemplate(name as never)
    set({ tabs, activeTabId: tabs[0].id, selectedPaneId: tabs[0].root.id })
  },

  resetProject: () => {
    get().pushHistory()
    const tab = { id: uid(), name: 'Dev', root: mkPane('Main') }
    set({
      projectName: 'my-project',
      outputFormat: 'wt' as OutputFormat,
      fullscreen: false,
      maximized: false,
      tabs: [tab],
      activeTabId: tab.id,
      selectedPaneId: tab.root.id,
    })
  },

  setOutputFormat: (fmt: OutputFormat) => set({ outputFormat: fmt }),
  setFullscreen: (v: boolean) => set({ fullscreen: v }),
  setMaximized: (v: boolean) => set({ maximized: v }),
  setProjectName: (s: string) => set({ projectName: s }),

  duplicatePane: () => {
    const s = get()
    s.pushHistory()
    const { selectedPaneId } = s
    if (!selectedPaneId) return
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab) return
    const target = findNode(tab.root, selectedPaneId)
    if (!target || target.type !== 'pane') return
    const clone: Pane = JSON.parse(JSON.stringify({ ...target, id: uid(), name: target.name + ' (2)' }))
    const parent = findParentSplit(tab.root, target.id)
    if (parent) {
      const children = [...parent.split.children]
      children.splice(parent.childIndex + 1, 0, clone)
      const newRoot = replaceNode(tab.root, parent.split.id, {
        ...parent.split,
        children,
        sizes: children.map(() => 100 / children.length),
      })
      set((state) => ({
        tabs: state.tabs.map((t) => (t.id === state.activeTabId ? { ...t, root: newRoot } : t)),
        selectedPaneId: clone.id,
      }))
    } else {
      const ns = mkSplit('vertical', [target, clone], [50, 50])
      set((state) => ({
        tabs: state.tabs.map((t) => (t.id === state.activeTabId ? { ...t, root: ns } : t)),
        selectedPaneId: clone.id,
      }))
    }
  },

  resetSizes: () => {
    const s = get()
    s.pushHistory()
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === state.activeTabId ? { ...t, root: recalcSizes(t.root) } : t)),
    }))
  },

  hydrate: (s: SavedState) => {
    get().pushHistory()
    set({
      tabs: s.tabs,
      projectName: s.projectName,
      outputFormat: s.outputFormat,
      fullscreen: s.fullscreen,
      maximized: s.maximized,
      activeTabId: s.activeTabId,
      selectedPaneId: s.selectedPaneId,
    })
  },

  toJSON: () => {
    const s = get()
    return {
      tabs: s.tabs,
      projectName: s.projectName,
      outputFormat: s.outputFormat,
      fullscreen: s.fullscreen,
      maximized: s.maximized,
      activeTabId: s.activeTabId,
      selectedPaneId: s.selectedPaneId,
    }
  },

  setTheme: (t: Partial<ThemeConfig>) => {
    set((s) => {
      const theme = { ...s.theme, ...t }
      localStorage.setItem('winterm-theme', JSON.stringify(theme))
      if (theme.mode === 'light') {
        document.documentElement.setAttribute('data-theme', 'light')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }
      document.documentElement.style.setProperty('--color-accent', theme.accent)
      return { theme }
    })
  },

  addSnippet: (s: Omit<CommandSnippet, 'id'>) => {
    const snippet = { ...s, id: uid() }
    set((st) => {
      const snippets = [...st.snippets, snippet]
      localStorage.setItem('winterm-snippets', JSON.stringify(snippets))
      return { snippets }
    })
  },

  removeSnippet: (id: string) => {
    set((st) => {
      const snippets = st.snippets.filter((x) => x.id !== id)
      localStorage.setItem('winterm-snippets', JSON.stringify(snippets))
      return { snippets }
    })
  },

  addProfile: (name: string, pane: Pane) => {
    const { id, ...rest } = pane
    const profile: PaneProfile = { id: uid(), name, pane: rest }
    set((st) => {
      const profiles = [...st.profiles, profile]
      localStorage.setItem('winterm-profiles', JSON.stringify(profiles))
      return { profiles }
    })
  },

  removeProfile: (id: string) => {
    set((st) => {
      const profiles = st.profiles.filter((x) => x.id !== id)
      localStorage.setItem('winterm-profiles', JSON.stringify(profiles))
      return { profiles }
    })
  },

  applyProfile: (profile: PaneProfile) => {
    const s = get()
    const { selectedPaneId } = s
    if (!selectedPaneId) return
    s.updatePane(selectedPaneId, { ...profile.pane })
  },

  saveProject: () => {
    const s = get()
    const id = uid()
    const meta: ProjectMeta = { id, name: s.projectName, savedAt: Date.now() }
    localStorage.setItem(`winterm-project-${id}`, JSON.stringify({ meta, state: snap(s as unknown as AppState) }))
    set((st) => {
      const projects = [...st.projects.filter((p) => p.id !== id), meta]
      localStorage.setItem('winterm-projects', JSON.stringify(projects))
      return { projects }
    })
  },

  loadProject: (id: string) => {
    try {
      const raw = localStorage.getItem(`winterm-project-${id}`)
      if (!raw) return
      const { state } = JSON.parse(raw)
      get().hydrate(state)
    } catch { /* ignore */ }
  },

  deleteProject: (id: string) => {
    localStorage.removeItem(`winterm-project-${id}`)
    set((st) => {
      const projects = st.projects.filter((p) => p.id !== id)
      localStorage.setItem('winterm-projects', JSON.stringify(projects))
      return { projects }
    })
  },

  saveAutoVersion: () => {
    set((st) => {
      const versions = [...st.autoSaveVersions.slice(-9), snap(st as unknown as AppState)]
      localStorage.setItem('winterm-versions', JSON.stringify(versions))
      return { autoSaveVersions: versions }
    })
  },

  activeTab: () => {
    const s = get()
    return s.tabs.find((t) => t.id === s.activeTabId) || s.tabs[0]
  },

  selectedPane: () => {
    const s = get()
    const tab = s.tabs.find((t) => t.id === s.activeTabId)
    if (!tab || !s.selectedPaneId) return null
    const n = findNode(tab.root, s.selectedPaneId)
    return n?.type === 'pane' ? n : null
  },

  totalPaneCount: () => {
    const s = get()
    return s.tabs.reduce((a, t) => a + countPanes(t.root), 0)
  },
}))
