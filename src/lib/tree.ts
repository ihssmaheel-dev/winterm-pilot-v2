import type { TreeNode, Pane, Split } from '@/types'

export function findNode(r: TreeNode, id: string): TreeNode | null {
  if (r.id === id) return r
  if (r.type === 'split')
    for (const c of r.children) {
      const f = findNode(c, id)
      if (f) return f
    }
  return null
}

export function replaceNode(r: TreeNode, id: string, n: TreeNode): TreeNode {
  if (r.id === id) return n
  if (r.type === 'split')
    return { ...r, children: r.children.map((c) => replaceNode(c, id, n)) }
  return r
}

export function removeNode(r: TreeNode, id: string): TreeNode | null {
  if (r.id === id) return null
  if (r.type === 'split') {
    const nc = r.children.map((c) => removeNode(c, id)).filter(Boolean) as TreeNode[]
    if (!nc.length) return null
    if (nc.length === 1) return nc[0]
    return { ...r, children: nc, sizes: nc.map(() => 100 / nc.length) }
  }
  return r
}

export function allPanes(r: TreeNode): Pane[] {
  return r.type === 'pane' ? [r] : r.children.flatMap(allPanes)
}

export function repPane(r: TreeNode): Pane {
  return r.type === 'pane' ? r : repPane(r.children[0])
}

export function countPanes(r: TreeNode): number {
  return r.type === 'pane' ? 1 : r.children.reduce((a, c) => a + countPanes(c), 0)
}

export function updPane(r: TreeNode, pid: string, u: Partial<Pane>): TreeNode {
  const n = findNode(r, pid)
  if (!n || n.type !== 'pane') return r
  return replaceNode(r, pid, { ...n, ...u })
}

export function resizeSplit(r: TreeNode, splitId: string, childIndex: number, delta: number): TreeNode {
  if (r.id === splitId && r.type === 'split') {
    const sizes = [...r.sizes]
    const minSize = 15
    let clamped
    if (delta > 0) {
      const maxGrow = sizes[childIndex + 1] - minSize
      clamped = Math.min(delta, maxGrow)
    } else {
      const maxShrink = sizes[childIndex] - minSize
      clamped = Math.max(delta, -maxShrink)
    }
    sizes[childIndex] += clamped
    if (sizes[childIndex + 1] !== undefined) sizes[childIndex + 1] -= clamped
    return { ...r, sizes }
  }
  if (r.type === 'split')
    return { ...r, children: r.children.map((c) => resizeSplit(c, splitId, childIndex, delta)) }
  return r
}

export function recalcSizes(r: TreeNode): TreeNode {
  if (r.type === 'split') {
    const count = r.children.length
    return { ...r, sizes: r.children.map(() => 100 / count), children: r.children.map(recalcSizes) }
  }
  return r
}

export function findParentSplit(r: TreeNode, id: string): { split: Split; childIndex: number } | null {
  if (r.type !== 'split') return null
  for (let i = 0; i < r.children.length; i++) {
    if (r.children[i].id === id) return { split: r as Split, childIndex: i }
    const found = findParentSplit(r.children[i], id)
    if (found) return found
  }
  return null
}
