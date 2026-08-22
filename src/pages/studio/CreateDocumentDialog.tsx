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
import { icons, messages } from "@/constants"
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

const DOC_TYPE_ICONS: Record<string, keyof typeof icons> = {
  blank: "page",
  resume: "file",
  report: "text",
  study: "callout",
  vapt: "finding",
  invoice: "table",
  proposal: "link",
  certificate: "badge",
  custom: "sparkles",
}

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

  const card = (active: boolean) =>
    cn(
      "relative rounded-xl border bg-card p-3 text-left text-sm shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
      active ? "border-primary/70 ring-1 ring-primary/30" : "border-border/60"
    )

  const check = (active: boolean) =>
    active ? (
      <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <icons.check className="size-3" />
      </span>
    ) : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{wizard.title}</DialogTitle>
          <DialogDescription>{wizard.description}</DialogDescription>
        </DialogHeader>

        <div className="mb-3 flex items-center gap-1.5">
          {steps.map((label, index) => (
            <div key={label} className="flex flex-1 items-center gap-1.5">
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                  index === step
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : index < step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {index < step ? <icons.check className="size-3" /> : index + 1}
              </div>
              <span
                className={cn(
                  "hidden text-[11px] font-medium sm:block",
                  index === step ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 rounded-full",
                    index < step ? "bg-primary/40" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-56">
          {step === 0 && (
            <div className="grid grid-cols-3 gap-2">
              {documentTypes.map((type) => {
                const Icon = icons[DOC_TYPE_ICONS[type.value] ?? "file"]
                const active = docType === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setDocType(type.value)
                      setStep(1)
                    }}
                    className={cn(card(active), "flex min-h-20 flex-col items-center justify-center gap-2 px-3 py-4")}
                  >
                    {check(active)}
                    <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-2">
              {PAGE_SIZES.map((size) => {
                const active = pageSize === size.value
                return (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => {
                      setPageSize(size.value)
                      setStep(2)
                    }}
                    className={cn(card(active), "flex items-center gap-3 px-3 py-3")}
                  >
                    {check(active)}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <icons.page className="size-4" />
                    </span>
                    <span className="text-xs font-medium">{size.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-2">
              {ORIENTATIONS.map((item) => {
                const active = orientation === item.value
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setOrientation(item.value)
                      setStep(3)
                    }}
                    className={cn(card(active), "flex items-center gap-3 px-3 py-3")}
                  >
                    {check(active)}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span
                        aria-hidden
                        className={cn(
                          "rounded-[3px] border-2 border-current",
                          item.value === "portrait" ? "h-4.5 w-3.5" : "h-3.5 w-4.5"
                        )}
                      />
                    </span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setStartMode("blank")}
                className={cn(card(startMode === "blank"), "w-full")}
              >
                {check(startMode === "blank")}
                <p className="text-sm font-medium">{wizard.startBlank}</p>
                <p className="text-xs text-muted-foreground">{wizard.startBlankHint}</p>
              </button>
              <button
                type="button"
                onClick={() => setStartMode("template")}
                className={cn(card(startMode === "template"), "w-full")}
              >
                {check(startMode === "template")}
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
