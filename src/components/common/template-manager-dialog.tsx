import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { icons, messages } from "@/constants"
import { resumeTemplates } from "@/data/resumeTemplates"
import { RESUME_PREVIEW_CLASSES, renderLatex } from "@/lib/latexPreview"
import { cn } from "@/lib/utils"

type TemplateManagerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTemplateId: string
  onSelect: (templateId: string) => void
}

export function TemplateManagerDialog({
  open,
  onOpenChange,
  activeTemplateId,
  onSelect,
}: TemplateManagerDialogProps) {
  const previews = useMemo(
    () =>
      new Map(
        resumeTemplates.map((template) => [template.id, renderLatex(template.source)])
      ),
    []
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85svh] gap-4 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{messages.templates.managerTitle}</DialogTitle>
          <DialogDescription>
            {messages.templates.managerDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {resumeTemplates.map((template) => {
            const active = template.id === activeTemplateId
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  onSelect(template.id)
                  onOpenChange(false)
                }}
                className={cn(
                  "group rounded-2xl border p-2 text-left transition-all",
                  active
                    ? "border-primary/70 bg-primary/5 ring-1 ring-primary/30"
                    : "border-border/60 bg-card shadow-xs hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
                )}
              >
                <div className="pointer-events-none max-h-40 overflow-hidden rounded-xl bg-white [color-scheme:light] ring-1 ring-border/40">
                  <div
                    className={cn(RESUME_PREVIEW_CLASSES, "p-3 [&_a]:!text-primary")}
                    dangerouslySetInnerHTML={{ __html: previews.get(template.id) ?? "" }}
                  />
                  <div className="h-8 bg-gradient-to-b from-transparent to-white" />
                </div>
                <div className="flex items-center gap-2 px-1 pt-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{template.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                  <Button
                    variant={active ? "secondary" : "outline"}
                    size="sm"
                    className="shrink-0"
                  >
                    <icons.plus className="size-3.5" />
                    {messages.templates.useTemplate}
                  </Button>
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
