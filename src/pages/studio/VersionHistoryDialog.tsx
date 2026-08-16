import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { icons, messages } from "@/constants"
import type { DocDocument, VersionSnapshot } from "@/document-engine/types"
import { toast } from "sonner"
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <icons.pendingReviews className="size-4 text-primary" />
            {editor.versionHistory}
          </SheetTitle>
          <SheetDescription>{editor.versionHistoryDescription}</SheetDescription>
        </SheetHeader>

        <div className="space-y-2 border-b border-border/60 p-4">
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
            disabled={!note.trim()}
            onClick={() => {
              onSaveVersion(note.trim())
              toast(messages.studio.toasts.versionSaved)
              setNote("")
            }}
          >
            <icons.sparkles className="size-4" />
            {editor.saveVersion}
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {versions.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <icons.pendingReviews className="size-5 text-muted-foreground" />
              </span>
              <p className="text-xs text-muted-foreground">
                {messages.common.emptyResult}
              </p>
            </div>
          )}
          {versions.map((version) => (
            <div
              key={version.id}
              className="group rounded-xl border border-border/60 bg-card p-3 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-xs font-semibold">
                  <span className="flex size-5 items-center justify-center rounded-md bg-primary/10 font-mono text-[10px] text-primary">
                    v{version.version}
                  </span>
                  <span className="text-[10px] font-normal text-muted-foreground">
                    {new Date(version.savedAt).toLocaleString()}
                  </span>
                </p>
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
              <p className="mt-1.5 text-xs text-muted-foreground">{version.note}</p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
