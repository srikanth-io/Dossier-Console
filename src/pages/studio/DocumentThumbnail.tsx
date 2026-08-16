import { PageContent } from "@/document-engine/PageContent"
import type { DocDocument } from "@/document-engine/types"
import { icons } from "@/constants"
import { cn } from "@/lib/utils"

interface DocumentThumbnailProps {
  doc: DocDocument
  width?: number
  className?: string
}

export function DocumentThumbnail({
  doc,
  width = 220,
  className,
}: DocumentThumbnailProps) {
  const page = doc.pages[0]
  if (!page) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border bg-muted/40",
          className
        )}
        style={{ width, aspectRatio: "3 / 4" }}
      >
        <icons.file className="size-5 text-muted-foreground/60" />
      </div>
    )
  }
  const scale = Math.min(width / page.width, (width * 4) / 3 / page.height)
  return (
    <div
      className={cn(
        "pointer-events-none flex items-center justify-center overflow-hidden rounded-lg bg-white",
        className
      )}
      style={{
        width,
        aspectRatio: "3 / 4",
        boxShadow: "inset 0 0 0 1px var(--border)",
      }}
    >
      <div style={{ width: page.width * scale, height: page.height * scale }}>
        <div
          style={{
            width: page.width,
            height: page.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <PageContent doc={doc} page={page} pageIndex={0} />
        </div>
      </div>
    </div>
  )
}
