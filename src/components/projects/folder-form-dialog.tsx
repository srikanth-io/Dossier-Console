import { useEffect, useState } from "react"

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
import { toast } from "sonner"
import { useProjectFolders, type ProjectFolder } from "@/store/project-folders"

type FolderFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  parentId?: string | null
  parentName?: string | null
  folder?: ProjectFolder
}

export function FolderFormDialog({
  open,
  onOpenChange,
  projectId,
  parentId = null,
  parentName,
  folder,
}: FolderFormDialogProps) {
  const { createFolder, renameFolder } = useProjectFolders()
  const editing = Boolean(folder)
  const [name, setName] = useState("")

  useEffect(() => {
    if (open) setName(folder?.name ?? "")
  }, [open, folder])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    if (folder) {
      renameFolder(folder.id, trimmed)
      toast.success(messages.projects.folders.renamedToast)
    } else {
      createFolder(projectId, trimmed, parentId)
      toast.success(messages.projects.folders.createdToast)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? messages.projects.folders.renameTitle
                : messages.projects.folders.createTitle}
            </DialogTitle>
            <DialogDescription>
              {editing ? (
                messages.projects.folders.renameDescription
              ) : (
                <>
                  {messages.projects.folders.createDescription}
                  {parentName && (
                    <>
                      {" "}
                      &mdash;{" "}
                      <span className="font-medium text-foreground">
                        {messages.projects.folders.createInsidePrefix}{" "}
                        {parentName}
                      </span>
                    </>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="folder-name">{messages.projects.folders.nameLabel}</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={messages.projects.folders.namePlaceholder}
              autoFocus
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {messages.common.cancel}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              <icons.dossiers className="size-4" />
              {editing
                ? messages.projects.folders.rename
                : messages.projects.folders.submitCreate}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
