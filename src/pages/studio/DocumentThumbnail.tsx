import { PageContent } from "@/document-engine/PageContent"
import type { DocDocument } from "@/document-engine/types"
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
        className={cn("rounded-md border bg-muted", className)}
        style={{ width, aspectRatio: "1 / 1.414" }}
      />
    )
  }
  const scale = Math.min(width / page.width, 1.4)
  return (
    <div
      className={cn("pointer-events-none overflow-hidden rounded-md bg-white ring-1 ring-border", className)}
      style={{ width, aspectRatio: `${page.width} / ${page.height}` }}
    >
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
  )
}
