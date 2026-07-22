import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Building2,
  GraduationCap,
  Sparkles,
  Users,
} from 'lucide-react'
import { ALUMNI, ALUMNI_PORTRAITS } from '@/data/alumni-showcase'
import { BrandLogo } from '@/components/brand-logo'

export const Route = createFileRoute('/')({
  component: WelcomePage,
})

const STATS = [
  { icon: Users, value: '120+', label: 'Alumni' },
  { icon: Building2, value: '60+', label: 'Companies' },
  { icon: Briefcase, value: '40+', label: 'Founders' },
  { icon: GraduationCap, value: '4', label: 'Cohorts' },
]

const FEATURED = [ALUMNI[17], ALUMNI[0], ALUMNI[22]]

function Brand() {
  return (
    <Link to="/" className="le-focus-ring rounded-xl">
      <BrandLogo />
    </Link>
  )
}

function WelcomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (heroRef.current) {
      animate(Array.from(heroRef.current.children) as HTMLElement[], {
        opacity: [0, 1],
        translateY: [22, 0],
        delay: stagger(75),
        duration: 650,
        ease: 'outExpo',
      })
    }
    if (panelRef.current) {
      animate(panelRef.current, {
        opacity: [0, 1],
        translateX: [30, 0],
        rotate: [1.5, 0],
        duration: 800,
        delay: 180,
        ease: 'outExpo',
      })
    }
  }, [])

  return (
    <div className="dark min-h-screen bg-background text-foreground overflow-hidden relative">
      <div className="le-atmosphere" aria-hidden="true" />
      <div className="le-page-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <header className="relative z-20 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-3 lg:py-4">
        <div className="le-glass rounded-2xl px-4 sm:px-5 py-2.5 flex items-center justify-between">
          <Brand />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/alumni"
              className="hidden sm:inline-flex px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all le-focus-ring"
            >
              Explore alumni
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-slate-950 hover:bg-accent transition-all active:scale-[0.98] le-focus-ring"
            >
              Member login <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-9 pb-12 lg:min-h-[calc(100svh-88px)] lg:flex lg:flex-col lg:justify-center lg:py-5">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center">
          <div ref={heroRef} className="max-w-2xl">
            <div className="le-kicker">Built in Pune · Growing everywhere</div>
            <h1 className="mt-4 lg:mt-5 font-extrabold tracking-[-0.055em] leading-[0.94] text-[clamp(3.15rem,5.5vw,5.65rem)]">
              Where your
              <span className="block le-gradient-text">next chapter</span>
              finds its people.
            </h1>
            <p className="mt-5 lg:mt-6 text-base lg:text-[1.05rem] text-muted-foreground leading-relaxed max-w-xl">
              A lifelong network for the founders, builders, consultants, and scholars who began at Let's Enterprise.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/alumni"
                className="group inline-flex items-center gap-2.5 h-12 px-6 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-[0_12px_40px_oklch(0.79_0.14_188_/_0.20)] hover:-translate-y-0.5 hover:shadow-[0_16px_45px_oklch(0.79_0.14_188_/_0.28)] transition-all le-focus-ring"
              >
                Meet the community
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center h-12 px-5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors le-focus-ring"
              >
                Access member space
              </Link>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <div className="flex -space-x-2">
                {FEATURED.map((person) => (
                  <div
                    key={person.id}
                    className="h-9 w-9 overflow-hidden rounded-full border-2 border-background bg-muted"
                  >
                    <img src={ALUMNI_PORTRAITS[person.id]} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="h-8 w-px bg-border" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground font-bold">120+ members</span><br />building, hiring, and helping.
              </p>
            </div>
          </div>

          <div ref={panelRef} className="relative lg:pl-6">
            <div className="absolute -inset-12 bg-accent/[0.07] blur-3xl rounded-full pointer-events-none" />
            <div className="le-glass relative rounded-[2rem] p-3 sm:p-4">
              <div className="rounded-[1.45rem] border border-white/[0.07] bg-background/75 p-5 sm:p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4 lg:mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Community pulse</p>
                    <h2 className="text-lg font-extrabold mt-1">People making moves</h2>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-accent/10 border border-accent/20 grid place-items-center">
                    <Sparkles className="h-4 w-4 text-accent" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {FEATURED.map((person, index) => (
                    <div
                      key={person.id}
                      className="group rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 lg:p-3.5 flex items-center gap-4 hover:border-accent/25 hover:bg-white/[0.06] transition-all"
                    >
                      <div
                        className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted shadow-lg"
                      >
                        <img src={ALUMNI_PORTRAITS[person.id]} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate">{person.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{person.role ?? person.company}</p>
                      </div>
                      <span className="text-[9px] uppercase tracking-[0.14em] font-bold text-accent/80 px-2.5 py-1 rounded-full border border-accent/15 bg-accent/[0.07]">
                        {index === 0 ? 'Global' : person.category === 'founder' ? 'Founder' : 'Alumni'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3.5 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/[0.08] border border-primary/20 p-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-extrabold tracking-tight">4 cohorts.</p>
                    <p className="text-sm text-muted-foreground mt-1">One compounding network.</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-accent shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 lg:mt-6 grid grid-cols-2 lg:grid-cols-4 border-y border-white/[0.08]">
          {STATS.map(({ icon: Icon, value, label }, index) => (
            <div key={label} className={`py-5 lg:py-3.5 px-4 sm:px-6 ${index % 2 ? 'border-l border-white/[0.08]' : ''} ${index > 1 ? 'border-t lg:border-t-0 border-white/[0.08]' : ''} lg:border-l lg:first:border-l-0`}>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-accent/70" />
                <span className="text-[10px] uppercase tracking-[0.16em] font-semibold">{label}</span>
              </div>
              <p className="text-3xl lg:text-[2rem] font-extrabold tracking-tight mt-2">{value}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted-foreground/55">
        <p>© {new Date().getFullYear()} Let's Enterprise · Pune</p>
        <p className="uppercase tracking-[0.16em]">Built for the people who make it happen</p>
      </footer>
    </div>
  )
}
