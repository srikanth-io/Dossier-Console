import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type RichTextToolbarProps = {
  position: { x: number; y: number }
  activeFormats: Set<string>
  onFormat: (cmd: string, value?: string) => void
  onClose: () => void
}

const formatButtons: { cmd: string; icon: string; label: string; format: string }[] = [
  { cmd: "bold", icon: "B", label: "Bold", format: "bold" },
  { cmd: "italic", icon: "I", label: "Italic", format: "italic" },
  { cmd: "underline", icon: "U", label: "Underline", format: "underline" },
  { cmd: "strikeThrough", icon: "S", label: "Strikethrough", format: "strikethrough" },
]

const headingButtons: { cmd: string; value: string; label: string }[] = [
  { cmd: "formatBlock", value: "h1", label: "H1" },
  { cmd: "formatBlock", value: "h2", label: "H2" },
  { cmd: "formatBlock", value: "h3", label: "H3" },
  { cmd: "formatBlock", value: "p", label: "¶" },
]

export function RichTextToolbar({ position, activeFormats, onFormat, onClose }: RichTextToolbarProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

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
      {formatButtons.map((btn) => (
        <Button
          key={btn.cmd}
          variant="ghost"
          size="icon-sm"
          className={cn(
            "size-7 text-xs font-semibold",
            activeFormats.has(btn.format) && "bg-primary/15 text-primary"
          )}
          onMouseDown={(e) => {
            e.preventDefault()
            onFormat(btn.cmd)
          }}
          title={btn.label}
        >
          {btn.icon}
        </Button>
      ))}

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      {headingButtons.map((btn) => (
        <Button
          key={btn.value}
          variant="ghost"
          size="icon-sm"
          className="size-7 text-[11px] font-bold"
          onMouseDown={(e) => {
            e.preventDefault()
            onFormat(btn.cmd, `<${btn.value}>`)
          }}
          title={btn.label}
        >
          {btn.label}
        </Button>
      ))}

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Button
        variant="ghost"
        size="icon-sm"
        className="size-7 text-xs"
        onMouseDown={(e) => {
          e.preventDefault()
          const url = window.prompt("Enter URL:")
          if (url) onFormat("createLink", url)
        }}
        title="Link"
      >
        🔗
      </Button>
    </div>
  )
}
