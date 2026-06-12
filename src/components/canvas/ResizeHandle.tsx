import { useRef, useCallback, useState } from 'react'
import { useStore } from '@/store/useStore'
import type { PaneDirection } from '@/types'

interface ResizeHandleProps {
  splitId: string
  childIndex: number
  direction: PaneDirection
}

export function ResizeHandle({ splitId, childIndex, direction }: ResizeHandleProps) {
  const resizeSplit = useStore((s) => s.resizeSplit)
  const dragging = useRef(false)
  const lastPosRef = useRef(0)
  const containerSizeRef = useRef(0)
  const [hover, setHover] = useState(false)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      dragging.current = true

      const handle = e.currentTarget as HTMLElement
      const container = handle.parentElement
      containerSizeRef.current = direction === 'horizontal'
        ? container?.offsetHeight ?? 500
        : container?.offsetWidth ?? 500
      lastPosRef.current = direction === 'horizontal' ? e.clientY : e.clientX

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return
        const currentPos = direction === 'horizontal' ? ev.clientY : ev.clientX
        const pixelDelta = currentPos - lastPosRef.current
        lastPosRef.current = currentPos
        const percentDelta = (pixelDelta / containerSizeRef.current) * 100
        resizeSplit(splitId, childIndex, percentDelta)
      }

      const handleMouseUp = () => {
        dragging.current = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [splitId, childIndex, direction, resizeSplit],
  )

  const isH = direction === 'horizontal'

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`flex-shrink-0 flex items-center justify-center transition-colors duration-100 relative ${
        isH
          ? 'w-full h-[6px] cursor-row-resize'
          : 'h-full w-[6px] cursor-col-resize'
      } ${hover ? 'bg-accent/15' : 'bg-transparent'}`}
    >
      <div
        className={`rounded-full transition-all duration-75 ${
          isH
            ? 'w-[24px] h-[3px]'
            : 'h-[24px] w-[3px]'
        } ${hover ? 'bg-accent/60' : 'bg-border-med'}`}
      />
    </div>
  )
}
