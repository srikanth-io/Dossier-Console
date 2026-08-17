import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"

import { ROUTES, icons } from "@/constants"
import { usePages } from "@/store/pages"
import type { PageEntry } from "@/data/pages"
import { cn } from "@/lib/utils"

function TreeNode({ page, depth = 0 }: { page: PageEntry; depth?: number }) {
  const navigate = useNavigate()
  const { getChildPages } = usePages()
  const children = getChildPages(page.id)
  const [expanded, setExpanded] = useState(depth < 1)

  const hasChildren = children.length > 0

  const handleClick = useCallback(() => {
    navigate(`${ROUTES.pages}/${page.id}`)
  }, [page.id, navigate])

  const toggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded((prev) => !prev)
  }, [])

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors hover:bg-sidebar-accent cursor-pointer",
          "text-sidebar-foreground/75"
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={handleClick}
      >
        <button
          type="button"
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded transition-transform",
            !hasChildren && "invisible",
            expanded && "rotate-90"
          )}
          onClick={toggleExpand}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <icons.chevronRight className="size-3" />
        </button>
        <span className="text-sm leading-none">{page.icon}</span>
        <span className="min-w-0 flex-1 truncate">{page.title}</span>
        {page.favorite && (
          <icons.sparkles className="size-3 shrink-0 text-amber-500 opacity-0 group-hover:opacity-100" />
        )}
      </div>
      {expanded && hasChildren && (
        <div>
          {children.map((child) => (
            <TreeNode key={child.id} page={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function PageTree() {
  const { rootPages } = usePages()

  if (rootPages.length === 0) return null

  return (
    <div className="space-y-0.5">
      {rootPages.map((page) => (
        <TreeNode key={page.id} page={page} />
      ))}
    </div>
  )
}
