import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { messages } from "@/constants"
import type { DocDocument, VersionSnapshot } from "@/document-engine/types"
import { cn } from "@/lib/utils"

interface VersionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  versions: VersionSnapshot[]
  onSaveVersion: (note: string) => void
  onRestore: (snapshot: DocDocument) => void
}

export function VersionHistoryDialog({
  open,
  onOpenChange,
  versions,
  onSaveVersion,
  onRestore,
}: VersionHistoryDialogProps) {
  const editor = messages.studio.editor
  const [note, setNote] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editor.versionHistory}</DialogTitle>
          <DialogDescription>{editor.variablesDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Textarea
            value={note}
            placeholder={editor.versionNotePlaceholder}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            className="min-h-0 resize-none text-xs"
          />
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={() => {
              if (note.trim()) {
                onSaveVersion(note.trim())
                setNote("")
              }
            }}
          >
            {editor.saveVersion}
          </Button>
        </div>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {versions.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {messages.common.emptyResult}
            </p>
          )}
          {versions.map((version) => (
            <div
              key={version.id}
              className="flex items-center justify-between gap-2 rounded-lg border p-2.5"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-semibold">
                  v{version.version}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {new Date(version.savedAt).toLocaleString()}
                  </span>
                </p>
                <p className="truncate text-xs text-muted-foreground">{version.note}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn("h-7 shrink-0 px-2 text-xs")}
                onClick={() => {
                  onRestore(version.snapshot)
                  onOpenChange(false)
                }}
              >
                {editor.restore}
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {messages.common.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
