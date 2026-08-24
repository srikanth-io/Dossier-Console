import { useRef } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { icons, messages } from "@/constants"
import {
  MAX_AVATAR_BYTES,
  removeStoredAvatar,
  setStoredAvatar,
} from "@/lib/avatar"

export function ProfilePhotoDialog({
  open,
  onOpenChange,
  userId,
  initials,
  value,
  onChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId?: string | null
  initials: string
  value: string | null
  onChange: (next: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(messages.settings.account.photoInvalidType)
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error(messages.settings.account.photoTooLarge)
      return
    }
    const reader = new FileReader()
    reader.onerror = () => toast.error(messages.settings.account.photoInvalidType)
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null
      if (!dataUrl) return
      try {
        setStoredAvatar(dataUrl, userId)
      } catch {
        toast.error(messages.settings.account.photoTooLarge)
        return
      }
      onChange(dataUrl)
      onOpenChange(false)
      toast.success(messages.settings.account.photoUpdated)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    removeStoredAvatar(userId)
    onChange(null)
    onOpenChange(false)
    toast.success(messages.settings.account.photoRemoved)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{messages.settings.account.photoTitle}</DialogTitle>
          <DialogDescription>
            {messages.settings.account.photoDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="group relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={messages.settings.account.avatarUpload}
          >
            <Avatar className="size-28 ring-2 ring-border/60 transition-opacity group-hover:opacity-85">
              {value && <AvatarImage src={value} alt={messages.settings.account.avatar} />}
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            {!value && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/0 text-primary opacity-0 transition group-hover:bg-muted/70 group-hover:opacity-100">
                <icons.upload className="size-6" />
              </span>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ""
              if (file) handleFile(file)
            }}
          />
        </div>
        <DialogFooter className="justify-center gap-2 sm:justify-center">
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            <icons.upload className="size-3.5" /> {messages.settings.account.avatarUpload}
          </Button>
          {value && (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={handleRemove}
            >
              {messages.settings.account.avatarRemove}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
