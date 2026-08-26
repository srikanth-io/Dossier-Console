import { Link } from "react-router-dom"

import { DashboardMockup } from "@/components/marketing/device-mockups"
import { DriftWall } from "@/components/marketing/drift-wall"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/ui/blur-fade"
import { Button } from "@/components/ui/button"
import { ScrollVelocityContainer, ScrollVelocityRow } from "@/components/ui/scroll-based-velocity"
import { APP, ROUTES, icons, messages } from "@/constants"
import { appIcons, testimonialQuotes } from "@/data/landing"

function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Link to={ROUTES.landing} className="flex items-center gap-2">
          <span className="font-heading text-xl font-black italic tracking-tight text-white">
            {APP.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { label: messages.landing.header.nav.features, href: "#features" },
            { label: messages.landing.header.nav.solutions, href: "#made-for" },
            { label: messages.landing.header.nav.resources, href: "#testimonials" },
            { label: messages.landing.header.nav.pricing, href: "#cta" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/50 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="hidden rounded-full text-white/70 hover:text-white hover:bg-white/10 sm:inline-flex">
            <Link to={ROUTES.login}>
              {messages.landing.header.nav.signIn}
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-white px-5 text-black hover:bg-white/90"
          >
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
    <section className="relative bg-[#0a0a0a] pb-24">
      <div className="relative mx-auto w-full max-w-6xl px-4 pt-20 lg:pt-24">
        <div className="relative">
          <DashboardMockup className="min-h-[400px] sm:min-h-[500px] lg:min-h-[560px]" />

          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"
          />
        </div>

        <div className="relative z-20 -mt-24 flex flex-col items-center text-center sm:-mt-20">
          <BlurFade delay={0.1} inView>
            <Badge
              variant="secondary"
              className="gap-2 rounded-full border-white/10 bg-white/10 px-3.5 py-1.5 text-xs text-white/80 backdrop-blur-sm"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-white" />
              </span>
              {messages.landing.hero.badge}
            </Badge>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <h1 className="mt-6 max-w-3xl font-heading text-5xl leading-[1.1] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              {messages.landing.hero.titleLine1}{" "}
              <span className="italic text-white/60">{messages.landing.hero.titleLine2}</span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <p className="mt-5 max-w-xl text-base text-white/60 lg:text-lg">
              {messages.landing.hero.subtitle}
            </p>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-8 text-black hover:bg-white/90"
              >
                <Link to={ROUTES.login} className="flex items-center gap-2">
                  <icons.download className="size-4" />
                  {messages.landing.hero.primaryCta}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white">
                <a href="#how-it-works" className="flex items-center gap-2">
                  <icons.play className="size-4" />
                  {messages.landing.hero.secondaryCta}
                </a>
              </Button>
            </div>
          </BlurFade>

          <BlurFade delay={0.5} inView>
            <div className="mt-8 flex items-center gap-4 text-xs text-white/50">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <icons.apple className="size-4" />
                <div className="text-left leading-tight">
                  <p className="text-[8px] uppercase">Download on the</p>
                  <p className="font-semibold text-white/80">App Store</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <icons.play className="size-4" />
                <div className="text-left leading-tight">
                  <p className="text-[8px] uppercase">Get it on</p>
                  <p className="font-semibold text-white/80">Google Play</p>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}

function PartnerLogos() {
  const partners = messages.landing.logos.partners
  return (
    <section className="border-y border-white/10 bg-[#0a0a0a] py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between">
        <p className="text-center text-xs text-white/40 sm:text-left">
          {messages.landing.logos.title}
        </p>
        <div className="flex items-center gap-6 text-sm font-semibold text-white/20">
          {partners.map((name) => (
            <span key={name} className="hidden sm:inline">{name}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

function AppShowcase() {
  return (
    <section className="relative overflow-hidden bg-[#111] py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <BlurFade delay={0.1} inView>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {messages.landing.appShowcase.title}
              </h2>
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <p className="mt-4 text-lg text-white/50">
                {messages.landing.appShowcase.subtitle}
              </p>
            </BlurFade>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent blur-3xl" />
            <div className="relative flex flex-wrap items-center justify-center gap-3">
              {appIcons.map((app, i) => (
                <BlurFade key={app.name} delay={0.1 * i} inView>
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm">
                    <span className="text-xs font-bold text-white/70">{app.name[0]}</span>
                  </div>
                </BlurFade>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SpeedSection() {
  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {messages.landing.speed.title}
            </h2>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <p className="mt-4 text-lg text-white/50">
              {messages.landing.speed.subtitle}
            </p>
          </BlurFade>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <BlurFade delay={0.1} inView>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <p className="text-xs font-medium text-white/40 uppercase">
                {messages.landing.speed.typing}
              </p>
              <p className="mt-3 font-heading text-5xl font-bold tracking-tight text-white">
                {messages.landing.speed.typingSpeed}
              </p>
              <p className="mt-2 text-sm text-white/40">
                {messages.landing.speed.typingDesc}
              </p>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[30%] rounded-full bg-white/20" />
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <div className="rounded-3xl border border-white/20 bg-white p-8">
              <p className="text-xs font-medium text-black/40 uppercase">
                {messages.landing.speed.dossier}
              </p>
              <p className="mt-3 font-heading text-5xl font-bold tracking-tight text-black">
                {messages.landing.speed.dossierSpeed}
              </p>
              <p className="mt-2 text-sm text-black/50">
                {messages.landing.speed.dossierDesc}
              </p>
              <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-black/10">
                <div className="h-full w-[100%] rounded-full bg-black" />
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}

function MadeForSection() {
  return (
    <section id="made-for" className="border-y border-white/10 bg-[#111] py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <BlurFade delay={0.1} inView>
              <h2 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {messages.landing.madeFor.title}{" "}
                <span className="italic text-white/50">{messages.landing.madeFor.titleItalic}</span>
              </h2>
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <p className="mt-4 text-lg text-white/50">
                {messages.landing.madeFor.description}
              </p>
            </BlurFade>
            <BlurFade delay={0.3} inView>
              <div className="mt-8">
                <h3 className="font-heading text-xl font-bold text-white">{messages.landing.madeFor.oneTool}</h3>
                <p className="mt-2 text-sm text-white/50">{messages.landing.madeFor.oneToolDesc}</p>
              </div>
            </BlurFade>
          </div>
          <BlurFade delay={0.2} inView>
            <div className="relative">
              <div className="aspect-square rounded-3xl border border-white/10 bg-white/5 p-8">
                <div className="flex h-full items-center justify-center">
                  <icons.dossiers className="size-24 text-white/10" />
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}

function FeatureCards() {
  const features = [
    { ...messages.landing.features.aiEdits, icon: "sparkles" as const },
    { ...messages.landing.features.dictionary, icon: "dossiers" as const },
    { ...messages.landing.features.snippets, icon: "reports" as const },
    { ...messages.landing.features.languages, icon: "activity" as const },
  ]

  return (
    <section id="features" className="bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = icons[feature.icon]
            return (
              <BlurFade key={feature.title} delay={0.1 * index} inView>
                <div className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="size-6 text-white/70" />
                  </div>
                  <h3 className="mt-5 font-heading text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {feature.description}
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

function PlatformSection() {
  return (
    <section className="bg-[#111] py-24">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <BlurFade delay={0.1} inView>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {messages.landing.platform.title}
          </h2>
        </BlurFade>
        <BlurFade delay={0.2} inView>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/50">
            {messages.landing.platform.subtitle}
          </p>
        </BlurFade>
        <BlurFade delay={0.3} inView>
          <div className="mt-8 flex justify-center gap-4">
            {["macOS", "Windows", "iOS", "Android"].map((platform) => (
              <div key={platform} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70">
                {platform === "iOS" ? (
                  <icons.apple className="size-4" />
                ) : (
                  <icons.monitor className="size-4" />
                )}
                {platform}
              </div>
            ))}
          </div>
        </BlurFade>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {messages.landing.testimonials.title}
            </h2>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <p className="mt-4 text-lg text-white/50">
              {messages.landing.testimonials.subtitle}
            </p>
          </BlurFade>
        </div>
      </div>

      <div className="mt-14">
        <DriftWall
          items={testimonialQuotes}
          columns={3}
          tileWidth={300}
          tileHeight={280}
          gap={20}
          speed={25}
          direction="up"
        />
      </div>
    </section>
  )
}

function StatsSection() {
  return (
    <section className="bg-[#111] py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {messages.landing.stats.map((stat, index) => (
            <BlurFade key={stat.label} delay={0.1 * index} inView>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-semibold text-white">{stat.label}</p>
                <p className="mt-1 text-xs text-white/40">{stat.value}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section id="cta" className="bg-[#0a0a0a] py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-xl text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {messages.landing.cta.title}
            </h2>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <p className="mt-4 text-white/50">
              {messages.landing.cta.subtitle}
            </p>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder={messages.landing.cta.placeholder}
                className="h-12 w-full max-w-xs rounded-full border border-white/10 bg-white/5 px-5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30 focus:ring-2 focus:ring-white/10"
              />
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-8 text-black hover:bg-white/90"
              >
                <Link to={ROUTES.login}>
                  {messages.landing.cta.button}
                </Link>
              </Button>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <span className="font-heading text-2xl font-black italic tracking-tight text-white">
              {APP.name}
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-white/40">
              {messages.landing.footer.tagline}
            </p>
          </div>

          {[
            { title: messages.landing.footer.product, links: messages.landing.footer.productLinks },
            { title: messages.landing.footer.company, links: messages.landing.footer.companyLinks },
            { title: messages.landing.footer.resources, links: messages.landing.footer.resourceLinks },
          ].map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-white">{column.title}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/40 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">
            {messages.landing.footer.copyright(new Date().getFullYear())}
          </p>
          <div className="flex items-center gap-4 text-white/40">
            {messages.landing.footer.legalLinks.map((link) => (
              <a key={link} href="#" className="text-xs transition-colors hover:text-white">
                {link}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-16 overflow-hidden text-center">
          <span className="font-heading text-[120px] font-black italic leading-none tracking-tighter text-white/[0.03] sm:text-[180px]">
            {APP.name}
          </span>
        </div>
      </div>
    </footer>
  )
}

function ScrollVelocityBanner() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#0a0a0a] py-4">
      <ScrollVelocityContainer>
        <ScrollVelocityRow baseVelocity={20} direction={1}>
          <span className="mx-8 text-sm font-bold tracking-widest text-white/20 uppercase">
            Document Management
          </span>
          <span className="mx-8 text-sm font-bold tracking-widest text-white/20 uppercase">
            Template Library
          </span>
          <span className="mx-8 text-sm font-bold tracking-widest text-white/20 uppercase">
            Resume Builder
          </span>
          <span className="mx-8 text-sm font-bold tracking-widest text-white/20 uppercase">
            Team Collaboration
          </span>
          <span className="mx-8 text-sm font-bold tracking-widest text-white/20 uppercase">
            Smart Reports
          </span>
          <span className="mx-8 text-sm font-bold tracking-widest text-white/20 uppercase">
            Notepad Editor
          </span>
        </ScrollVelocityRow>
      </ScrollVelocityContainer>
    </section>
  )
}

export function Landing() {
  return (
    <div className="flex min-h-svh flex-col bg-[#0a0a0a]">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <ScrollVelocityBanner />
        <PartnerLogos />
        <AppShowcase />
        <SpeedSection />
        <MadeForSection />
        <FeatureCards />
        <PlatformSection />
        <Testimonials />
        <StatsSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
