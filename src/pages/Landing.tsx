import { Link } from "react-router-dom"

import { MacbookMockup, MobileMockup } from "@/components/marketing/device-mockups"
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"
import { AvatarCircles } from "@/components/ui/avatar-circles"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/ui/blur-fade"
import { Button } from "@/components/ui/button"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { Meteors } from "@/components/ui/meteors"
import { Ripple } from "@/components/ui/ripple"
import { ScrollVelocityContainer, ScrollVelocityRow } from "@/components/ui/scroll-based-velocity"
import { Separator } from "@/components/ui/separator"
import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/ui/terminal"
import { TextAnimate } from "@/components/ui/text-animate"
import { TextReveal } from "@/components/ui/text-reveal"
import { APP, ROUTES, icons, messages } from "@/constants"
import { landingFeatures, landingStats, landingSteps, landingPreview } from "@/data/landing"
import { cn } from "@/lib/utils"

const avatarUrls = [
  { imageUrl: "https://i.pravatar.cc/150?img=1", profileUrl: "#" },
  { imageUrl: "https://i.pravatar.cc/150?img=2", profileUrl: "#" },
  { imageUrl: "https://i.pravatar.cc/150?img=3", profileUrl: "#" },
  { imageUrl: "https://i.pravatar.cc/150?img=4", profileUrl: "#" },
  { imageUrl: "https://i.pravatar.cc/150?img=5", profileUrl: "#" },
]

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
      <Meteors number={15} />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-20 text-center lg:pt-28">
        <BlurFade delay={0.1} inView>
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
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <TextAnimate
            as="h1"
            by="word"
            animation="blurInUp"
            className="mt-7 max-w-3xl font-heading text-4xl leading-[1.1] font-extrabold tracking-[-0.025em] sm:text-5xl lg:text-6xl"
          >
            {messages.landing.hero.titleLine1}
          </TextAnimate>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <h1 className="mt-2 max-w-3xl font-heading text-4xl leading-[1.1] font-extrabold tracking-[-0.025em] sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-brand bg-clip-text text-transparent">
              <TextAnimate by="word" animation="blurInUp">
                {messages.landing.hero.titleLine2}
              </TextAnimate>
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.4} inView>
          <AnimatedShinyText shimmerWidth={200} className="mt-6 max-w-2xl text-lg">
            {messages.landing.hero.subtitle}
          </AnimatedShinyText>
        </BlurFade>

        <BlurFade delay={0.5} inView>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <InteractiveHoverButton className="h-12 px-8 text-base">
              <Link to={ROUTES.login} className="flex items-center gap-2">
                {messages.landing.hero.primaryCta}
              </Link>
            </InteractiveHoverButton>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <a href="#how-it-works">
                <icons.play className="size-4" />
                {messages.landing.hero.secondaryCta}
              </a>
            </Button>
          </div>
        </BlurFade>

        <BlurFade delay={0.6} inView>
          <div className="mt-8 flex items-center gap-4">
            <AvatarCircles avatarUrls={avatarUrls} numPeople={99} />
            <p className="text-sm text-muted-foreground">
              Loved by 1,000+ teams worldwide
            </p>
          </div>
        </BlurFade>
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

function ScrollVelocityBanner() {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-muted/30 py-4">
      <ScrollVelocityContainer>
        <ScrollVelocityRow baseVelocity={20} direction={1}>
          <span className="mx-8 text-sm font-bold tracking-widest text-muted-foreground/60 uppercase">
            Document Management
          </span>
          <span className="mx-8 text-sm font-bold tracking-widest text-muted-foreground/60 uppercase">
            Template Library
          </span>
          <span className="mx-8 text-sm font-bold tracking-widest text-muted-foreground/60 uppercase">
            Resume Builder
          </span>
          <span className="mx-8 text-sm font-bold tracking-widest text-muted-foreground/60 uppercase">
            Team Collaboration
          </span>
          <span className="mx-8 text-sm font-bold tracking-widest text-muted-foreground/60 uppercase">
            Smart Reports
          </span>
          <span className="mx-8 text-sm font-bold tracking-widest text-muted-foreground/60 uppercase">
            Notepad Editor
          </span>
        </ScrollVelocityRow>
      </ScrollVelocityContainer>
    </section>
  )
}

function StatsBand() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 lg:py-20">
      <div className="grid grid-cols-2 gap-y-10 rounded-3xl border border-border/80 bg-card px-6 py-10 shadow-sm md:grid-cols-4 md:px-10 md:py-12">
        {landingStats.map((stat, index) => (
          <BlurFade key={stat.label} delay={index * 0.1} inView>
            <div
              className={cn(
                "text-center",
                index > 0 && "md:border-l md:border-border"
              )}
            >
              <AnimatedCircularProgressBar
                value={parseInt(stat.value) || 0}
                gaugePrimaryColor="var(--primary)"
                gaugeSecondaryColor="var(--muted)"
                className="mx-auto mb-2 size-20 text-lg font-bold"
              />
              <p className="font-heading text-3xl font-bold tracking-tight tabular-nums md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </BlurFade>
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
        <BlurFade delay={0.1} inView>
          <p className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {messages.landing.header.nav.features}
          </p>
        </BlurFade>
        <BlurFade delay={0.2} inView>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {messages.landing.features.title}
          </h2>
        </BlurFade>
        <BlurFade delay={0.3} inView>
          <p className="mt-4 text-lg text-muted-foreground">
            {messages.landing.features.subtitle}
          </p>
        </BlurFade>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = icons[feature.icon]
          const isWide = index === 0
          return (
            <BlurFade key={feature.title} delay={0.1 * index} inView>
              <div
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
            </BlurFade>
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
          <BlurFade delay={0.1} inView>
            <p className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
              {messages.landing.header.nav.howItWorks}
            </p>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {messages.landing.howItWorks.title}
            </h2>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <p className="mt-4 text-lg text-muted-foreground">
              {messages.landing.howItWorks.subtitle}
            </p>
          </BlurFade>
        </div>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
          <div
            aria-hidden
            className="absolute top-8 right-[16.67%] left-[16.67%] hidden h-px border-t-2 border-dashed border-border md:block"
          />
          {landingSteps.map((step, index) => {
            const Icon = icons[step.icon]
            return (
              <BlurFade key={step.title} delay={0.2 * index} inView>
                <div className="relative flex flex-col items-center text-center">
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
              </BlurFade>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TerminalDemo() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <BlurFade delay={0.1} inView>
          <div>
            <p className="font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Power User Mode
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Built for speed and simplicity
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to manage documents, templates, and team collaboration in one powerful dashboard.
            </p>
            <div className="mt-8">
              <AvatarCircles avatarUrls={avatarUrls} numPeople={50} />
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <Terminal className="mx-auto max-w-md" sequence>
            <AnimatedSpan>
              <span className="text-green-500">❯</span> npx create-dossier-admin
            </AnimatedSpan>
            <TypingAnimation duration={50}>
              ✓ Installing dependencies...
            </TypingAnimation>
            <AnimatedSpan>
              <span className="text-green-500">✓</span> Dependencies installed
            </AnimatedSpan>
            <TypingAnimation duration={50}>
              ✓ Setting up Supabase...
            </TypingAnimation>
            <AnimatedSpan>
              <span className="text-green-500">✓</span> Database connected
            </AnimatedSpan>
            <TypingAnimation duration={50}>
              ✓ Building dashboard...
            </TypingAnimation>
            <AnimatedSpan>
              <span className="text-green-500">✓</span> Ready at localhost:5173
            </AnimatedSpan>
          </Terminal>
        </BlurFade>
      </div>
    </section>
  )
}

function TextRevealSection() {
  const text = `${APP.name} is the ultimate document management platform that helps teams create, organize, and collaborate on documents with powerful templates and smart analytics.`
  return (
    <section className="border-y border-border/60 bg-muted/40">
      <TextReveal>
        {text}
      </TextReveal>
    </section>
  )
}

function CtaSection() {
  return (
    <section id="cta" className="mx-auto w-full max-w-6xl px-4 py-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-brand px-6 py-16 text-center shadow-glow md:px-16 md:py-20">
        <Ripple mainCircleSize={300} numCircles={6} />
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
            <InteractiveHoverButton className="bg-white text-primary hover:bg-white/90">
              <Link to={ROUTES.login} className="flex items-center gap-2">
                {messages.landing.cta.button}
              </Link>
            </InteractiveHoverButton>
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
        <ScrollVelocityBanner />
        <StatsBand />
        <Features />
        <HowItWorks />
        <TerminalDemo />
        <TextRevealSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
