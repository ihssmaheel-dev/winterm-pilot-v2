import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

export function SnippetsBrowser() {
  const snippets = useStore((s) => s.snippets)
  const addSnippet = useStore((s) => s.addSnippet)
  const removeSnippet = useStore((s) => s.removeSnippet)
  const addCommand = useStore((s) => s.addCommand)
  const [name, setName] = useState('')
  const [commands, setCommands] = useState('')
  const [expanded, setExpanded] = useState(false)

  function handleSave() {
    if (!name.trim() || !commands.trim()) return
    addSnippet({
      name: name.trim(),
      commands: commands.split('\n').filter((c) => c.trim()),
    })
    setName('')
    setCommands('')
    setExpanded(false)
  }

  return (
    <div className="px-[14px] py-[14px] border-t border-border">
      <div className="flex items-center gap-[6px] mb-[10px]">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 1h6a1 1 0 011 1v6a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3.5 3.5h3M3.5 5.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-text3">
          Snippets {snippets.length > 0 && <span className="text-accent">({snippets.length})</span>}
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto text-text3 hover:text-text2 transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="mb-3 space-y-0">
          <Input
            label="Snippet Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Start frontend"
          />
          <Textarea
            label="Commands (one per line)"
            value={commands}
            onChange={(e) => setCommands(e.target.value)}
            rows={3}
            placeholder="npm run dev"
          />
          <Button variant="primary" size="sm" onClick={handleSave} className="w-full mt-1">
            Save Snippet
          </Button>
        </div>
      )}

      {snippets.length > 0 && (
        <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto">
          {snippets.map((s) => (
            <div
              key={s.id}
              className="group flex items-center gap-1 bg-bg-elevated rounded-[6px] px-[8px] py-[5px]"
            >
              <button
                onClick={() => {
                  s.commands.forEach((c) => addCommand(c))
                }}
                className="flex-1 text-left text-[11px] text-text2 hover:text-text transition-colors truncate"
                title={s.commands.join('\n')}
              >
                {s.name}
                <span className="text-text3 ml-1">({s.commands.length} cmd)</span>
              </button>
              <button
                onClick={() => removeSnippet(s.id)}
                className="opacity-0 group-hover:opacity-100 text-text3 hover:text-rose transition-all p-[2px]"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 1l6 6M7 1l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
