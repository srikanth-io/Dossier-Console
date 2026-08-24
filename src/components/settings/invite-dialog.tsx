import { useEffect, useRef, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { icons, messages, accessLabels } from "@/constants"
import { APP } from "@/constants/app"

type InviteAccess = "editable" | "viewer"

type InviteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function generateInviteToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function QRCodeSVG({ value, size = 160 }: { value: string; size?: number }) {
  const moduleCount = 21
  const cellSize = size / moduleCount

  const hashString = (str: string): number[] => {
    const hash: number[] = []
    for (let i = 0; i < str.length; i++) {
      hash.push(str.charCodeAt(i))
    }
    return hash
  }

  const hash = hashString(value)
  const modules: boolean[][] = Array.from({ length: moduleCount }, () =>
    Array.from({ length: moduleCount }, () => false)
  )

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (row < 7 && col < 7) {
        modules[row][col] = row === 0 || row === 6 || col === 0 || col === 6 ||
          (row >= 2 && row <= 4 && col >= 2 && col <= 4)
      } else if (row < 7 && col >= moduleCount - 7) {
        modules[row][col] = row === 0 || row === 6 || col === moduleCount - 7 || col === moduleCount - 1 ||
          (row >= 2 && row <= 4 && col >= moduleCount - 5 && col <= moduleCount - 3)
      } else if (row >= moduleCount - 7 && col < 7) {
        modules[row][col] = row === moduleCount - 7 || row === moduleCount - 1 || col === 0 || col === 6 ||
          (row >= moduleCount - 5 && row <= moduleCount - 3 && col >= 2 && col <= 4)
      } else {
        const hashIdx = (row * moduleCount + col) % hash.length
        modules[row][col] = (hash[hashIdx] + row + col) % 3 === 0
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {modules.map((row, rowIdx) =>
        row.map((cell, colIdx) =>
          cell ? (
            <rect
              key={`${rowIdx}-${colIdx}`}
              x={colIdx * cellSize}
              y={rowIdx * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  )
}

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const [access, setAccess] = useState<InviteAccess>("viewer")
  const [email, setEmail] = useState("")
  const [inviteToken] = useState(() => generateInviteToken())
  const [activeTab, setActiveTab] = useState("link")
  const linkInputRef = useRef<HTMLInputElement>(null)

  const inviteLink = `${window.location.origin}/invite?token=${inviteToken}&access=${access}`

  useEffect(() => {
    if (open) {
      setEmail("")
      setActiveTab("link")
    }
  }, [open])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success(messages.settings.workspace.inviteLinkCopied)
    } catch {
      if (linkInputRef.current) {
        linkInputRef.current.select()
        document.execCommand("copy")
        toast.success(messages.settings.workspace.inviteLinkCopied)
      }
    }
  }

  const handleSendEmail = () => {
    if (!email.trim()) return
    const subject = encodeURIComponent(`Join ${APP.name} workspace`)
    const body = encodeURIComponent(
      `You've been invited to join the ${APP.name} workspace.\n\n` +
      `Access level: ${accessLabels[access]}\n\n` +
      `Click the link below to join:\n${inviteLink}`
    )
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank")
    toast.success(messages.settings.workspace.inviteEmailSent)
    setEmail("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{messages.settings.workspace.invite}</DialogTitle>
          <DialogDescription>
            {messages.settings.workspace.membersDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{messages.settings.workspace.inviteAccess}</Label>
            <Select value={access} onValueChange={(v) => setAccess(v as InviteAccess)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">{accessLabels.viewer}</SelectItem>
                <SelectItem value="editable">{accessLabels.editable}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="link" className="flex-1">
                <icons.link className="mr-2 size-4" />
                {messages.settings.workspace.inviteLink}
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex-1">
                <icons.qrCode className="mr-2 size-4" />
                {messages.settings.workspace.inviteQrCode}
              </TabsTrigger>
              <TabsTrigger value="email" className="flex-1">
                <icons.mail className="mr-2 size-4" />
                {messages.settings.workspace.inviteEmail}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {messages.settings.workspace.inviteLinkDescription}
              </p>
              <div className="flex gap-2">
                <Input
                  ref={linkInputRef}
                  value={inviteLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button onClick={handleCopyLink}>
                  <icons.copy className="mr-2 size-4" />
                  {messages.settings.workspace.inviteCopyLink}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {messages.settings.workspace.inviteQrCodeDescription}
              </p>
              <div className="flex justify-center">
                <QRCodeSVG value={inviteLink} size={180} />
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send an invite email with the link included.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={messages.settings.workspace.inviteEmailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleSendEmail} disabled={!email.trim()}>
                  <icons.send className="mr-2 size-4" />
                  Send
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {messages.common.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}