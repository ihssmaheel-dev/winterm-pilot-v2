import { describe, it, expect } from 'vitest'
import { generateBat } from '@/lib/generators'
import type { Tab, Pane } from '@/types'

function makePane(id: string, name: string, dir = 'C:\\project', cmds: string[] = ['code .']): Pane {
  return { id, type: 'pane', name, workingDirectory: dir, commands: [...cmds] }
}

const uid = () => 'n' + Math.random().toString(36).slice(2)

describe('generateBat', () => {
  it('generates a bat file with @echo off header', () => {
    const tab: Tab = { id: uid(), name: 'Dev', root: makePane(uid(), 'Main') }
    const result = generateBat([tab], 'test-project')
    expect(result).toContain('@echo off')
    expect(result).toContain('REM Dev Launcher: test-project')
  })

  it('includes pane commands', () => {
    const pane = makePane(uid(), 'Main', 'C:\\app', ['npm start'])
    const tab: Tab = { id: uid(), name: 'Dev', root: pane }
    const result = generateBat([tab], 'test')
    expect(result).toContain('npm start')
  })

  it('includes working directory in start command', () => {
    const pane = makePane(uid(), 'Main', 'C:\\my-app', ['npm run dev'])
    const tab: Tab = { id: uid(), name: 'Dev', root: pane }
    const result = generateBat([tab], 'test')
    expect(result).toContain('cd /d C:\\my-app')
  })

  it('handles empty commands with echo fallback', () => {
    const pane = makePane(uid(), 'Main', 'C:\\app', [''])
    const tab: Tab = { id: uid(), name: 'Dev', root: pane }
    const result = generateBat([tab], 'test')
    expect(result).toContain('echo Ready')
  })

  it('includes delay via timeout command', () => {
    const pane: Pane = { ...makePane(uid(), 'Main', 'C:\\app'), delay: 5 }
    const tab: Tab = { id: uid(), name: 'Dev', root: pane }
    const result = generateBat([tab], 'test')
    expect(result).toContain('timeout /t 5')
  })

  it('includes env variables before command', () => {
    const pane: Pane = { ...makePane(uid(), 'Main', 'C:\\app'), env: 'SET NODE_ENV=production' }
    const tab: Tab = { id: uid(), name: 'Dev', root: pane }
    const result = generateBat([tab], 'test')
    expect(result).toContain('SET NODE_ENV=production')
  })

  it('generates multiple tabs', () => {
    const t1: Tab = { id: uid(), name: 'Frontend', root: makePane(uid(), 'FE') }
    const t2: Tab = { id: uid(), name: 'Backend', root: makePane(uid(), 'BE') }
    const result = generateBat([t1, t2], 'test')
    expect(result).toContain('REM === Frontend ===')
    expect(result).toContain('REM === Backend ===')
  })
})
