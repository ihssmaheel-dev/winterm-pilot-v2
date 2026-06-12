import { describe, it, expect } from 'vitest'
import { findNode, replaceNode, removeNode, allPanes, countPanes, updPane, resizeSplit, recalcSizes, findParentSplit } from '@/lib/tree'
import type { TreeNode, Pane, Split } from '@/types'

function makePane(id: string, name = 'Main'): Pane {
  return { id, type: 'pane', name, workingDirectory: 'C:\\project', commands: ['code .'] }
}

function makeSplit(id: string, direction: 'horizontal' | 'vertical', children: TreeNode[], sizes: number[]): Split {
  return { id, type: 'split', direction, children, sizes }
}

describe('findNode', () => {
  it('finds a pane by id', () => {
    const pane = makePane('p1')
    expect(findNode(pane, 'p1')).toBe(pane)
  })

  it('returns null for missing id', () => {
    const pane = makePane('p1')
    expect(findNode(pane, 'missing')).toBeNull()
  })

  it('finds a node nested in splits', () => {
    const p1 = makePane('p1')
    const p2 = makePane('p2')
    const split = makeSplit('s1', 'vertical', [p1, p2], [50, 50])
    expect(findNode(split, 'p2')).toBe(p2)
    expect(findNode(split, 's1')).toBe(split)
  })
})

describe('replaceNode', () => {
  it('replaces a pane with another node', () => {
    const p1 = makePane('p1')
    const p2 = makePane('p2')
    const result = replaceNode(p1, 'p1', p2)
    expect(result).toBe(p2)
  })

  it('replaces a nested node', () => {
    const p1 = makePane('p1')
    const p2 = makePane('p2')
    const p3 = makePane('p3')
    const split = makeSplit('s1', 'vertical', [p1, p2], [50, 50])
    const result = replaceNode(split, 'p1', p3)
    expect(result.type).toBe('split')
    if (result.type === 'split') {
      expect(result.children[0]).toBe(p3)
    }
  })
})

describe('removeNode', () => {
  it('removes a pane and returns null if root', () => {
    const p1 = makePane('p1')
    expect(removeNode(p1, 'p1')).toBeNull()
  })

  it('collapses a split with one child after removal', () => {
    const p1 = makePane('p1')
    const p2 = makePane('p2')
    const p3 = makePane('p3')
    const inner = makeSplit('s2', 'horizontal', [p2, p3], [50, 50])
    const outer = makeSplit('s1', 'vertical', [p1, inner], [50, 50])
    const result = removeNode(outer, 'p1')
    expect(result).not.toBeNull()
    expect(result!.type).toBe('split')
    if (result!.type === 'split') {
      expect(result!.children).toHaveLength(2)
    }
  })
})

describe('allPanes', () => {
  it('returns single pane for a pane node', () => {
    const p1 = makePane('p1')
    expect(allPanes(p1)).toEqual([p1])
  })

  it('returns all panes in a split tree', () => {
    const p1 = makePane('p1')
    const p2 = makePane('p2')
    const p3 = makePane('p3')
    const split = makeSplit('s1', 'vertical', [p1, makeSplit('s2', 'horizontal', [p2, p3], [50, 50])], [50, 50])
    expect(allPanes(split)).toHaveLength(3)
  })
})

describe('countPanes', () => {
  it('counts panes in a tree', () => {
    const p1 = makePane('p1')
    const p2 = makePane('p2')
    const split = makeSplit('s1', 'vertical', [p1, p2], [50, 50])
    expect(countPanes(split)).toBe(2)
  })
})

describe('updPane', () => {
  it('updates a pane property', () => {
    const p1 = makePane('p1')
    const result = updPane(p1, 'p1', { name: 'Updated' })
    expect(result.type).toBe('pane')
    if (result.type === 'pane') {
      expect(result.name).toBe('Updated')
    }
  })

  it('returns original tree if pane not found', () => {
    const p1 = makePane('p1')
    const result = updPane(p1, 'missing', { name: 'Updated' })
    expect(result).toBe(p1)
  })
})

describe('resizeSplit', () => {
  it('resizes a split at the given child index', () => {
    const p1 = makePane('p1')
    const p2 = makePane('p2')
    const split = makeSplit('s1', 'vertical', [p1, p2], [50, 50])
    const result = resizeSplit(split, 's1', 0, 10)
    expect(result.type).toBe('split')
    if (result.type === 'split') {
      expect(result.sizes[0]).toBe(60)
      expect(result.sizes[1]).toBe(40)
    }
  })

  it('clamps to minimum size of 15', () => {
    const p1 = makePane('p1')
    const p2 = makePane('p2')
    const split = makeSplit('s1', 'vertical', [p1, p2], [20, 80])
    const result = resizeSplit(split, 's1', 0, -10)
    expect(result.type).toBe('split')
    if (result.type === 'split') {
      expect(result.sizes[0]).toBe(15)
      expect(result.sizes[1]).toBe(85)
    }
  })
})

describe('recalcSizes', () => {
  it('recalculates all split sizes to equal distribution', () => {
    const p1 = makePane('p1')
    const p2 = makePane('p2')
    const p3 = makePane('p3')
    const split = makeSplit('s1', 'vertical', [p1, p2, p3], [10, 80, 10])
    const result = recalcSizes(split)
    expect(result.type).toBe('split')
    if (result.type === 'split') {
      result.sizes.forEach((s) => expect(s).toBeCloseTo(100 / 3, 1))
    }
  })
})

describe('findParentSplit', () => {
  it('finds the parent split of a pane', () => {
    const p1 = makePane('p1')
    const p2 = makePane('p2')
    const split = makeSplit('s1', 'vertical', [p1, p2], [50, 50])
    const result = findParentSplit(split, 'p1')
    expect(result).not.toBeNull()
    expect(result!.split.id).toBe('s1')
    expect(result!.childIndex).toBe(0)
  })

  it('returns null for root node', () => {
    const p1 = makePane('p1')
    expect(findParentSplit(p1, 'p1')).toBeNull()
  })
})
