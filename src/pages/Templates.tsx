import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { icons, messages, ROUTES } from "@/constants"
import { resumeTemplates } from "@/data/resumeTemplates"
import { RESUME_PREVIEW_CLASSES, renderLatex } from "@/lib/latexPreview"
import { cn } from "@/lib/utils"

export function Templates() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const previews = useMemo(
    () =>
      new Map(
        resumeTemplates.map((template) => [template.id, renderLatex(template.source)])
      ),
    []
  )

  const filtered = resumeTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(query.toLowerCase()) ||
      template.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {messages.templates.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {messages.templates.subtitle}
          </p>
        </div>
        <div className="relative">
          <icons.search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={messages.templates.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-56 pl-8"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {messages.templates.count(filtered.length)}
      </p>

      {filtered.length === 0 ? (
        <Card>
          <CardHeader className="items-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand-accent-soft">
              <icons.templates className="size-6 text-muted-foreground" />
            </div>
            <CardTitle>{messages.templates.emptyResult}</CardTitle>
            <CardDescription>{messages.templates.empty}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template, index) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader className="px-4">
                <div className="flex items-center gap-2">
                  <CardTitle>{template.name}</CardTitle>
                  {index === 0 && (
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {messages.templates.preview}
                    </Badge>
                  )}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>

              <div className="px-4">
                <div className="pointer-events-none max-h-52 overflow-hidden rounded-lg border bg-white [color-scheme:light]">
                  <div
                    className={cn(RESUME_PREVIEW_CLASSES, "p-3 [&_a]:!text-primary")}
                    dangerouslySetInnerHTML={{ __html: previews.get(template.id) ?? "" }}
                  />
                  <div className="h-10 bg-gradient-to-b from-transparent to-white" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-foreground/5 px-4 py-3">
                <span className="text-xs text-muted-foreground">
                  {template.source.length} characters
                </span>
                <Button
                  size="sm"
                  onClick={() =>
                    navigate(`${ROUTES.resumeCreator}?template=${template.id}`)
                  }
                >
                  <icons.pencil className="size-3.5" />
                  {messages.templates.openInCreator}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
