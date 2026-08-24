import { useEffect, useState } from "react"

import { colleagues, getColleague, initialsOf } from "@/data/colleagues"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { icons, messages, roleLabels } from "@/constants"
import { toast } from "sonner"
import {
  useProjectFolders,
  type FolderPermission,
  type ProjectFolder,
} from "@/store/project-folders"

const permissionOptions: FolderPermission[] = ["viewer", "editor"]

type FolderShareDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder?: ProjectFolder
}

export function FolderShareDialog({ open, onOpenChange, folder }: FolderShareDialogProps) {
  const { getFolderShares, shareFolder, updateSharePermission, revokeShare } =
    useProjectFolders()
  const [colleagueId, setColleagueId] = useState("")
  const [permission, setPermission] = useState<FolderPermission>("viewer")

  useEffect(() => {
    if (open) {
      setColleagueId("")
      setPermission("viewer")
    }
  }, [open, folder?.id])

  const existingShares = folder ? getFolderShares(folder.id) : []
  const sharedIds = new Set(existingShares.map((s) => s.colleagueId))
  const availableColleagues = [...colleagues].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  if (!folder) return null

  const handleShare = () => {
    if (!colleagueId) return
    const colleague = getColleague(colleagueId)
    const created = shareFolder(folder.id, colleagueId, permission)
    if (!created) {
      toast(messages.projects.folders.alreadySharedToast)
      return
    }
    if (colleague) {
      toast.success(messages.projects.folders.sharedToast(colleague.name))
    }
    setColleagueId("")
    setPermission("viewer")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{messages.projects.folders.shareTitle}</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{folder.name}</span>
            {" \u2014 "}
            {messages.projects.folders.shareDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>{messages.projects.folders.addCollaborator}</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={colleagueId}
              onValueChange={setColleagueId}
              disabled={availableColleagues.every((c) => sharedIds.has(c.id))}
            >
              <SelectTrigger className="w-full sm:flex-1">
                <SelectValue placeholder={messages.projects.folders.colleaguePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {availableColleagues
                  .filter((c) => !sharedIds.has(c.id))
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Select
                value={permission}
                onValueChange={(v) => setPermission(v as FolderPermission)}
              >
                <SelectTrigger className="w-full sm:w-32" aria-label={messages.projects.folders.permissionLabel}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {permissionOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {roleLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleShare}
                disabled={!colleagueId || availableColleagues.every((c) => sharedIds.has(c.id))}
              >
                <icons.users className="size-4" />
                {messages.projects.folders.shareSubmit}
              </Button>
            </div>
          </div>
          {availableColleagues.every((c) => sharedIds.has(c.id)) && (
            <p className="text-xs text-muted-foreground">
              {messages.projects.folders.noColleaguesLeft}
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {messages.projects.folders.sharedWith}
          </p>
          <ul className="space-y-1">
            <li className="flex items-center gap-3 rounded-lg px-2 py-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary-soft text-primary">
                  <icons.user className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {messages.projects.folders.ownerYou}
                </p>
              </div>
            </li>
            {existingShares.map((share) => {
              const colleague = getColleague(share.colleagueId)
              if (!colleague) return null
              return (
                <li
                  key={share.id}
                  className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="size-8">
                    <AvatarFallback style={{ backgroundColor: colleague.color }}>
                      {initialsOf(colleague.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {colleague.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{colleague.email}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-xs">
                        {roleLabels[share.permission]}
                        <icons.chevronDown className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {permissionOptions.map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onClick={() => updateSharePermission(share.id, option)}
                        >
                          <icons.check className="size-3.5" />
                          {roleLabels[option]}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={messages.projects.folders.removeAccess}
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      revokeShare(share.id)
                      toast.success(messages.projects.folders.accessRemovedToast)
                    }}
                  >
                    <icons.trash className="size-3.5" />
                  </Button>
                </li>
              )
            })}
            {existingShares.length === 0 && (
              <li className="px-2 py-1 text-xs text-muted-foreground">
                {messages.projects.folders.privateLabel}
              </li>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
