import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { icons } from "@/constants"
import { cn } from "@/lib/utils"

type RichTextToolbarProps = {
  position: { x: number; y: number }
  activeFormats: Set<string>
  onFormat: (cmd: string, value?: string) => void
  onClose: () => void
}

type ToolbarSection = {
  label: string
  items: { cmd: string; value?: string; icon: React.ReactNode; label: string; format?: string }[]
}

export function RichTextToolbar({ position, activeFormats, onFormat, onClose }: RichTextToolbarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [openSection, setOpenSection] = useState<string | null>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  const sections: ToolbarSection[] = [
    {
      label: "Format",
      items: [
        { cmd: "bold", icon: <span className="text-xs font-bold">B</span>, label: "Bold", format: "bold" },
        { cmd: "italic", icon: <span className="text-xs italic">I</span>, label: "Italic", format: "italic" },
        { cmd: "underline", icon: <span className="text-xs underline">U</span>, label: "Underline", format: "underline" },
        { cmd: "strikeThrough", icon: <span className="text-xs line-through">S</span>, label: "Strikethrough", format: "strikethrough" },
        { cmd: "code", icon: <icons.code className="size-3.5" />, label: "Inline Code", format: "code" },
      ],
    },
    {
      label: "Block",
      items: [
        { cmd: "formatBlock", value: "p", icon: <span className="text-[11px]">¶</span>, label: "Paragraph" },
        { cmd: "formatBlock", value: "h1", icon: <span className="text-[11px] font-bold">H1</span>, label: "Heading 1" },
        { cmd: "formatBlock", value: "h2", icon: <span className="text-[11px] font-bold">H2</span>, label: "Heading 2" },
        { cmd: "formatBlock", value: "h3", icon: <span className="text-[11px] font-bold">H3</span>, label: "Heading 3" },
      ],
    },
    {
      label: "Align",
      items: [
        { cmd: "justifyLeft", icon: <icons.alignLeft className="size-3.5" />, label: "Align Left" },
        { cmd: "justifyCenter", icon: <icons.alignCenter className="size-3.5" />, label: "Align Center" },
        { cmd: "justifyRight", icon: <icons.alignRight className="size-3.5" />, label: "Align Right" },
      ],
    },
  ]

  return (
    <div
      ref={ref}
      className="fixed z-50 flex items-center gap-0.5 rounded-lg border border-border/60 bg-popover p-1 shadow-xl animate-in fade-in slide-in-from-top-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      {sections.map((section, sIdx) => (
        <span key={section.label} className="flex items-center gap-0.5">
          {sIdx > 0 && <Separator orientation="vertical" className="mx-0.5 h-5" />}
          {section.items.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="icon-sm"
              className={cn(
                "size-7",
                item.format && activeFormats.has(item.format) && "bg-primary/15 text-primary"
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                if (item.value) {
                  onFormat(item.cmd, `<${item.value}>`)
                } else {
                  onFormat(item.cmd)
                }
              }}
              title={item.label}
            >
              {item.icon}
            </Button>
          ))}
        </span>
      ))}

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Popover open={openSection === "link"} onOpenChange={(open) => setOpenSection(open ? "link" : null)}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "size-7",
              activeFormats.has("link") && "bg-primary/15 text-primary"
            )}
            onMouseDown={(e) => e.preventDefault()}
            title="Link"
          >
            <icons.link className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={4}
          className="w-64 p-2"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const url = new FormData(form).get("url") as string
              if (url) {
                onFormat("createLink", url)
                setOpenSection(null)
              }
            }}
            className="flex gap-1.5"
          >
            <input
              name="url"
              placeholder="Paste URL…"
              className="flex-1 rounded-md border border-input bg-card px-2 py-1 text-xs shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
            />
            <Button type="submit" size="sm" className="h-7 px-2 text-xs">
              Link
            </Button>
          </form>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Popover open={openSection === "media"} onOpenChange={(open) => setOpenSection(open ? "media" : null)}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7"
            onMouseDown={(e) => e.preventDefault()}
            title="Insert"
          >
            <icons.plus className="size-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={4}
          className="w-48 p-1"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-0.5">
            {[
              { cmd: "insertImage", icon: <icons.image className="size-3.5" />, label: "Image" },
              { cmd: "insertUnorderedList", icon: <icons.list className="size-3.5" />, label: "Bulleted List" },
              { cmd: "insertOrderedList", icon: <icons.checklist className="size-3.5" />, label: "Numbered List" },
            ].map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                className="justify-start gap-2 px-2 text-xs"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onFormat(item.cmd)
                  setOpenSection(null)
                }}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
