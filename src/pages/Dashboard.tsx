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
import { commonMessages, icons, messages } from "@/constants"
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
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">{stat.value}</span>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-0.5"
                  >
                    <icons.trendUp className="size-3" />
                    {stat.delta}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{messages.dashboard.recentDossiers.title}</CardTitle>
            <CardDescription>
              {messages.dashboard.recentDossiers.description}
            </CardDescription>
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
          <CardContent className="space-y-4">
            {activityEvents.map((event, i) => {
              const Icon = icons[event.icon]
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm">{event.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
