export type PaneDirection = 'horizontal' | 'vertical'
export type OutputFormat = 'wt' | 'bat'
export type ThemeMode = 'dark' | 'light'
export interface Pane {
  id: string
  type: 'pane'
  name: string
  workingDirectory: string
  commands: string[]
  color?: string
  env?: string
  delay?: number
  shell?: string
  colorScheme?: string
  tabColor?: string
}

export interface Split {
  id: string
  type: 'split'
  direction: PaneDirection
  children: TreeNode[]
  sizes: number[]
}

export type TreeNode = Pane | Split

export interface Tab {
  id: string
  name: string
  root: TreeNode
  color?: string
}

export type TemplateName = 'fullstack' | '3tier' | 'microservices' | 'monorepo'

export interface SavedState {
  tabs: Tab[]
  projectName: string
  outputFormat: OutputFormat
  fullscreen: boolean
  maximized?: boolean
  activeTabId: string
  selectedPaneId: string | null
}

export interface CommandSnippet {
  id: string
  name: string
  commands: string[]
  directory?: string
}

export interface PaneProfile {
  id: string
  name: string
  pane: Omit<Pane, 'id'>
}

export interface ProjectMeta {
  id: string
  name: string
  savedAt: number
}

export interface ThemeConfig {
  mode: ThemeMode
  accent: string
}

export interface ColorScheme {
  name: string
  background: string
  foreground: string
  cursorColor?: string
  selectionBackground?: string
  black: string
  red: string
  green: string
  yellow: string
  blue: string
  purple: string
  cyan: string
  white: string
  brightBlack: string
  brightRed: string
  brightGreen: string
  brightYellow: string
  brightBlue: string
  brightPurple: string
  brightCyan: string
  brightWhite: string
}

export const SHELLS = [
  { name: 'Command Prompt', value: 'cmd.exe' },
  { name: 'PowerShell', value: 'powershell.exe' },
  { name: 'PowerShell Core', value: 'pwsh.exe' },
  { name: 'WSL Default', value: 'wsl.exe' },
  { name: 'Windows Terminal Default', value: '' },
] as const

export const PANE_COLORS = [
  { name: 'None', value: '' },
  { name: 'Cyan', value: '#00e5ff' },
  { name: 'Blue', value: '#3b78ff' },
  { name: 'Green', value: '#13a10e' },
  { name: 'Amber', value: '#c19c00' },
  { name: 'Orange', value: '#f5a623' },
  { name: 'Rose', value: '#f06a6a' },
  { name: 'Purple', value: '#881798' },
] as const
