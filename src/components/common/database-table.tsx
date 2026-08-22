import { useCallback, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { icons } from "@/constants"
import { cn } from "@/lib/utils"

export type PropertyType = "title" | "text" | "number" | "select" | "date" | "person" | "checkbox" | "status"

export type PropertyDef = {
  id: string
  name: string
  type: PropertyType
  options?: string[]
}

export type DatabaseRow = {
  id: string
  values: Record<string, string | number | boolean>
}

type DatabaseTableProps = {
  properties: PropertyDef[]
  rows: DatabaseRow[]
  title: string
}

const statusColors: Record<string, string> = {
  "Not started": "bg-muted text-muted-foreground",
  "In progress": "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  "Done": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  "Review": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  "High": "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  "Medium": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  "Low": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
}

export function DatabaseTable({ properties, rows: initialRows }: DatabaseTableProps) {
  const [rows, setRows] = useState(initialRows)
  const [filterProp, setFilterProp] = useState<string>("none")
  const [filterValue, setFilterValue] = useState("")
  const [sortProp, setSortProp] = useState<string>("none")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [search, setSearch] = useState("")

  const filteredRows = useMemo(() => {
    let result = [...rows]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((row) =>
        properties.some((p) => {
          const val = row.values[p.id]
          return String(val ?? "").toLowerCase().includes(q)
        })
      )
    }

    if (filterProp !== "none" && filterValue) {
      result = result.filter((row) => {
        const val = String(row.values[filterProp] ?? "")
        return val.toLowerCase().includes(filterValue.toLowerCase())
      })
    }

    if (sortProp !== "none") {
      result.sort((a, b) => {
        const av = a.values[sortProp] ?? ""
        const bv = b.values[sortProp] ?? ""
        const cmp = typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv))
        return sortDir === "asc" ? cmp : -cmp
      })
    }

    return result
  }, [rows, properties, filterProp, filterValue, sortProp, sortDir, search])

  const addRow = useCallback(() => {
    const id = `r-${Date.now()}`
    const values: Record<string, string | number | boolean> = {}
    properties.forEach((p) => {
      if (p.type === "checkbox") values[p.id] = false
      else if (p.type === "number") values[p.id] = 0
      else values[p.id] = ""
    })
    setRows((prev) => [...prev, { id, values }])
  }, [properties])

  const updateCell = useCallback((rowId: string, propId: string, value: string | number | boolean) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, values: { ...r.values, [propId]: value } } : r
      )
    )
  }, [])

  const deleteRow = useCallback((rowId: string) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId))
  }, [])

  const selectProps = properties.filter((p) => p.type === "select" && p.options?.length)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <icons.search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search records…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>

        {selectProps.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Select value={filterProp} onValueChange={setFilterProp}>
              <SelectTrigger size="sm" className="h-8 w-28">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No filter</SelectItem>
                {selectProps.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterProp !== "none" && (
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger size="sm" className="h-8 w-28">
                  <SelectValue placeholder="Value" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {selectProps
                    .find((p) => p.id === filterProp)
                    ?.options?.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Select value={sortProp} onValueChange={setSortProp}>
            <SelectTrigger size="sm" className="h-8 w-28">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No sort</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sortProp !== "none" && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            >
              {sortDir === "asc" ? "↑" : "↓"}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              {properties.map((p) => (
                <TableHead key={p.id} scope="col" className="text-xs">
                  {p.name}
                </TableHead>
              ))}
              <TableHead scope="col" className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id}>
                {properties.map((p) => {
                  const val = row.values[p.id]
                  if (p.type === "checkbox") {
                    return (
                      <TableCell key={p.id}>
                        <input
                          type="checkbox"
                          checked={!!val}
                          onChange={(e) => updateCell(row.id, p.id, e.target.checked)}
                          className="size-4 rounded border-border"
                        />
                      </TableCell>
                    )
                  }
                  if (p.type === "select" && p.options) {
                    return (
                      <TableCell key={p.id}>
                        <Select
                          value={String(val ?? "")}
                          onValueChange={(v) => updateCell(row.id, p.id, v)}
                        >
                          <SelectTrigger size="sm" className="h-7 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {p.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )
                  }
                  if (p.type === "status") {
                    return (
                      <TableCell key={p.id}>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", statusColors[String(val ?? "")] ?? "")}
                        >
                          {String(val ?? "—")}
                        </Badge>
                      </TableCell>
                    )
                  }
                  if (p.type === "number") {
                    return (
                      <TableCell key={p.id}>
                        <input
                          type="number"
                          value={Number(val ?? 0)}
                          onChange={(e) => updateCell(row.id, p.id, Number(e.target.value))}
                          className="w-20 border-0 bg-transparent text-sm tabular-nums outline-none focus:ring-0"
                        />
                      </TableCell>
                    )
                  }
                  if (p.type === "date") {
                    return (
                      <TableCell key={p.id} className="text-xs text-muted-foreground">
                        {String(val ?? "—")}
                      </TableCell>
                    )
                  }
                  if (p.type === "person") {
                    return (
                      <TableCell key={p.id}>
                        <div className="flex items-center gap-1.5">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {String(val ?? "?").charAt(0)}
                          </span>
                          <span className="text-xs">{String(val ?? "—")}</span>
                        </div>
                      </TableCell>
                    )
                  }
                  return (
                    <TableCell key={p.id}>
                      <input
                        type="text"
                        value={String(val ?? "")}
                        onChange={(e) => updateCell(row.id, p.id, e.target.value)}
                        className="w-full border-0 bg-transparent text-sm outline-none focus:ring-0"
                      />
                    </TableCell>
                  )
                })}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-6 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteRow(row.id)}
                  >
                    <icons.trash className="size-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button variant="ghost" size="sm" className="w-full" onClick={addRow}>
        <icons.plus className="size-3.5" /> New record
      </Button>

      <p className="text-xs text-muted-foreground">
        {filteredRows.length} record{filteredRows.length !== 1 ? "s" : ""}
        {filteredRows.length !== rows.length && ` of ${rows.length}`}
      </p>
    </div>
  )
}
