import { useState, useRef, useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { esc } from '@/lib/utils'
import { PANE_COLORS } from '@/types'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableTab({ id, name, color, isActive, onSelect, onRemove, canRemove, onRename }: {
  id: string
  name: string
  color?: string
  isActive: boolean
  onSelect: () => void
  onRemove: (e: React.MouseEvent) => void
  canRemove: boolean
  onRename: (name: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDoubleClick = useCallback(() => {
    setEditing(true)
    setEditVal(name)
    setTimeout(() => inputRef.current?.select(), 50)
  }, [name])

  const finishEdit = useCallback(() => {
    setEditing(false)
    if (editVal.trim()) onRename(editVal.trim())
  }, [editVal, onRename])

  const [showColorPicker, setShowColorPicker] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-[6px] px-3 h-7 rounded-t-[5px] text-[11px] font-semibold cursor-grab active:cursor-grabbing whitespace-nowrap transition-all duration-100 border border-transparent border-b-0 font-sans select-none ${
        isActive
          ? 'bg-bg-elevated text-text border-border-med'
          : 'bg-transparent text-text3 hover:bg-bg-hover hover:text-text2'
      }`}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={finishEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') finishEdit(); if (e.key === 'Escape') setEditing(false) }}
          className="bg-bg-base border border-border-med rounded-[3px] text-[11px] px-1 py-0 w-[80px] outline-none focus:border-accent text-text"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          {color && (
            <span
              className="w-[8px] h-[8px] rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
          )}
          {esc(name)}
        </>
      )}
      {!editing && (
        <div className="flex items-center gap-[2px] ml-auto">
          {canRemove && (
            <button
              onClick={onRemove}
              className="w-[14px] h-[14px] rounded-[3px] flex items-center justify-center cursor-pointer bg-none border-none text-text3 transition-all duration-100 hover:bg-red/20 hover:text-rose"
            >
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <path d="M1 1l5 5M6 1L1 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker) }}
              className="w-[14px] h-[14px] rounded-[3px] flex items-center justify-center cursor-pointer bg-none border-none text-text3 transition-all duration-100 hover:bg-bg-hover hover:text-text"
              title="Tab color"
            >
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <circle cx="3.5" cy="3.5" r="3" fill={color || 'none'} stroke="currentColor" strokeWidth="0.8" />
              </svg>
            </button>
            {showColorPicker && (
              <div
                className="absolute top-[18px] left-0 z-50 bg-bg-elevated border border-border-med rounded-[6px] p-2 flex gap-1 flex-wrap w-[120px] shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                onClick={(e) => e.stopPropagation()}
              >
                {PANE_COLORS.map((tc) => (
                  <button
                    key={tc.value}
                    onClick={() => { useStore.getState().setTabColor(id, tc.value || undefined); setShowColorPicker(false) }}
                    className={`w-[18px] h-[18px] rounded-full border-2 ${color === tc.value || (!color && !tc.value) ? 'border-accent' : 'border-border-med hover:border-text3'}`}
                    style={{ backgroundColor: tc.value || 'transparent' }}
                    title={tc.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function TabBar() {
  const tabs = useStore((s) => s.tabs)
  const activeTabId = useStore((s) => s.activeTabId)
  const switchTab = useStore((s) => s.switchTab)
  const removeTab = useStore((s) => s.removeTab)
  const addTab = useStore((s) => s.addTab)
  const setTabName = useStore((s) => s.setTabName)
  const reorderTabs = useStore((s) => s.reorderTabs)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = tabs.findIndex((t) => t.id === active.id)
    const newIdx = tabs.findIndex((t) => t.id === over.id)
    if (oldIdx !== -1 && newIdx !== -1) reorderTabs(oldIdx, newIdx)
  }

  return (
    <div className="h-[38px] bg-bg-surface border-b border-border flex items-end px-[10px] gap-[2px] flex-shrink-0 overflow-x-auto">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tabs.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
          {tabs.map((t) => (
            <SortableTab
              key={t.id}
              id={t.id}
              name={t.name}
              color={t.color}
              isActive={t.id === activeTabId}
              onSelect={() => switchTab(t.id)}
              onRemove={(e) => { e.stopPropagation(); removeTab(t.id) }}
              canRemove={tabs.length > 1}
              onRename={(name) => { if (t.id === activeTabId) setTabName(name) }}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button
        onClick={addTab}
        className="w-[26px] h-[26px] rounded-[4px] flex items-center justify-center cursor-pointer bg-none border-none text-text3 transition-all duration-100 hover:bg-bg-hover hover:text-text mb-[1px] flex-shrink-0"
        title="New tab (Alt+T)"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
