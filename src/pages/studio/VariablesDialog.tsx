import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { icons, messages } from "@/constants"
import type { DocVariable } from "@/document-engine/types"
import { toast } from "sonner"

interface VariablesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variables: DocVariable[]
  onChange: (variables: DocVariable[]) => void
}

export function VariablesDialog({
  open,
  onOpenChange,
  variables,
  onChange,
}: VariablesDialogProps) {
  const editor = messages.studio.editor

  const update = (index: number, patch: Partial<DocVariable>) => {
    onChange(
      variables.map((variable, i) => (i === index ? { ...variable, ...patch } : variable))
    )
  }

  const remove = (index: number) => {
    onChange(variables.filter((_, i) => i !== index))
  }

  const add = () => {
    onChange([...variables, { name: `variable_${variables.length + 1}`, value: "" }])
  }

  const copyVariable = async (name: string) => {
    try {
      await navigator.clipboard.writeText(`{{${name}}}`)
      toast(messages.studio.toasts.variableCopied)
    } catch {
      // Clipboard unavailable — ignore
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editor.variablesTitle}</DialogTitle>
          <DialogDescription>{editor.variablesDescription}</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {variables.map((variable, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 p-1.5"
            >
              <div className="flex-1">
                <Label className="sr-only">{editor.variableName}</Label>
                <Input
                  value={variable.name}
                  placeholder={editor.variableName}
                  onChange={(event) => update(index, { name: event.target.value })}
                  className="h-8 border-transparent bg-transparent font-mono text-xs shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex-[2]">
                <Label className="sr-only">{editor.variableValue}</Label>
                <Input
                  value={variable.value}
                  placeholder={editor.variableValue}
                  onChange={(event) => update(index, { value: event.target.value })}
                  className="h-8 border-transparent bg-transparent text-xs shadow-none focus-visible:ring-0"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2 font-mono text-xs text-primary"
                title={editor.insertVariable}
                onClick={() => copyVariable(variable.name)}
              >
                {"{{ }}"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={messages.studio.editor.delete}
                className="h-8 w-8 shrink-0 px-0 text-muted-foreground hover:text-destructive"
                onClick={() => remove(index)}
              >
                <icons.trash className="size-4" />
              </Button>
            </div>
          ))}
          {variables.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <icons.variables className="size-5 text-muted-foreground" />
              </span>
              <p className="text-xs text-muted-foreground">{editor.variablesDescription}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <div className="flex w-full items-center justify-between">
            <Button type="button" variant="outline" size="sm" onClick={add}>
              <icons.plus className="size-4" />
              {editor.addVariable}
            </Button>
            <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
              {messages.common.done}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
