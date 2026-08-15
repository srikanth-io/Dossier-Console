import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { commonMessages, icons, messages } from "@/constants"
import { reports } from "@/data/reports"

export function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {messages.reports.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {messages.reports.subtitle}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reports.map((report) => (
          <Card key={report.title} className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted">
                <icons.report className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {report.meta}
              </span>
              <Button variant="outline" size="sm">
                <icons.download /> {commonMessages.export}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
