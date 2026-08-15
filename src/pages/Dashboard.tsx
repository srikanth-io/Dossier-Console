import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { commonMessages, icons, messages, ROUTES } from "@/constants"
import {
  activityEvents,
  dashboardStats,
  recentDossiers,
} from "@/data/dashboard"
import { getStatusBadgeVariant } from "@/lib/status"

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {messages.dashboard.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {messages.dashboard.subtitle}
          </p>
        </div>
        <Button>
          <icons.newDossier /> {messages.dashboard.newDossier}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = icons[stat.icon]
          return (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-brand-accent-soft">
                    <Icon className="size-5" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-0.5 rounded-full"
                  >
                    <icons.trendUp className="size-3" />
                    {stat.delta}
                  </Badge>
                </div>
                <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{messages.dashboard.recentDossiers.title}</CardTitle>
              <CardDescription>
                {messages.dashboard.recentDossiers.description}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.dossiers}>
                {messages.dashboard.recentDossiers.viewAll}
                <icons.arrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{commonMessages.id}</TableHead>
                  <TableHead>{commonMessages.subject}</TableHead>
                  <TableHead>{commonMessages.owner}</TableHead>
                  <TableHead>{commonMessages.status}</TableHead>
                  <TableHead className="text-right">
                    {commonMessages.updated}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDossiers.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.id}</TableCell>
                    <TableCell>{d.subject}</TableCell>
                    <TableCell>{d.owner}</TableCell>
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
                {recentDossiers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {messages.dashboard.emptyRecent}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{messages.dashboard.activity.title}</CardTitle>
            <CardDescription>{messages.dashboard.activity.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-5">
              {activityEvents.map((event, i) => {
                return (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft">
                      <div className="size-1.5 rounded-full bg-brand-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm">{event.text}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.time}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
