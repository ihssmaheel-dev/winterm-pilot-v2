import { Fragment } from 'react'
import type { TreeNode } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { PaneNode } from './PaneNode'
import { ResizeHandle } from './ResizeHandle'

interface SplitNodeProps {
  node: TreeNode
}

export function SplitNode({ node }: SplitNodeProps) {
  if (node.type === 'pane') {
    return <PaneNode node={node} />
  }

  const isH = node.direction === 'horizontal'
  const count = node.children.length
  const sizes = node.sizes?.length === count ? node.sizes : node.children.map(() => 100 / count)

  return (
    <div className={`flex w-full h-full ${isH ? 'flex-col' : 'flex-row'}`}>
      <AnimatePresence>
        {node.children.map((child, i) => (
          <Fragment key={child.id}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`flex ${isH ? 'flex-col' : 'flex-row'} min-w-0 min-h-0`}
              style={{ flex: `${sizes[i]} ${sizes[i]} 0%` }}
            >
              <SplitNode node={child} />
            </motion.div>
            {i < node.children.length - 1 && (
              <ResizeHandle
                splitId={node.id}
                childIndex={i}
                direction={node.direction}
              />
            )}
          </Fragment>
        ))}
      </AnimatePresence>
    </div>
  )
}
