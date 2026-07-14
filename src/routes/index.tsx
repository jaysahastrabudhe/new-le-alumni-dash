import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { ArrowRight, Users, Briefcase, GraduationCap, Building2 } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: WelcomePage,
})

const STATS = [
  { icon: Users, value: '120+', label: 'Alumni' },
  { icon: Building2, value: '60+', label: 'Companies' },
  { icon: Briefcase, value: '40+', label: 'Founders' },
  { icon: GraduationCap, value: '4', label: 'Cohorts' },
]

function WelcomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (heroRef.current) {
      animate(Array.from(heroRef.current.children) as HTMLElement[], {
        opacity: [0, 1],
        translateY: [24, 0],
        delay: stagger(90),
        duration: 600,
        ease: 'outExpo',
      })
    }
    if (statsRef.current) {
      animate(Array.from(statsRef.current.children) as HTMLElement[], {
        opacity: [0, 1],
        translateY: [12, 0],
        delay: stagger(60, { start: 400 }),
        duration: 500,
        ease: 'outExpo',
      })
    }
  }, [])

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col overflow-hidden relative">
      {/* Atmosphere */}
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.47 0.22 257 / 0.18) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 80% 80%, oklch(0.77 0.14 188 / 0.10) 0%, transparent 60%)',
        }}
      />

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 pt-6">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-extrabold text-accent font-display tracking-tight">LE</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold font-display text-foreground leading-none">Let's Enterprise</p>
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.18em] mt-0.5">Alumni Network</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/alumni"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium hidden sm:block"
          >
            Meet Alumni
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-[0.97]"
            style={{
              background: 'oklch(0.47 0.22 257 / 0.15)',
              border: '1px solid oklch(0.47 0.22 257 / 0.30)',
              color: 'oklch(0.77 0.18 240)',
            }}
          >
            Login
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32">
        <div ref={heroRef} className="max-w-2xl mx-auto space-y-6">
          <p className="text-[10px] font-semibold text-accent tracking-[0.28em] uppercase opacity-0">
            Let's Enterprise · Pune
          </p>

          <h1
            className="font-display font-extrabold leading-[1.05] opacity-0"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)' }}
          >
            Meet the people{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, oklch(0.77 0.14 188) 0%, oklch(0.60 0.18 220) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              who made it.
            </span>
          </h1>

          <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-lg mx-auto opacity-0">
            The Let's Enterprise alumni network — founders, engineers, consultants, and scholars who started here in Pune and built remarkable things.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap opacity-0">
            <Link
              to="/alumni"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
              style={{
                background: 'oklch(0.77 0.14 188 / 0.15)',
                border: '1px solid oklch(0.77 0.14 188 / 0.30)',
                color: 'oklch(0.77 0.14 188)',
              }}
            >
              Browse Alumni
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              Login to your account
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px max-w-2xl w-full mx-auto"
          style={{
            background: 'oklch(1 0 0 / 0.06)',
            border: '1px solid oklch(1 0 0 / 0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-1.5 py-6 px-4 opacity-0"
              style={{ background: 'oklch(1 0 0 / 0.025)' }}
            >
              <Icon className="h-4 w-4 text-accent/60 mb-0.5" />
              <p className="font-display font-extrabold text-2xl text-foreground leading-none">{value}</p>
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.14em]">{label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 pb-6 flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground/30 font-medium">
          © 2024 Let's Enterprise · Pune
        </p>
        <Link
          to="/login"
          className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors font-medium"
        >
          Member login →
        </Link>
      </footer>
    </div>
  )
}
