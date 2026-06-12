import type { Tab, TreeNode, Pane } from '@/types'
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

export function generateWT(tabs: Tab[], fullscreen: boolean, maximized: boolean, projectName: string): string {
  const lines = ['@echo off', '', `REM Dev Launcher: ${projectName}`, '']
  let flags = ''
  if (fullscreen) flags += ' -F'
  else if (maximized) flags += ' -M'
  let wtCmd = 'wt' + flags

  tabs.forEach((tab, tIdx) => {
    const panes = allPanes(tab.root)
    if (!panes.length) return
    const rects = getPaneRects(tab.root, 0, 0, 1000, 1000)
    const anchor = repPane(tab.root)
    let focId = anchor.id
    const aDir = anchor.workingDirectory || '.'
    const titleArg = tab.name ? `--title "${tab.name}"` : ''
    const tabColorArg = tab.color ? `--tabColor "${tab.color}"` : ''
    const suppressArg = tab.name ? '--suppressApplicationTitle' : ''

    let cmdStr =
      tIdx === 0
        ? `${titleArg} ${tabColorArg} ${suppressArg} -d "${aDir}"${paneFlags(anchor)}${commandSuffix(anchor)}`
        : `; new-tab ${titleArg} ${tabColorArg} ${suppressArg} -d "${aDir}"${paneFlags(anchor)}${commandSuffix(anchor)}`

    function rec(node: TreeNode) {
      if (node.type !== 'split') return
      const count = node.children.length
      const sizes = node.sizes?.length === count ? node.sizes : node.children.map(() => 100 / count)

      for (let i = 1; i < node.children.length; i++) {
        const pr = repPane(node.children[i - 1])
        const tr = repPane(node.children[i])
        cmdStr += genNav(focId, pr.id, rects)
        focId = pr.id
        const sumR = sizes.slice(i).reduce((a, b) => a + b, 0)
        const sumC = sizes.slice(i - 1).reduce((a, b) => a + b, 0)
        const ratio = sumC > 0 ? sumR / sumC : 0.5
        const flag = node.direction === 'horizontal' ? '-H' : '-V'
        cmdStr += ` ; split-pane ${flag} -s ${ratio.toFixed(2)} -d "${tr.workingDirectory || '.'}"${paneFlags(tr)}${commandSuffix(tr)}`
        focId = tr.id
      }

      for (let i = 0; i < node.children.length; i++) {
        const rp = repPane(node.children[i])
        cmdStr += genNav(focId, rp.id, rects)
        focId = rp.id
        rec(node.children[i])
      }

      const na = repPane(node)
      cmdStr += genNav(focId, na.id, rects)
      focId = na.id
    }

    rec(tab.root)
    wtCmd += ' ' + cmdStr
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
