import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { commonMessages, icons, messages } from "@/constants"
import { dossiers, dossierStatusFilters } from "@/data/dossiers"
import { getStatusBadgeVariant } from "@/lib/status"

export function Dossiers() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string>(dossierStatusFilters[0].value)

  const filtered = dossiers.filter((d) => {
    const matchesQuery = `${d.id} ${d.subject} ${d.owner}`
      .toLowerCase()
      .includes(query.toLowerCase())
    const matchesStatus = status === "all" || d.status === status
    return matchesQuery && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {messages.dossiers.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {messages.dossiers.subtitle}
          </p>
        </div>
        <Button>
          <icons.newDossier /> {messages.dossiers.newDossier}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>{messages.dossiers.allDossiers}</CardTitle>
            <CardDescription>
              {messages.dossiers.recordsCount(filtered.length)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <icons.search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={messages.dossiers.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-56 pl-8"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={commonMessages.status} />
              </SelectTrigger>
              <SelectContent>
                {dossierStatusFilters.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{commonMessages.id}</TableHead>
                <TableHead>{commonMessages.subject}</TableHead>
                <TableHead>{commonMessages.owner}</TableHead>
                <TableHead>{commonMessages.department}</TableHead>
                <TableHead>{commonMessages.status}</TableHead>
                <TableHead className="text-right">
                  {commonMessages.updated}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.id}</TableCell>
                  <TableCell>{d.subject}</TableCell>
                  <TableCell>{d.owner}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.department}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(d.status)}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {d.updated}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {messages.dossiers.emptyResult}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
