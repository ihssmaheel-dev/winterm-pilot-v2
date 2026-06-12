import type { Tab, TreeNode, Pane, Split } from '@/types'
import { allPanes, repPane } from './tree'
import { getPaneRects, genNav } from './navigation'

function shellFlag(p: Pane): string {
  if (!p.shell) return ''
  return ` -p "${p.shell}"`
}

function colorSchemeFlag(p: Pane): string {
  return p.colorScheme ? ` --colorScheme "${p.colorScheme}"` : ''
}

function tabColorFlag(p: Pane): string {
  return p.tabColor ? ` --tabColor "${p.tabColor}"` : ''
}

function commandSuffix(p: Pane): string {
  const cmds = p.commands.filter(c => c.trim()).join(' && ') || 'echo Ready'
  const delay = p.delay ? `timeout /t ${p.delay} /nobreak >nul & ` : ''
  const env = p.env ? `${p.env.trim()} && ` : ''
  const fullCmd = `${env}${delay}${cmds}`

  if (!p.shell || p.shell === 'cmd.exe') {
    return ` cmd /k "${fullCmd}"`
  }
  return ` "${fullCmd}"`
}

function paneFlags(p: Pane): string {
  return `${colorSchemeFlag(p)}${tabColorFlag(p)}${shellFlag(p)}`
}

function buildFlags(fullscreen: boolean, maximized: boolean): string {
  if (fullscreen) return ' -F'
  if (maximized) return ' -M'
  return ''
}

function buildTabHeader(tab: Tab, tIdx: number, anchor: Pane): { cmdStr: string; focId: string } {
  const aDir = anchor.workingDirectory || '.'
  const titleArg = tab.name ? `--title "${tab.name}"` : ''
  const tabColorArg = tab.color ? `--tabColor "${tab.color}"` : ''
  const suppressArg = tab.name ? '--suppressApplicationTitle' : ''

  const cmdStr =
    tIdx === 0
      ? `${titleArg} ${tabColorArg} ${suppressArg} -d "${aDir}"${paneFlags(anchor)}${commandSuffix(anchor)}`
      : `; new-tab ${titleArg} ${tabColorArg} ${suppressArg} -d "${aDir}"${paneFlags(anchor)}${commandSuffix(anchor)}`

  return { cmdStr, focId: anchor.id }
}

function buildSplitCommands(node: Split, focId: string, rects: Map<string, { x: number; y: number; w: number; h: number }>): { cmdStr: string; focId: string }[] {
  const results: { cmdStr: string; focId: string }[] = []
  const count = node.children.length
  const sizes = node.sizes?.length === count ? node.sizes : node.children.map(() => 100 / count)
  let currentFoc = focId

  for (let i = 1; i < node.children.length; i++) {
    const pr = repPane(node.children[i - 1])
    const tr = repPane(node.children[i])
    results.push({ cmdStr: genNav(currentFoc, pr.id, rects), focId: pr.id })
    const sumR = sizes.slice(i).reduce((a, b) => a + b, 0)
    const sumC = sizes.slice(i - 1).reduce((a, b) => a + b, 0)
    const ratio = sumC > 0 ? sumR / sumC : 0.5
    const flag = node.direction === 'horizontal' ? '-H' : '-V'
    results.push({ cmdStr: ` ; split-pane ${flag} -s ${ratio.toFixed(2)} -d "${tr.workingDirectory || '.'}"${paneFlags(tr)}${commandSuffix(tr)}`, focId: tr.id })
    currentFoc = tr.id
  }

  for (let i = 0; i < node.children.length; i++) {
    const rp = repPane(node.children[i])
    results.push({ cmdStr: genNav(currentFoc, rp.id, rects), focId: rp.id })
    currentFoc = rp.id
    if (node.children[i].type === 'split') {
      results.push(...buildSplitCommands(node.children[i] as Split, currentFoc, rects))
    }
    const na = repPane(node)
    results.push({ cmdStr: genNav(currentFoc, na.id, rects), focId: na.id })
    currentFoc = na.id
  }

  return results
}

export function generateWT(tabs: Tab[], fullscreen: boolean, maximized: boolean, projectName: string): string {
  const lines = ['@echo off', '', `REM Dev Launcher: ${projectName}`, '']
  let wtCmd = 'wt' + buildFlags(fullscreen, maximized)

  tabs.forEach((tab, tIdx) => {
    const panes = allPanes(tab.root)
    if (!panes.length) return
    const rects = getPaneRects(tab.root, 0, 0, 1000, 1000)
    const anchor = repPane(tab.root)
    const { cmdStr, focId } = buildTabHeader(tab, tIdx, anchor)
    let cmdBuf = cmdStr
    let currentFoc = focId

    function rec(node: TreeNode) {
      if (node.type !== 'split') return
      const commands = buildSplitCommands(node, currentFoc, rects)
      for (const c of commands) {
        cmdBuf += c.cmdStr
        currentFoc = c.focId
      }
    }

    rec(tab.root)
    wtCmd += ' ' + cmdBuf
  })

  return lines.join('\r\n') + '\r\n' + wtCmd
}

export function generateBat(tabs: Tab[], projectName: string): string {
  const lines = ['@echo off', '', `REM Dev Launcher: ${projectName}`, '']

  tabs.forEach((tab) => {
    lines.push(`REM === ${tab.name} ===`)
    allPanes(tab.root).forEach((p: Pane) => {
      const cmd = p.commands.filter(c => c.trim()).join(' && ') || 'echo Ready'
      const env = p.env ? `${p.env.trim()} && ` : ''
      const delay = p.delay ? `timeout /t ${p.delay} /nobreak >nul & ` : ''
      const fullCmd = `${env}${delay}${cmd}`
      lines.push(`start "${p.name}" cmd /k "cd /d ${p.workingDirectory} && ${fullCmd}"`)
    })
    lines.push('')
  })

  return lines.join('\r\n')
}
