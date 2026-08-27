import { Link } from "react-router-dom"

import { DashboardMockup } from "@/components/marketing/device-mockups"
import { NetworkField } from "@/components/marketing/network-field"
import { DriftWall } from "@/components/marketing/drift-wall"
import { BlurFade } from "@/components/ui/blur-fade"
import { Button } from "@/components/ui/button"
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity"
import { APP, ROUTES, icons, messages } from "@/constants"
import { landingFeatures, landingStats, testimonialQuotes } from "@/data/landing"
import { cn } from "@/lib/utils"

function Pill({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white/55 backdrop-blur-xl",
        className
      )}
    >
      {children}
    </span>
  )
}

function DataLabel({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.22em] text-white/40",
        className
      )}
    >
      {children}
    </span>
  )
}

function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-black/55 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-5 sm:px-8">
        <Link to={ROUTES.landing} className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-[rgb(150_235_205)] shadow-[0_0_12px_rgba(150,235,205,0.7)]" />
          <span className="font-heading text-lg font-light tracking-tight text-white">
            {APP.name}
          </span>
        </Link>

        <nav className="ml-10 hidden items-center gap-1 md:flex">
          {[
            { label: messages.landing.header.nav.features, href: "#features" },
            { label: messages.landing.header.nav.solutions, href: "#fabric" },
            { label: messages.landing.header.nav.resources, href: "#testimonials" },
            { label: messages.landing.header.nav.pricing, href: "#cta" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden rounded-full text-white/70 hover:bg-white/[0.06] hover:text-white sm:inline-flex"
          >
            <Link to={ROUTES.login}>
              {messages.landing.header.nav.signIn}
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-white px-5 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-transform hover:bg-white/90 hover:shadow-[0_0_28px_rgba(150,235,205,0.25)]"
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
    <section className="relative overflow-hidden bg-black pb-20 pt-36 sm:pt-44">
      <NetworkField />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent"
      />

      <div className="relative mx-auto w-full max-w-5xl px-5 text-center sm:px-8">
        <BlurFade delay={0.05} inView>
          <Pill>
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[rgb(150_235_205)] opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[rgb(150_235_205)]" />
            </span>
            {messages.landing.hero.eyebrow}
          </Pill>
        </BlurFade>

        <BlurFade delay={0.12} inView>
          <h1 className="mx-auto mt-8 max-w-4xl font-heading text-[clamp(2.75rem,9vw,6.5rem)] font-light leading-[0.95] tracking-[-0.03em] text-white">
            {messages.landing.hero.titleLine1}{" "}
            <span className="bg-gradient-to-r from-white via-white to-[rgb(150_235_205)] bg-clip-text text-transparent">
              {messages.landing.hero.titleLine2}
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <p className="mx-auto mt-7 max-w-xl text-base font-light leading-relaxed text-white/50 sm:text-lg">
            {messages.landing.hero.subtitle}
          </p>
        </BlurFade>

        <BlurFade delay={0.28} inView>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-8 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-transform hover:bg-white/90 hover:shadow-[0_0_32px_rgba(150,235,205,0.28)]"
            >
              <Link to={ROUTES.login} className="flex items-center gap-2">
                <icons.download className="size-4" />
                {messages.landing.hero.primaryCta}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-white/15 bg-white/[0.03] px-8 text-white backdrop-blur-xl transition-colors hover:border-white/30 hover:bg-white/[0.07]"
            >
              <a href="#fabric" className="flex items-center gap-2">
                <icons.play className="size-4" />
                {messages.landing.hero.secondaryCta}
              </a>
            </Button>
          </div>
        </BlurFade>

        <BlurFade delay={0.36} inView>
          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {messages.landing.telemetry.map((t) => (
              <div key={t.label} className="flex items-center gap-2.5">
                <span className="size-1 rounded-full bg-[rgb(150_235_205)]/70" />
                <DataLabel>{t.label}</DataLabel>
                <span className="font-mono text-xs font-light text-white/80">
                  {t.value}
                </span>
              </div>
            ))}
          </div>
        </BlurFade>
      </div>

      <div className="relative mx-auto mt-20 w-full max-w-4xl px-5 sm:px-8">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/3 size-[80%] -translate-x-1/2 rounded-full bg-[rgb(150_235_205)]/10 blur-[100px]"
        />
        <BlurFade delay={0.2} inView>
          <div className="relative rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-2 backdrop-blur-sm">
            <DashboardMockup className="min-h-[360px] sm:min-h-[460px]" />
          </div>
        </BlurFade>
      </div>
    </section>
  )
}

function VelocityBanner() {
  const words = [
    "Document Management",
    "Encrypted Mesh",
    "Review Workflows",
    "Audit Trail",
    "Template Library",
    "Team Console",
  ]
  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-black py-5">
      <ScrollVelocityContainer>
        <ScrollVelocityRow baseVelocity={18} direction={1}>
          {words.map((w) => (
            <span
              key={w}
              className="mx-8 font-heading text-sm font-light uppercase tracking-[0.3em] text-white/20"
            >
              {w}
            </span>
          ))}
        </ScrollVelocityRow>
      </ScrollVelocityContainer>
    </section>
  )
}

function TelemetryStrip() {
  return (
    <section className="border-b border-white/[0.06] bg-black py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px px-5 sm:px-8 md:grid-cols-4">
        {landingStats.map((stat, i) => (
          <BlurFade key={stat.label} delay={0.05 * i} inView>
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-center md:border-r md:border-white/[0.06] md:last:border-r-0">
              <DataLabel>{stat.label}</DataLabel>
              <p className="font-heading text-4xl font-light tracking-tight text-white/90">
                {stat.value}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="relative bg-black py-28">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 size-[40rem] -translate-x-1/2 rounded-full bg-[rgb(150_235_205)]/5 blur-[140px]"
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <BlurFade delay={0.05} inView>
            <Pill>{messages.landing.features.title}</Pill>
          </BlurFade>
          <BlurFade delay={0.12} inView>
            <p className="mt-5 text-base font-light text-white/45">
              {messages.landing.features.subtitle}
            </p>
          </BlurFade>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {landingFeatures.map((feature, i) => {
            const Icon = icons[feature.icon]
            return (
              <BlurFade key={feature.title} delay={0.05 * i} inView>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <Icon className="size-5 text-[rgb(170_240_215)]" />
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-white/25">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-6 font-heading text-xl font-light tracking-tight text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-white/45">
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

function FabricSection() {
  return (
    <section id="fabric" className="relative overflow-hidden border-y border-white/[0.06] bg-black py-28">
      <NetworkField glow={false} className="opacity-70" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <BlurFade delay={0.05} inView>
            <Pill>{messages.landing.network.eyebrow}</Pill>
          </BlurFade>
          <BlurFade delay={0.12} inView>
            <h2 className="mt-6 font-heading text-[clamp(2rem,5vw,3.5rem)] font-light leading-[1.02] tracking-[-0.03em] text-white">
              {messages.landing.network.title}
            </h2>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <p className="mt-5 max-w-md text-base font-light leading-relaxed text-white/50">
              {messages.landing.network.subtitle}
            </p>
          </BlurFade>
          <BlurFade delay={0.28} inView>
            <div className="mt-10 flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <icons.layers className="mt-0.5 size-5 shrink-0 text-[rgb(170_240_215)]" />
              <div>
                <p className="font-heading text-base font-light text-white">
                  {messages.landing.madeFor.oneTool}
                </p>
                <p className="mt-1.5 text-sm font-light leading-relaxed text-white/45">
                  {messages.landing.madeFor.oneToolDesc}
                </p>
              </div>
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={0.2} inView>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8">
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 size-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(150_235_205)]/10 blur-[90px]"
            />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <DataLabel>Mesh status</DataLabel>
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[rgb(170_240_215)]">
                  <span className="size-1.5 rounded-full bg-[rgb(150_235_205)]" />
                  Operational
                </span>
              </div>
              <div className="space-y-3">
                {messages.landing.telemetry.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center justify-between border-b border-white/[0.06] pb-3"
                  >
                    <DataLabel>{t.label}</DataLabel>
                    <span className="font-mono text-sm font-light text-white/85">
                      {t.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <DataLabel>Protocol</DataLabel>
                <span className="font-mono text-sm font-light text-white/85">
                  dossier://v2.4
                </span>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}

function SpeedSection() {
  return (
    <section className="bg-black py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <BlurFade delay={0.05} inView>
            <h2 className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-light tracking-[-0.03em] text-white">
              {messages.landing.speed.title}
            </h2>
          </BlurFade>
          <BlurFade delay={0.12} inView>
            <p className="mt-4 text-base font-light text-white/50">
              {messages.landing.speed.subtitle}
            </p>
          </BlurFade>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <BlurFade delay={0.1} inView>
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-8">
              <DataLabel>{messages.landing.speed.typing}</DataLabel>
              <p className="mt-3 font-heading text-5xl font-light tracking-tight text-white/70">
                {messages.landing.speed.typingSpeed}
              </p>
              <p className="mt-2 text-sm font-light text-white/40">
                {messages.landing.speed.typingDesc}
              </p>
              <div className="mt-6 h-px w-full bg-white/10">
                <div className="h-px w-[30%] bg-white/30" />
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <div className="rounded-3xl border border-[rgb(150_235_205)]/20 bg-[rgb(150_235_205)]/[0.04] p-8">
              <DataLabel className="text-[rgb(160_235_205)]/80">
                {messages.landing.speed.dossier}
              </DataLabel>
              <p className="mt-3 font-heading text-5xl font-light tracking-tight text-white">
                {messages.landing.speed.dossierSpeed}
              </p>
              <p className="mt-2 text-sm font-light text-white/50">
                {messages.landing.speed.dossierDesc}
              </p>
              <div className="mt-6 h-px w-full bg-[rgb(150_235_205)]/15">
                <div className="h-px w-full bg-[rgb(150_235_205)]/70" />
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}

function PlatformSection() {
  return (
    <section className="border-t border-white/[0.06] bg-black py-28">
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-8">
        <BlurFade delay={0.05} inView>
          <h2 className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-light tracking-[-0.03em] text-white">
            {messages.landing.platform.title}
          </h2>
        </BlurFade>
        <BlurFade delay={0.12} inView>
          <p className="mx-auto mt-4 max-w-xl text-base font-light text-white/50">
            {messages.landing.platform.subtitle}
          </p>
        </BlurFade>
        <BlurFade delay={0.2} inView>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {messages.landing.logos.partners.map((name) => (
              <span
                key={name}
                className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-light text-white/60 backdrop-blur-xl"
              >
                {name}
              </span>
            ))}
          </div>
        </BlurFade>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="testimonials" className="relative bg-black py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <BlurFade delay={0.05} inView>
            <h2 className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-light tracking-[-0.03em] text-white">
              {messages.landing.testimonials.title}
            </h2>
          </BlurFade>
          <BlurFade delay={0.12} inView>
            <p className="mt-4 text-base font-light text-white/50">
              {messages.landing.testimonials.subtitle}
            </p>
          </BlurFade>
        </div>
      </div>

      <div className="mt-14">
        <DriftWall
          items={testimonialQuotes.map((q) => ({ ...q, quote: q.text }))}
          columns={3}
          tileWidth={300}
          tileHeight={280}
          gap={20}
          speed={22}
          direction="up"
        />
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section id="cta" className="relative overflow-hidden bg-black py-32">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 size-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(150_235_205)]/10 blur-[140px]"
      />
      <div className="relative mx-auto max-w-2xl px-5 text-center sm:px-8">
        <BlurFade delay={0.05} inView>
          <h2 className="font-heading text-[clamp(2.25rem,6vw,4.5rem)] font-light leading-[1.02] tracking-[-0.03em] text-white">
            {messages.landing.cta.title}
          </h2>
        </BlurFade>
        <BlurFade delay={0.12} inView>
          <p className="mx-auto mt-5 max-w-md text-base font-light text-white/50">
            {messages.landing.cta.subtitle}
          </p>
        </BlurFade>
        <BlurFade delay={0.2} inView>
          <form
            className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder={messages.landing.cta.placeholder}
              className="h-12 w-full rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-light text-white outline-none placeholder:text-white/30 backdrop-blur-xl transition-colors focus:border-[rgb(150_235_205)]/40 focus:ring-2 focus:ring-[rgb(150_235_205)]/10"
            />
            <Button
              asChild
              size="lg"
              className="rounded-full bg-white px-8 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-transform hover:bg-white/90 hover:shadow-[0_0_32px_rgba(150,235,205,0.28)]"
            >
              <Link to={ROUTES.login}>
                {messages.landing.cta.button}
              </Link>
            </Button>
          </form>
        </BlurFade>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-black">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <span className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-[rgb(150_235_205)] shadow-[0_0_12px_rgba(150,235,205,0.7)]" />
              <span className="font-heading text-xl font-light tracking-tight text-white">
                {APP.name}
              </span>
            </span>
            <p className="max-w-xs text-sm font-light leading-relaxed text-white/40">
              {messages.landing.footer.tagline}
            </p>
          </div>

          {[
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
          ].map((column) => (
            <div key={column.title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm font-light text-white/45 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs font-light text-white/35">
            {messages.landing.footer.copyright(new Date().getFullYear())}
          </p>
          <div className="flex items-center gap-4 text-white/35">
            {messages.landing.footer.legalLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-[11px] font-light tracking-wide transition-colors hover:text-white"
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-14 overflow-hidden text-center">
          <span className="font-heading text-[18vw] font-extralight italic leading-none tracking-tighter text-white/[0.025]">
            {APP.name}
          </span>
        </div>
      </div>
    </footer>
  )
}

export function Landing() {
  return (
    <div className="flex min-h-svh flex-col bg-black text-white">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <VelocityBanner />
        <TelemetryStrip />
        <Features />
        <FabricSection />
        <SpeedSection />
        <PlatformSection />
        <Testimonials />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
