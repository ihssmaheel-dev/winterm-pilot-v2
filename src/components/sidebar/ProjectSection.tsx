import { useStore } from '@/store/useStore'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'

export function ProjectSection() {
  const projectName = useStore((s) => s.projectName)
  const setProjectName = useStore((s) => s.setProjectName)
  const fullscreen = useStore((s) => s.fullscreen)
  const setFullscreen = useStore((s) => s.setFullscreen)
  const activeTab = useStore((s) => s.activeTab())
  const setTabName = useStore((s) => s.setTabName)

  return (
    <div className="px-[14px] py-[14px] border-b border-border">
      <div className="flex items-center gap-[6px] mb-[10px]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3 5h4M5 3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-text3">Project</span>
      </div>

      <Input
        label="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="my-project"
      />
      <Input
        label="Active Tab Name"
        value={activeTab?.name || ''}
        onChange={(e) => setTabName(e.target.value)}
        placeholder="Tab name"
      />
      <Checkbox
        label="Launch in fullscreen (-F flag)"
        checked={fullscreen}
        onChange={(e) => setFullscreen(e.target.checked)}
      />
    </div>
  )
}
