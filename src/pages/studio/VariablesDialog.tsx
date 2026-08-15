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
import { messages } from "@/constants"
import type { DocVariable } from "@/document-engine/types"

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editor.variablesTitle}</DialogTitle>
          <DialogDescription>{editor.variablesDescription}</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {variables.map((variable, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="sr-only">{editor.variableName}</Label>
                <Input
                  value={variable.name}
                  placeholder={editor.variableName}
                  onChange={(event) => update(index, { name: event.target.value })}
                  className="h-8 font-mono text-xs"
                />
              </div>
              <div className="flex-[2]">
                <Label className="sr-only">{editor.variableValue}</Label>
                <Input
                  value={variable.value}
                  placeholder={editor.variableValue}
                  onChange={(event) => update(index, { value: event.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                title={editor.insertVariable}
                onClick={() =>
                  navigator.clipboard?.writeText(`{{${variable.name}}}`).catch(() => {})
                }
              >
                {"{{ }}"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-destructive"
                onClick={() => remove(index)}
              >
                ×
              </Button>
            </div>
          ))}
          {variables.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">
              {editor.variablesDescription}
            </p>
          )}
        </div>
        <DialogFooter className="flex items-center justify-between">
          <Button type="button" variant="outline" size="sm" onClick={add}>
            {messages.studio.editor.addVariable}
          </Button>
          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            {messages.common.done}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
