import type { TreeNode } from '@/types'

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export function getPaneRects(
  node: TreeNode,
  x = 0,
  y = 0,
  w = 1000,
  h = 1000,
  map = new Map<string, Rect>(),
): Map<string, Rect> {
  if (node.type === 'pane') {
    map.set(node.id, { x, y, w, h })
    return map
  }
  const count = node.children.length
  const sizes = node.sizes?.length === count ? node.sizes : node.children.map(() => 100 / count)
  let pos = node.direction === 'horizontal' ? y : x
  node.children.forEach((c, i) => {
    const s = sizes[i]
    const sAbs = ((node.direction === 'horizontal' ? h : w) * s) / 100
    getPaneRects(
      c,
      node.direction === 'horizontal' ? x : pos,
      node.direction === 'horizontal' ? pos : y,
      node.direction === 'horizontal' ? w : sAbs,
      node.direction === 'horizontal' ? sAbs : h,
      map,
    )
    pos += sAbs
  })
  return map
}

function ovlap(r1: Rect, r2: Rect, dir: 'horizontal' | 'vertical') {
  if (dir === 'horizontal')
    return Math.max(0, Math.min(r1.y + r1.h, r2.y + r2.h) - Math.max(r1.y, r2.y))
  return Math.max(0, Math.min(r1.x + r1.w, r2.x + r2.w) - Math.max(r1.x, r2.x))
}

function bestNbr(cid: string, cr: Rect, rects: Map<string, Rect>, dir: string) {
  const T = 0.5
  const cands: { id: string; overlap: number; metric: number }[] = []
  for (const [id, r] of rects.entries()) {
    if (id === cid) continue
    let ok = false
    if (dir === 'right') ok = Math.abs(cr.x + cr.w - r.x) < T
    if (dir === 'left') ok = Math.abs(cr.x - (r.x + r.w)) < T
    if (dir === 'down') ok = Math.abs(cr.y + cr.h - r.y) < T
    if (dir === 'up') ok = Math.abs(cr.y - (r.y + r.h)) < T
    if (ok) {
      const isH = dir === 'left' || dir === 'right'
      const ov = ovlap(cr, r, isH ? 'horizontal' : 'vertical')
      if (ov > T) cands.push({ id, overlap: ov, metric: isH ? r.y : r.x })
    }
  }
  if (!cands.length) return null
  cands.sort((a, b) =>
    Math.abs(b.overlap - a.overlap) > 0.5
      ? b.overlap - a.overlap
      : a.metric - b.metric,
  )
  return cands[0].id
}

export function findPath(from: string, to: string, rects: Map<string, Rect>): string[] {
  const q: { id: string; path: string[] }[] = [{ id: from, path: [] }]
  const vis = new Set([from])
  let i = 0
  while (q.length && i++ < 5000) {
    const cur = q.shift()!
    if (cur.id === to) return cur.path
    if (cur.path.length > 50) continue
    const r = rects.get(cur.id)
    if (!r) continue
    for (const dir of ['right', 'left', 'down', 'up']) {
      const nxt = bestNbr(cur.id, r, rects, dir)
      if (nxt && !vis.has(nxt)) {
        vis.add(nxt)
        q.push({ id: nxt, path: [...cur.path, `move-focus ${dir}`] })
      }
    }
  }
  return []
}

export function genNav(f: string, t: string, rects: Map<string, Rect>): string {
  if (f === t) return ''
  const p = findPath(f, t, rects)
  return p.length ? ' ; ' + p.join(' ; ') : ''
}
