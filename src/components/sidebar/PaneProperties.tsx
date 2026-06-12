import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { PANE_COLORS, SHELLS } from "@/types";
import { COLOR_SCHEMES } from "@/lib/colorSchemes";

const QUICK_COMMANDS = [
  "code .",
  "cursor .",
  "zed .",
  "npm run dev",
  "npm start",
  "pnpm dev",
  "pnpm start",
  "yarn dev",
  "docker-compose up",
  "go run .",
  "cargo run",
  "python manage.py runserver",
  "uvicorn main:app --reload",
  "dotnet watch run",
  "bun dev",
];

export function PaneProperties() {
  const selectedPane = useStore((s) => s.selectedPane());
  const updatePane = useStore((s) => s.updatePane);
  const addCommand = useStore((s) => s.addCommand);
  const addProfile = useStore((s) => s.addProfile);
  const profiles = useStore((s) => s.profiles);
  const applyProfile = useStore((s) => s.applyProfile);
  const [profileName, setProfileName] = useState("");

  if (!selectedPane) {
    return (
      <div className="flex flex-col items-center justify-center h-[120px] gap-[8px] text-center px-5">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="opacity-15">
          <rect x="3" y="3" width="30" height="30" rx="4" stroke="#5c5c64" strokeWidth="1.5" />
          <path d="M3 10h30" stroke="#5c5c64" strokeWidth="1.5" />
          <path d="M12 20l3 3-3 3" stroke="#5c5c64" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M18 23h6" stroke="#5c5c64" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
        <p className="text-[11px] text-text3 leading-[1.5]">
          Select a pane in the<br />preview to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="px-[5px] py-[14px] space-y-0">
      <Input
        label="Pane Name"
        value={selectedPane.name}
        onChange={(e) => updatePane(selectedPane.id, { name: e.target.value })}
      />
      <Input
        label="Working Directory"
        value={selectedPane.workingDirectory}
        onChange={(e) => updatePane(selectedPane.id, { workingDirectory: e.target.value })}
      />
      <Textarea
        label={
          <>
            Startup Commands{" "}
            <span className="text-text3 font-normal">(one per line)</span>
          </>
        }
        value={selectedPane.commands.join("\n")}
        onChange={(e) => updatePane(selectedPane.id, { commands: e.target.value.split("\n") })}
        rows={4}
      />

      <Input
        label="Environment Variables"
        value={selectedPane.env || ""}
        placeholder="SET NODE_ENV=production"
        onChange={(e) => updatePane(selectedPane.id, { env: e.target.value })}
      />

      <Input
        label="Startup Delay (seconds)"
        value={selectedPane.delay?.toString() || ""}
        placeholder="0"
        type="number"
        min={0}
        max={300}
        onChange={(e) => updatePane(selectedPane.id, { delay: e.target.value ? parseInt(e.target.value) : undefined })}
      />

      {/* Shell Profile */}
      <label className="block text-[11px] font-semibold text-text2 mb-[6px] mt-3">Shell / Profile</label>
      <div className="mb-3">
        <Select
          value={selectedPane.shell || ""}
          onChange={(e) => updatePane(selectedPane.id, { shell: e.target.value || undefined })}
          options={SHELLS.map((s) => ({ label: s.name, value: s.value }))}
        />
      </div>

      {/* Color Scheme */}
      <label className="block text-[11px] font-semibold text-text2 mb-[6px]">Color Scheme</label>
      <div className="mb-3">
        <Select
          value={selectedPane.colorScheme || ""}
          onChange={(e) => updatePane(selectedPane.id, { colorScheme: e.target.value || undefined })}
          options={[
            { label: 'Default', value: '' },
            ...COLOR_SCHEMES.map((s) => ({ label: s.name, value: s.name })),
          ]}
        />
      </div>

      {/* Color picker */}
      <div className="mt-3 mb-4">
        <label className="block text-[11px] font-semibold text-text2 mb-[6px]">Pane Color</label>
        <div className="flex gap-[6px] flex-wrap">
          {PANE_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => updatePane(selectedPane.id, { color: c.value || undefined })}
              className={`w-[22px] h-[22px] rounded-full border-2 transition-all duration-100 ${
                selectedPane.color === c.value || (!selectedPane.color && !c.value)
                  ? "border-accent scale-110"
                  : "border-border-med hover:border-text3"
              }`}
              style={{ backgroundColor: c.value || "transparent" }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Tab Color */}
      <Input
        label="Tab Color"
        value={selectedPane.tabColor || ""}
        placeholder="#00e5ff"
        onChange={(e) => updatePane(selectedPane.id, { tabColor: e.target.value || undefined })}
      />

      {/* Save as Profile */}
      <div className="mb-3 flex items-center gap-2">
        <input
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="Profile name..."
          className="flex-1 bg-bg-elevated border border-border-med rounded-[6px] text-text text-[11px] px-[8px] py-[5px] outline-none focus:border-accent placeholder:text-text3"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && profileName.trim()) {
              addProfile(profileName.trim(), selectedPane)
              setProfileName("")
            }
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={!profileName.trim()}
          onClick={() => {
            addProfile(profileName.trim(), selectedPane)
            setProfileName("")
          }}
        >
          Save Profile
        </Button>
      </div>

      {/* Apply existing profiles */}
      {profiles.length > 0 && (
        <div className="mb-3">
          <label className="block text-[11px] font-semibold text-text2 mb-[6px]">Apply Profile</label>
          <div className="flex flex-wrap gap-1">
            {profiles.map((p) => (
              <Pill
                key={p.id}
                label={p.name}
                onClick={() => applyProfile(p)}
                icon={
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M2 4l1.5 1.5L6 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Commands */}
      <div>
        <label className="block text-[11px] font-semibold text-text2 mb-[6px]">Quick Add</label>
        <div className="flex flex-wrap gap-1">
          {QUICK_COMMANDS.map((cmd) => (
            <Pill
              key={cmd}
              label={cmd}
              onClick={() => addCommand(cmd)}
              icon={
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M4 1v6M1 4h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
