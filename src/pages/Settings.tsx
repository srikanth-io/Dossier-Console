import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { APP, commonMessages, departmentLabels, icons, messages } from "@/constants"

export function Settings() {
  const [reviewRequired, setReviewRequired] = useState(true)
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {messages.settings.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {messages.settings.subtitle}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{messages.settings.workspace.title}</CardTitle>
            <CardDescription>
              {messages.settings.workspace.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="workspace-name">
                {messages.settings.workspace.workspaceName}
              </Label>
              <Input
                id="workspace-name"
                defaultValue={APP.defaultWorkspaceName}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="default-department">
                {messages.settings.workspace.defaultDepartment}
              </Label>
              <Select defaultValue="legal">
                <SelectTrigger id="default-department" className="w-full">
                  <SelectValue
                    placeholder={messages.settings.workspace.selectDepartment}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal">{departmentLabels.legal}</SelectItem>
                  <SelectItem value="finance">
                    {departmentLabels.finance}
                  </SelectItem>
                  <SelectItem value="compliance">
                    {departmentLabels.compliance}
                  </SelectItem>
                  <SelectItem value="audit">{departmentLabels.audit}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <icons.save /> {commonMessages.save}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{messages.settings.workflow.title}</CardTitle>
            <CardDescription>
              {messages.settings.workflow.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>{messages.settings.workflow.reviewRequired}</Label>
                <p className="text-sm text-muted-foreground">
                  {messages.settings.workflow.reviewRequiredHint}
                </p>
              </div>
              <Switch
                checked={reviewRequired}
                onCheckedChange={setReviewRequired}
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>{messages.settings.workflow.notifications}</Label>
                <p className="text-sm text-muted-foreground">
                  {messages.settings.workflow.notificationsHint}
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
