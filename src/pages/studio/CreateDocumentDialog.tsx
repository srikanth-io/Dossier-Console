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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { messages } from "@/constants"
import type { LibraryDocument, Orientation, PageSizeId } from "@/document-engine/types"
import { PAGE_SIZE_LABELS } from "@/document-engine/pageSizes"
import { cn } from "@/lib/utils"

interface CreateDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: LibraryDocument[]
  onCreate: (options: {
    docType: string
    pageSize: PageSizeId
    orientation: Orientation
    from: { kind: "blank" } | { kind: "template"; id: string }
  }) => void
}

const PAGE_SIZES: { value: PageSizeId; label: string }[] = (
  Object.keys(PAGE_SIZE_LABELS) as PageSizeId[]
).map((sizeId) => ({ value: sizeId, label: PAGE_SIZE_LABELS[sizeId] }))

const ORIENTATIONS: { value: Orientation; label: string }[] = [
  { value: "portrait", label: messages.studio.wizard.portrait },
  { value: "landscape", label: messages.studio.wizard.landscape },
]

export function CreateDocumentDialog({
  open,
  onOpenChange,
  templates,
  onCreate,
}: CreateDocumentDialogProps) {
  const wizard = messages.studio.wizard
  const [step, setStep] = useState(0)
  const [docType, setDocType] = useState("blank")
  const [pageSize, setPageSize] = useState<PageSizeId>("a4")
  const [orientation, setOrientation] = useState<Orientation>("portrait")
  const [startMode, setStartMode] = useState<"blank" | "template" | "import">("blank")
  const [templateId, setTemplateId] = useState<string>("")

  const documentTypes: { value: string; label: string }[] = (
    Object.entries(wizard.documentTypes) as [string, string][]
  ).map(([value, label]) => ({ value, label }))

  const steps = [wizard.stepDocument, wizard.stepPage, wizard.stepOrientation, wizard.stepStart]

  const handleOpenChange = (next: boolean) => {
    setStep(0)
    setDocType("blank")
    setStartMode("blank")
    setTemplateId("")
    onOpenChange(next)
  }

  const canNext = startMode !== "template" || Boolean(templateId)

  const create = () => {
    onCreate({
      docType,
      pageSize,
      orientation,
      from: startMode === "template" && templateId ? { kind: "template", id: templateId } : { kind: "blank" },
    })
    setStep(0)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{wizard.title}</DialogTitle>
          <DialogDescription>{wizard.description}</DialogDescription>
        </DialogHeader>

        <div className="mb-3 flex items-center gap-1.5">
          {steps.map((label, index) => (
            <div key={label} className="flex flex-1 items-center gap-1.5">
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                  index === step
                    ? "bg-primary text-primary-foreground"
                    : index < step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              <span
                className={cn(
                  "hidden text-[11px] font-medium sm:block",
                  index === step ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="min-h-52">
          {step === 0 && (
            <div className="grid grid-cols-3 gap-2">
              {documentTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setDocType(type.value)
                    setStep(1)
                  }}
                  className="rounded-lg border bg-background px-3 py-3 text-left text-sm font-medium hover:border-primary/50 hover:bg-accent"
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-2">
              {PAGE_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => {
                    setPageSize(size.value)
                    setStep(2)
                  }}
                  className={cn(
                    "rounded-lg border bg-background px-3 py-3 text-left text-sm hover:border-primary/50 hover:bg-accent",
                    pageSize === size.value && "border-primary/60 bg-primary/5"
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-2">
              {ORIENTATIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setOrientation(item.value)
                    setStep(3)
                  }}
                  className={cn(
                    "rounded-lg border bg-background px-3 py-3 text-left text-sm hover:border-primary/50 hover:bg-accent",
                    orientation === item.value && "border-primary/60 bg-primary/5"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setStartMode("blank")}
                className={cn(
                  "w-full rounded-lg border bg-background px-3 py-3 text-left hover:border-primary/50",
                  startMode === "blank" && "border-primary/60 bg-primary/5"
                )}
              >
                <p className="text-sm font-medium">{wizard.startBlank}</p>
                <p className="text-xs text-muted-foreground">{wizard.startBlankHint}</p>
              </button>
              <button
                type="button"
                onClick={() => setStartMode("template")}
                className={cn(
                  "w-full rounded-lg border bg-background px-3 py-3 text-left hover:border-primary/50",
                  startMode === "template" && "border-primary/60 bg-primary/5"
                )}
              >
                <p className="text-sm font-medium">{wizard.startTemplate}</p>
                <p className="text-xs text-muted-foreground">{wizard.startTemplateHint}</p>
              </button>
              {startMode === "template" && (
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={wizard.templatePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                {wizard.back}
              </Button>
            )}
            {step > 0 && step < 3 && (
              <Button type="button" size="sm" onClick={() => setStep((s) => s + 1)}>
                {wizard.next}
              </Button>
            )}
          </div>
          {step === 3 && (
            <Button type="button" size="sm" disabled={!canNext} onClick={create}>
              {wizard.create}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
