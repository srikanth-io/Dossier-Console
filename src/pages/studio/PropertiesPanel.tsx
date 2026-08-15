import { useRef } from "react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { icons, messages } from "@/constants"
import { definitionFor, type PropField } from "@/document-engine/registry"
import { FONT_OPTIONS, THEME_PRESETS } from "@/document-engine/themes"
import { ORIENTATION_LABELS, PAGE_SIZE_LABELS, PAGE_SIZES, sizedPage } from "@/document-engine/pageSizes"
import type {
  DocDocument,
  DocElement,
  DocPage,
  TemplateCategory,
} from "@/document-engine/types"
import { cn } from "@/lib/utils"

function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value)
}

function num(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function bool(value: unknown): boolean {
  return Boolean(value)
}

function ColorField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <label
        className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-md border"
        style={{ backgroundColor: value || "#ffffff" }}
      >
        <input
          type="color"
          value={value || "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <Input
        value={value}
        placeholder={placeholder ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 font-mono text-xs"
      />
    </div>
  )
}

function SliderField({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
      <span className="w-10 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
        {value.toFixed(2).replace(/\.00$/, "")}
      </span>
    </div>
  )
}

function ImageField({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  return (
    <div className="flex items-center gap-1.5">
      <Input
        value={value}
        placeholder="https://… or upload"
        onChange={(event) => onChange(event.target.value)}
        className="h-7 text-xs"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => onChange(str(reader.result))
          reader.readAsDataURL(file)
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 shrink-0 px-2"
        onClick={() => inputRef.current?.click()}
      >
        <icons.upload className="size-3.5" />
      </Button>
    </div>
  )
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: PropField
  value: unknown
  onChange: (value: unknown) => void
}) {
  switch (field.kind) {
    case "text":
      return (
        <Input
          value={str(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 text-xs"
        />
      )
    case "textarea":
      return (
        <Textarea
          value={str(value)}
          onChange={(event) => onChange(event.target.value)}
          rows={field.rows ?? 3}
          className="min-h-16 resize-y text-xs"
        />
      )
    case "number":
      return (
        <Input
          type="number"
          value={num(value)}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(event) => onChange(event.target.value === "" ? 0 : Number(event.target.value))}
          className="h-7 text-xs"
        />
      )
    case "color":
      return <ColorField value={str(value)} onChange={onChange} />
    case "toggle":
      return (
        <Switch
          checked={bool(value)}
          onCheckedChange={onChange}
          className="h-4.5 w-8"
        />
      )
    case "slider":
      return (
        <SliderField
          value={num(value)}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={onChange}
        />
      )
    case "font":
      return (
        <Select value={str(value)} onValueChange={onChange}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_OPTIONS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case "image":
      return <ImageField value={str(value)} onChange={onChange} />
    case "select":
      return (
        <Select value={str(value)} onValueChange={onChange}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
  }
}

function Section({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        {action}
      </div>
      {children}
    </div>
  )
}

function FieldRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="shrink-0 text-xs text-muted-foreground">{label}</Label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function ThemeSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const CATEGORY_OPTIONS: { value: TemplateCategory; label: string }[] = (
  Object.keys(messages.studio.categories) as TemplateCategory[]
)
  .filter((key) => key !== "all")
  .map((key) => ({ value: key, label: messages.studio.categories[key] }))

export interface PropertiesPanelProps {
  doc: DocDocument
  page: DocPage
  selectedElements: DocElement[]
  onUpdateElementProps: (id: string, patch: Record<string, unknown>) => void
  onRenameElement: (id: string, name: string) => void
  onUpdateTransform: (id: string, patch: Partial<DocElement>) => void
  onUpdateMultiTransform: (ids: string[], patch: Partial<DocElement>) => void
  onToggleLocked: (id: string) => void
  onToggleHidden: (id: string) => void
  onReorder: (id: string, direction: "front" | "forward" | "backward" | "back") => void
  onDuplicateElement: (id: string) => void
  onDeleteElements: (ids: string[]) => void
  onAlign: (align: "left" | "center" | "right" | "top" | "middle" | "bottom") => void
  onDistribute: (axis: "h" | "v") => void
  onUpdateDoc: (patch: Partial<DocDocument>) => void
  onUpdatePage: (patch: Partial<DocPage>) => void
  onApplyThemePreset: (presetId: string) => void
  onSaveAsComponent: () => void
}

export function PropertiesPanel({
  doc,
  page,
  selectedElements,
  onUpdateElementProps,
  onRenameElement,
  onUpdateTransform,
  onUpdateMultiTransform,
  onToggleLocked,
  onToggleHidden,
  onReorder,
  onDuplicateElement,
  onDeleteElements,
  onAlign,
  onDistribute,
  onUpdateDoc,
  onUpdatePage,
  onApplyThemePreset,
  onSaveAsComponent,
}: PropertiesPanelProps) {
  const c = messages.studio.components
  const editor = messages.studio.editor
  const single = selectedElements.length === 1 ? selectedElements[0] : null
  const multi = selectedElements.length > 1

  if (single) {
    const definition = definitionFor(single.type)
    const value = (key: string) => single.props[key]
    const update = (key: string, next: unknown) =>
      onUpdateElementProps(single.id, { [key]: next })

    const alignActions: { id: string; title: string; icon: "alignLeft" | "alignCenter" | "alignRight" | "alignTop" | "alignMiddle" | "alignBottom" }[] = [
      { id: "left", title: "Align left", icon: "alignLeft" },
      { id: "center", title: "Align center", icon: "alignCenter" },
      { id: "right", title: "Align right", icon: "alignRight" },
      { id: "top", title: "Align top", icon: "alignTop" },
      { id: "middle", title: "Align middle", icon: "alignMiddle" },
      { id: "bottom", title: "Align bottom", icon: "alignBottom" },
    ]

    return (
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-3">
        <Section title={editor.properties}>
          <FieldRow label={editor.name}>
            <Input
              value={single.name}
              onChange={(event) => onRenameElement(single.id, event.target.value)}
              className="h-7 text-xs"
            />
          </FieldRow>
        </Section>

        {definition?.schema.map((group, groupIndex) => (
          <Section
            key={groupIndex}
            title={groupIndex === 0 ? definition.name : c.categories.content}
          >
            <div className="space-y-2">
              {group.map((field) => (
                <FieldRow key={field.key} label={field.label}>
                  <FieldControl
                    field={field}
                    value={value(field.key)}
                    onChange={(next) => update(field.key, next)}
                  />
                </FieldRow>
              ))}
            </div>
          </Section>
        ))}

        {doc.mode === "freeform" && (
          <>
            <Separator />
            <Section title={editor.transform}>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { key: "x", label: c.fields.x },
                    { key: "y", label: c.fields.y },
                    { key: "width", label: c.fields.width },
                    { key: "height", label: c.fields.height },
                    { key: "rotation", label: c.fields.rotate },
                    { key: "opacity", label: c.fields.opacity },
                  ] as const
                ).map((field) => (
                  <div key={field.key}>
                    <Label className="text-[10px] text-muted-foreground">
                      {field.label}
                    </Label>
                    <Input
                      type="number"
                      value={num(single[field.key])}
                      onChange={(event) =>
                        onUpdateTransform(single.id, {
                          [field.key]: Number(event.target.value),
                        })
                      }
                      className="mt-0.5 h-7 text-xs"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  title="Bring to front"
                  onClick={() => onReorder(single.id, "front")}
                >
                  <icons.bringToFront className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  title="Send to back"
                  onClick={() => onReorder(single.id, "back")}
                >
                  <icons.sendToBack className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn("h-7 px-2 text-xs", single.locked && "text-primary")}
                  title={single.locked ? "Unlock" : "Lock"}
                  onClick={() => onToggleLocked(single.id)}
                >
                  <icons.lock className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn("h-7 px-2 text-xs", single.hidden && "text-muted-foreground")}
                  title={single.hidden ? "Show" : "Hide"}
                  onClick={() => onToggleHidden(single.id)}
                >
                  <icons.eyeOff className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  title={editor.duplicate}
                  onClick={() => onDuplicateElement(single.id)}
                >
                  <icons.copy className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs text-destructive"
                  title={editor.delete}
                  onClick={() => onDeleteElements([single.id])}
                >
                  <icons.trash className="size-3.5" />
                </Button>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2 h-7 w-full text-xs"
                onClick={onSaveAsComponent}
              >
                <icons.sparkles className="size-3.5" />
                {editor.saveComponent}
              </Button>
            </Section>
          </>
        )}

        <div className="grid grid-cols-3 gap-1 pt-1">
          {alignActions.map((action) => {
            const Icon = icons[action.icon]
            return (
              <Button
                key={action.id}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-1 text-xs"
                title={action.title}
                onClick={() => onAlign(action.id as "left" | "center" | "right" | "top" | "middle" | "bottom")}
              >
                <Icon className="size-3.5" />
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  if (multi) {
    return (
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-3">
        <Section title={editor.properties}>
          <p className="text-xs text-muted-foreground">
            {selectedElements.length} {editor.elements.toLowerCase()}
          </p>
        </Section>
        <Section title={editor.transform}>
          <div className="grid grid-cols-2 gap-2">
            <FieldRow label={c.fields.x}>
              <Input
                type="number"
                className="h-7 text-xs"
                placeholder="—"
                onChange={(event) =>
                  onUpdateMultiTransform(
                    selectedElements.map((el) => el.id),
                    { x: Number(event.target.value) }
                  )
                }
              />
            </FieldRow>
            <FieldRow label={c.fields.y}>
              <Input
                type="number"
                className="h-7 text-xs"
                placeholder="—"
                onChange={(event) =>
                  onUpdateMultiTransform(
                    selectedElements.map((el) => el.id),
                    { y: Number(event.target.value) }
                  )
                }
              />
            </FieldRow>
          </div>
        </Section>
        <Section title={editor.alignDistribute}>
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                ["left", "alignLeft"],
                ["center", "alignCenter"],
                ["right", "alignRight"],
                ["top", "alignTop"],
                ["middle", "alignMiddle"],
                ["bottom", "alignBottom"],
                ["h", "distributeH"],
                ["v", "distributeV"],
              ] as const
            ).map(([action, iconName]) => {
              const Icon = icons[iconName]
              return (
                <Button
                  key={action}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-1 text-xs"
                  onClick={() =>
                    action === "h" || action === "v"
                      ? onDistribute(action)
                      : onAlign(action)
                  }
                >
                  <Icon className="size-3.5" />
                </Button>
              )
            })}
          </div>
          <div className="flex items-center gap-1 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 flex-1 text-xs"
              onClick={onSaveAsComponent}
            >
              <icons.sparkles className="size-3.5" />
              {editor.saveComponent}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs text-destructive"
              onClick={() => onDeleteElements(selectedElements.map((el) => el.id))}
            >
              <icons.trash className="size-3.5" />
            </Button>
          </div>
        </Section>
      </div>
    )
  }

  const documentModeOptions = [
    { value: "freeform", label: editor.modeFreeform },
    { value: "flow", label: editor.modeFlow },
  ]
  const pageSizeOptions = (Object.keys(PAGE_SIZES) as (keyof typeof PAGE_SIZES)[]).map(
    (sizeId) => ({ value: sizeId, label: PAGE_SIZE_LABELS[sizeId] })
  )
  const orientationOptions = (Object.keys(ORIENTATION_LABELS) as (keyof typeof ORIENTATION_LABELS)[]).map(
    (orientation) => ({ value: orientation, label: ORIENTATION_LABELS[orientation] })
  )
  const presetOptions = [
    { value: "", label: editor.themePresetNone },
    ...THEME_PRESETS.map((preset) => ({ value: preset.id, label: preset.name })),
  ]

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-3">
      <Section title={editor.documentSettings}>
        <div className="space-y-2">
          <FieldRow label={editor.name}>
            <Input
              value={doc.name}
              onChange={(event) => onUpdateDoc({ name: event.target.value })}
              className="h-7 text-xs"
            />
          </FieldRow>
          <FieldRow label={editor.description}>
            <Input
              value={doc.description}
              onChange={(event) => onUpdateDoc({ description: event.target.value })}
              className="h-7 text-xs"
            />
          </FieldRow>
          <FieldRow label={editor.category}>
            <ThemeSelect
              value={doc.category}
              onChange={(value) => onUpdateDoc({ category: value as TemplateCategory })}
              options={CATEGORY_OPTIONS}
            />
          </FieldRow>
          <FieldRow label={editor.mode}>
            <ThemeSelect
              value={doc.mode}
              onChange={(value) => onUpdateDoc({ mode: value as DocDocument["mode"] })}
              options={documentModeOptions}
            />
          </FieldRow>
          <p className="text-[11px] text-muted-foreground">
            {doc.mode === "freeform" ? editor.modeFreeformHint : editor.modeFlowHint}
          </p>
          <FieldRow label={editor.grid}>
            <Switch
              checked={doc.snapToGrid}
              onCheckedChange={(value) => onUpdateDoc({ snapToGrid: value })}
              className="h-4.5 w-8"
            />
          </FieldRow>
        </div>
      </Section>

      <Separator />

      <Section title={editor.pageSettings}>
        <div className="space-y-2">
          <FieldRow label={editor.pageName}>
            <Input
              value={page.name}
              onChange={(event) => onUpdatePage({ name: event.target.value })}
              className="h-7 text-xs"
            />
          </FieldRow>
          <FieldRow label={editor.pageSize}>
            <ThemeSelect
              value={page.sizeId}
              onChange={(value) => {
                const size = sizedPage(value as typeof page.sizeId, page.orientation)
                onUpdatePage({ sizeId: value as typeof page.sizeId, ...size })
              }}
              options={pageSizeOptions}
            />
          </FieldRow>
          <FieldRow label={editor.orientation}>
            <ThemeSelect
              value={page.orientation}
              onChange={(value) => {
                const size = sizedPage(page.sizeId, value as typeof page.orientation)
                onUpdatePage({ orientation: value as typeof page.orientation, ...size })
              }}
              options={orientationOptions}
            />
          </FieldRow>
          <FieldRow label={editor.background}>
            <ColorField value={page.background} onChange={(value) => onUpdatePage({ background: value })} />
          </FieldRow>
        </div>
      </Section>

      <Separator />

      <Section title={editor.theme}>
        <div className="space-y-2">
          <FieldRow label={editor.themePreset}>
            <ThemeSelect
              value=""
              onChange={(value) => {
                if (value) onApplyThemePreset(value)
              }}
              options={presetOptions}
            />
          </FieldRow>
          <FieldRow label={editor.headingFont}>
            <ThemeSelect
              value={doc.theme.headingFont}
              onChange={(value) => onUpdateDoc({ theme: { ...doc.theme, headingFont: value } })}
              options={[...FONT_OPTIONS]}
            />
          </FieldRow>
          <FieldRow label={editor.bodyFont}>
            <ThemeSelect
              value={doc.theme.bodyFont}
              onChange={(value) => onUpdateDoc({ theme: { ...doc.theme, bodyFont: value } })}
              options={[...FONT_OPTIONS]}
            />
          </FieldRow>
          <FieldRow label={editor.codeFont}>
            <ThemeSelect
              value={doc.theme.codeFont}
              onChange={(value) => onUpdateDoc({ theme: { ...doc.theme, codeFont: value } })}
              options={[...FONT_OPTIONS]}
            />
          </FieldRow>
          {(
            [
              { key: "primary", label: editor.colorPrimary },
              { key: "accent", label: editor.colorAccent },
              { key: "background", label: editor.colorBackground },
              { key: "text", label: editor.colorText },
              { key: "border", label: editor.colorBorder },
            ] as const
          ).map((color) => (
            <FieldRow key={color.key} label={color.label}>
              <ColorField
                value={doc.theme[color.key]}
                onChange={(value) =>
                  onUpdateDoc({ theme: { ...doc.theme, [color.key]: value } })
                }
              />
            </FieldRow>
          ))}
        </div>
      </Section>

      <Separator />

      <Section title={editor.spacing}>
        <div className="space-y-2">
          {(
            [
              { key: "pageMargin", label: editor.pageMargin },
              { key: "componentSpacing", label: editor.componentSpacing },
              { key: "paragraphSpacing", label: editor.paragraphSpacing },
              { key: "sectionSpacing", label: editor.sectionSpacing },
            ] as const
          ).map((spacing) => (
            <FieldRow key={spacing.key} label={spacing.label}>
              <Input
                type="number"
                value={doc.theme[spacing.key]}
                onChange={(event) =>
                  onUpdateDoc({
                    theme: {
                      ...doc.theme,
                      [spacing.key]: Number(event.target.value),
                    },
                  })
                }
                className="h-7 text-xs"
              />
            </FieldRow>
          ))}
        </div>
      </Section>

      <Separator />

      <Section title={editor.branding}>
        <div className="space-y-2">
          <FieldRow label={editor.companyName}>
            <Input
              value={doc.theme.companyName}
              onChange={(event) =>
                onUpdateDoc({ theme: { ...doc.theme, companyName: event.target.value } })
              }
              className="h-7 text-xs"
            />
          </FieldRow>
          <FieldRow label={editor.footerText}>
            <Input
              value={doc.theme.footerText}
              onChange={(event) =>
                onUpdateDoc({ theme: { ...doc.theme, footerText: event.target.value } })
              }
              className="h-7 text-xs"
            />
          </FieldRow>
        </div>
      </Section>
    </div>
  )
}
