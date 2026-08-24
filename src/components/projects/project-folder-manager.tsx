import { Fragment, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import { getColleague, initialsOf } from "@/data/colleagues"
import { EmptyState } from "@/components/common/empty-state"
import { FolderFormDialog } from "@/components/projects/folder-form-dialog"
import { FolderShareDialog } from "@/components/projects/folder-share-dialog"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { icons, messages } from "@/constants"
import { formatRelative } from "@/lib/time"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useProjectFolders, type ProjectFolder } from "@/store/project-folders"

type ProjectFolderManagerProps = {
  projectId: string
}

export function ProjectFolderManager({ projectId }: ProjectFolderManagerProps) {
  const {
    getChildFolders,
    getTrail,
    getSubfolderCount,
    getFolderShares,
    deleteFolder,
  } = useProjectFolders()

  const location = useLocation()

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [renaming, setRenaming] = useState<ProjectFolder | undefined>(undefined)
  const [sharing, setSharing] = useState<ProjectFolder | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<ProjectFolder | null>(null)

  useEffect(() => {
    // Global search deep-links into a folder via router state.
    const deepLinkFolder =
      (location.state as { folderId?: string } | null)?.folderId ?? null
    setCurrentFolderId(deepLinkFolder)
    setRenaming(undefined)
    setSharing(undefined)
    setDeleteTarget(null)
  }, [projectId, location.state])

  const trail = currentFolderId ? getTrail(currentFolderId) : []
  const currentFolder = trail.at(-1)
  const visibleFolders = getChildFolders(projectId, currentFolderId)

  const openCreate = () => {
    setRenaming(undefined)
    setFormOpen(true)
  }

  const openRename = (folder: ProjectFolder) => {
    setRenaming(folder)
    setFormOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteFolder(deleteTarget.id)
    toast.success(messages.projects.folders.deletedToast)
    if (trail.some((f) => f.id === deleteTarget.id)) {
      const targetIndex = trail.findIndex((f) => f.id === deleteTarget.id)
      setCurrentFolderId(targetIndex > 0 ? trail[targetIndex - 1].id : null)
    }
    setDeleteTarget(null)
  }

  return (
    <Card className="animate-fade-rise" style={{ animationDelay: "200ms" }}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{messages.projects.folders.title}</CardTitle>
            <CardDescription>{messages.projects.folders.description}</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {trail.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentFolderId(null)
                      }}
                    >
                      {messages.projects.folders.breadcrumbRoot}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {trail.map((crumb, index) => (
                    <Fragment key={crumb.id}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {index === trail.length - 1 ? (
                          <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentFolderId(crumb.id)
                            }}
                          >
                            {crumb.name}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
            <Button variant="default" size="sm" onClick={openCreate}>
              <icons.plus /> {messages.projects.folders.newFolder}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {visibleFolders.length === 0 ? (
          <EmptyState
            icon={<icons.dossiers />}
            title={
              currentFolderId
                ? messages.projects.folders.emptyFolderTitle
                : messages.projects.folders.emptyTitle
            }
            description={
              currentFolderId
                ? messages.projects.folders.emptyFolderHint
                : messages.projects.folders.emptyHint
            }
            action={
              <Button variant="outline" size="sm" onClick={openCreate}>
                <icons.plus /> {messages.projects.folders.newFolder}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleFolders.map((folder) => {
              const shareCount = getFolderShares(folder.id).length
              const subfolderCount = getSubfolderCount(folder.id)
              return (
                <div
                  key={folder.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setCurrentFolderId(folder.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setCurrentFolderId(folder.id)
                    }
                  }}
                  className="group cursor-pointer rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft/70 text-primary [&_svg]:size-[18px] dark:bg-primary/15">
                      <icons.dossiers />
                    </span>
                    <div
                      className="flex shrink-0 items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={messages.projects.folders.share}
                        className="size-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => setSharing(folder)}
                      >
                        <icons.users className="size-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={messages.common.more}
                            className="size-7 text-muted-foreground"
                          >
                            <icons.moreVertical className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setCurrentFolderId(folder.id)}>
                            <icons.openFile className="size-4" />
                            {messages.projects.folders.open}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRename(folder)}>
                            <icons.pencil className="size-4" />
                            {messages.projects.folders.rename}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSharing(folder)}>
                            <icons.users className="size-4" />
                            {messages.projects.folders.share}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(folder)}
                          >
                            <icons.trash className="size-4" />
                            {messages.projects.folders.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <p className="mt-3 truncate font-heading text-sm font-bold text-foreground">
                    {folder.name}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-muted-foreground">
                      {formatRelative(folder.updatedAt)}
                    </p>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                      {subfolderCount > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <icons.dossiers className="size-3" />
                          {subfolderCount}
                        </span>
                      )}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1",
                          shareCount === 0 && "opacity-60"
                        )}
                      >
                        <icons.users className="size-3" />
                        {shareCount}
                      </span>
                    </div>
                  </div>

                  {shareCount > 0 && (
                    <div className="mt-2.5 flex -space-x-1.5">
                      {getFolderShares(folder.id).slice(0, 4).map((share) => {
                        const colleague = getColleague(share.colleagueId)
                        if (!colleague) return null
                        return (
                          <span
                            key={share.id}
                            title={`${colleague.name} \u00b7 ${colleague.role}`}
                            className="flex size-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-card"
                            style={{ backgroundColor: colleague.color }}
                          >
                            {initialsOf(colleague.name)}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <FolderFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setRenaming(undefined)
        }}
        projectId={projectId}
        parentId={currentFolderId}
        parentName={currentFolder?.name ?? null}
        folder={renaming}
      />

      <FolderShareDialog
        open={sharing !== undefined}
        onOpenChange={(open) => {
          if (!open) setSharing(undefined)
        }}
        folder={sharing}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{messages.projects.folders.deleteTitle}</DialogTitle>
            <DialogDescription>
              {deleteTarget?.name} &mdash;{" "}
              {messages.projects.folders.deleteDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {messages.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <icons.trash /> {messages.projects.folders.deleteAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
