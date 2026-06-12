import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface ProjectManagerProps {
  open: boolean
  onClose: () => void
}

export function ProjectManager({ open, onClose }: ProjectManagerProps) {
  const projects = useStore((s) => s.projects)
  const saveProject = useStore((s) => s.saveProject)
  const loadProject = useStore((s) => s.loadProject)
  const deleteProject = useStore((s) => s.deleteProject)
  const projectName = useStore((s) => s.projectName)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Project Manager"
      actions={
        <Button variant="primary" size="sm" onClick={() => { saveProject(); onClose() }}>
          Save Current
        </Button>
      }
    >
      <p className="text-[12px] text-text2 mb-3">
        Current project: <span className="text-text font-semibold">{projectName}</span>
      </p>

      {projects.length === 0 ? (
        <p className="text-[11px] text-text3 text-center py-4">No saved projects yet</p>
      ) : (
        <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
          {[...projects].reverse().map((p) => (
            <div
              key={p.id}
              className="group flex items-center gap-2 bg-bg-elevated rounded-[6px] px-[8px] py-[6px]"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
                <rect x="1" y="2.5" width="8" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3 2.5V2a1 1 0 011-1h2a1 1 0 011 1v.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-text truncate">{p.name}</div>
                <div className="text-[9px] text-text3">
                  {new Date(p.savedAt).toLocaleDateString()} {new Date(p.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button
                onClick={() => { loadProject(p.id); onClose() }}
                className="opacity-0 group-hover:opacity-100 text-text2 hover:text-accent transition-all p-[2px]"
                title="Load"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => deleteProject(p.id)}
                className="opacity-0 group-hover:opacity-100 text-text3 hover:text-rose transition-all p-[2px]"
                title="Delete"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1l6 6M7 1l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
