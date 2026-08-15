import { Link } from "react-router-dom"

import { DeviceShowcase } from "@/components/device-mockups"
import { StoreBadges } from "@/components/store-badges"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { APP, ROUTES, icons, messages } from "@/constants"
import { landingFeatures, landingStats, landingSteps, landingPreview } from "@/data/landing"
import { cn } from "@/lib/utils"

function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-4">
        <Link to={ROUTES.landing} className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
            <icons.brand className="size-4" />
          </div>
          <span className="text-sm font-semibold">{APP.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {messages.landing.header.nav.features}
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {messages.landing.header.nav.howItWorks}
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to={ROUTES.login}>
              {messages.landing.header.nav.signIn}
            </Link>
          </Button>
          <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Link to={ROUTES.login}>
              {messages.landing.header.nav.getStarted}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 lg:pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,black,transparent)]" />
        <div className="absolute -top-48 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-brand-accent/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-20 text-center lg:pt-28">
        <Badge
          variant="secondary"
          className="gap-2 rounded-full border-border/60 px-3.5 py-1.5"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-accent opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-accent" />
          </span>
          {messages.landing.hero.badge}
        </Badge>

        <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {messages.landing.hero.titleLine1}
          <br />
          <span className="relative inline-block">
            {messages.landing.hero.titleLine2}
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-2 h-1.5 rounded-full bg-brand-accent"
            />
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          {messages.landing.hero.subtitle}
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Link to={ROUTES.login}>
              {messages.landing.hero.primaryCta}
              <icons.arrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <a href="#how-it-works">
              {messages.landing.hero.secondaryCta}
            </a>
          </Button>
        </div>

        <StoreBadges className="mt-9 justify-center" />
      </div>

      <div className="relative mx-auto mt-16 w-full max-w-5xl px-4 lg:mt-24">
        <DeviceShowcase />
      </div>
    </section>
  )
}

function StatsBand() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4">
      <div className="grid grid-cols-2 gap-y-10 rounded-3xl border bg-card px-6 py-10 shadow-sm md:grid-cols-4 md:px-10 md:py-12">
        {landingStats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "text-center",
              index > 0 && "md:border-l md:border-border"
            )}
          >
            <p className="text-3xl font-semibold tracking-tight tabular-nums md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Features() {
  const spans = [
    "md:col-span-4",
    "md:col-span-2",
    "md:col-span-2",
    "md:col-span-2",
    "md:col-span-2",
    "md:col-span-6",
  ]

  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {messages.landing.header.nav.features}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {messages.landing.features.title}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {messages.landing.features.subtitle}
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-6">
        {landingFeatures.map((feature, index) => {
          const Icon = icons[feature.icon]
          const isWide = index === 0 || index === 5
          return (
            <Card
              key={feature.title}
              className={cn(
                "group relative overflow-hidden rounded-2xl border-border/70 transition-all duration-300 hover:border-foreground/25 hover:shadow-md",
                spans[index],
                isWide &&
                  "bg-gradient-to-br from-brand-accent-soft via-card to-card"
              )}
            >
              <CardContent className={cn("p-6", isWide && "sm:p-8")}>
                <div className="flex size-11 items-center justify-center rounded-xl bg-foreground text-background">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-medium">{feature.title}</h3>
                <p className={cn(
                  "mt-2 text-sm text-muted-foreground",
                  isWide && "max-w-2xl"
                )}>
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {messages.landing.header.nav.howItWorks}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {messages.landing.howItWorks.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {messages.landing.howItWorks.subtitle}
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {landingSteps.map((step, index) => {
            const Icon = icons[step.icon]
            return (
              <div
                key={step.title}
                className="relative overflow-hidden rounded-2xl border bg-background p-7"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-10 -right-6 text-[7rem] leading-none font-semibold text-foreground/5 select-none"
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-brand-accent text-foreground">
                    <Icon className="size-5" />
                  </div>
                  <span className="font-mono text-sm font-medium text-muted-foreground">
                    STEP {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="relative mt-7 text-lg font-medium">
                  {step.title}
                </h3>
                <p className="relative mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24">
      <div className="relative overflow-hidden rounded-3xl bg-foreground px-6 py-16 text-center text-background md:px-16 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-brand-accent/25 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-accent/60 to-transparent"
        />

        <div className="relative mx-auto flex max-w-xl flex-col items-center gap-6">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {messages.landing.cta.title}
          </h2>
          <p className="text-background/70">
            {messages.landing.cta.subtitle}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-brand-accent text-foreground hover:bg-brand-accent/90"
            >
              <Link to={ROUTES.login}>
                {messages.landing.cta.button}
                <icons.arrowRight />
              </Link>
            </Button>
          </div>
          <StoreBadges inverted className="justify-center" />
        </div>
      </div>
    </section>
  )
}

function LandingFooter() {
  const columns = [
    {
      title: messages.landing.footer.product,
      links: messages.landing.footer.productLinks,
    },
    {
      title: messages.landing.footer.company,
      links: messages.landing.footer.companyLinks,
    },
    {
      title: messages.landing.footer.resources,
      links: messages.landing.footer.resourceLinks,
    },
  ]

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
                <icons.brand className="size-4" />
              </div>
              <span className="text-sm font-semibold">{APP.name}</span>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground">
              {messages.landing.footer.tagline}
            </p>
            <StoreBadges className="pt-1" />
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-medium">{column.title}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {messages.landing.footer.copyright(new Date().getFullYear())}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {landingPreview.url}
          </p>
        </div>
      </div>
    </footer>
  )
}

export function Landing() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <StatsBand />
        <Features />
        <HowItWorks />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
