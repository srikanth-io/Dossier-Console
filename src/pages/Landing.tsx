import { Link } from "react-router-dom"

import { MacbookMockup, MobileMockup } from "@/components/device-mockups"
import { StoreBadges } from "@/components/store-badges"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { APP, ROUTES, icons, messages } from "@/constants"
import { landingFeatures, landingStats, landingSteps, landingPreview } from "@/data/landing"
import { cn } from "@/lib/utils"

function LandingHeader() {
  const navLinks = [
    { label: messages.landing.header.nav.features, href: "#features" },
    { label: messages.landing.header.nav.templates, href: "#how-it-works" },
    { label: messages.landing.header.nav.pricing, href: "#cta" },
    { label: messages.landing.header.nav.docs, href: "#cta" },
  ]

  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Link to={ROUTES.landing} className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <icons.brand className="size-4" />
          </div>
          <div className="leading-tight">
            <p className="font-heading text-sm font-bold">{APP.name}</p>
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              {APP.console}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link to={ROUTES.login}>
              {messages.landing.header.nav.signIn}
            </Link>
          </Button>
          <Button asChild variant="default" size="sm" className="rounded-full">
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
          className="animate-fade-rise gap-2 rounded-full border-border/60 px-3.5 py-1.5"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-accent opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-accent" />
          </span>
          {messages.landing.hero.badge}
        </Badge>

        <h1 className="mt-7 max-w-3xl animate-fade-rise font-heading text-4xl leading-[1.1] font-extrabold tracking-[-0.025em] [animation-delay:80ms] sm:text-5xl lg:text-6xl">
          {messages.landing.hero.titleLine1}
          <br />
          <span className="bg-gradient-brand bg-clip-text text-transparent">
            {messages.landing.hero.titleLine2}
          </span>
        </h1>

        <p className="mt-6 max-w-2xl animate-fade-rise text-lg leading-[1.6] text-muted-foreground [animation-delay:160ms]">
          {messages.landing.hero.subtitle}
        </p>

        <div className="mt-9 flex animate-fade-rise flex-wrap items-center justify-center gap-3 [animation-delay:240ms]">
          <Button asChild size="lg" variant="default" className="rounded-full">
            <Link to={ROUTES.login}>
              {messages.landing.hero.primaryCta}
              <icons.arrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <a href="#how-it-works">
              <icons.play className="size-4" />
              {messages.landing.hero.secondaryCta}
            </a>
          </Button>
        </div>
      </div>

      <div className="relative mx-auto mt-16 w-full max-w-5xl px-4 lg:mt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 left-1/2 h-72 w-[720px] max-w-full -translate-x-1/2 rounded-full bg-gradient-brand-soft blur-[100px]"
        />
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xl">
          <MacbookMockup />
        </div>
        <MobileMockup className="absolute -bottom-10 -right-2 w-40 sm:-right-4 sm:w-48 lg:-right-12" />
      </div>
    </section>
  )
}

function LogoTicker() {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
          {messages.landing.logos.map((logo) => (
            <span
              key={logo}
              className="flex items-center justify-center text-sm font-bold tracking-[0.18em] text-muted-foreground/60 uppercase transition-colors duration-200 select-none hover:text-muted-foreground"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsBand() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 lg:py-20">
      <div className="grid grid-cols-2 gap-y-10 rounded-3xl border border-border/80 bg-card px-6 py-10 shadow-sm md:grid-cols-4 md:px-10 md:py-12">
        {landingStats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "text-center",
              index > 0 && "md:border-l md:border-border"
            )}
          >
            <p className="font-heading text-3xl font-bold tracking-tight tabular-nums md:text-4xl">
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
  const features = landingFeatures.slice(0, 5)

  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {messages.landing.header.nav.features}
        </p>
        <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {messages.landing.features.title}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {messages.landing.features.subtitle}
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = icons[feature.icon]
          const isWide = index === 0
          return (
            <div
              key={feature.title}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-md",
                isWide && "md:col-span-2 md:p-8"
              )}
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-gradient-brand-soft blur-2xl transition-opacity duration-300",
                  isWide ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              />
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-xl",
                  isWide
                    ? "size-12 bg-primary text-primary-foreground shadow-sm"
                    : "size-10 bg-primary-soft text-primary"
                )}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="relative mt-5 font-heading text-lg font-bold">
                {feature.title}
              </h3>
              <p
                className={cn(
                  "relative mt-2 text-sm leading-relaxed text-muted-foreground",
                  isWide && "max-w-xl"
                )}
              >
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border/60 bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {messages.landing.header.nav.howItWorks}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {messages.landing.howItWorks.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {messages.landing.howItWorks.subtitle}
          </p>
        </div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
          <div
            aria-hidden
            className="absolute top-8 right-[16.67%] left-[16.67%] hidden h-px border-t-2 border-dashed border-border md:block"
          />
          {landingSteps.map((step, index) => {
            const Icon = icons[step.icon]
            return (
              <div
                key={step.title}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border/70 bg-card shadow-sm">
                  <Icon className="size-6 text-primary" />
                  <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white shadow-glow">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-heading text-lg font-bold">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
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
    <section id="cta" className="mx-auto w-full max-w-6xl px-4 py-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand px-6 py-16 text-center shadow-glow md:px-16 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[560px] -translate-x-1/2 rounded-full bg-white/15 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white md:text-4xl">
            {messages.landing.cta.title}
          </h2>
          <p className="text-base leading-relaxed text-white/80 md:text-lg">
            {messages.landing.cta.subtitle}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white text-primary shadow-lg hover:bg-white/90 hover:shadow-xl"
            >
              <Link to={ROUTES.login}>
                {messages.landing.cta.button}
                <icons.arrowRight />
              </Link>
            </Button>
          </div>
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
    <footer className="border-t border-border/60 bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <icons.brand className="size-4" />
              </div>
              <div className="leading-tight">
                <p className="font-heading text-sm font-bold">{APP.name}</p>
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  {APP.console}
                </p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {messages.landing.footer.tagline}
            </p>
            <StoreBadges className="pt-1" />
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold">{column.title}</p>
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
        <LogoTicker />
        <StatsBand />
        <Features />
        <HowItWorks />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
