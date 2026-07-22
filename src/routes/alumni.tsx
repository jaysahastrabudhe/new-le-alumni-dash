import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { animate, stagger } from 'animejs'
import { Building2, Briefcase, GraduationCap, Sparkles, MapPin, ArrowRight, Search, UsersRound } from 'lucide-react'
import {
  ALUMNI,
  BATCH_YEARS,
  CATEGORY_LABELS,
  type AlumniCategory,
  type BatchYear,
  type ShowcaseAlumni,
} from '@/data/alumni-showcase'

export const Route = createFileRoute('/alumni')({
  component: PublicAlumniPage,
})

const CATEGORY_ICONS: Record<AlumniCategory, React.ElementType> = {
  founder: Building2,
  placed: Briefcase,
  higher_studies: GraduationCap,
}

const CATEGORY_CHIP_STYLE: Record<AlumniCategory, string> = {
  founder: 'border-accent/30 text-accent bg-accent/10',
  placed: 'border-primary/30 text-primary bg-primary/10',
  higher_studies: 'border-violet-400/30 text-violet-400 bg-violet-400/10',
}

const ACTIVE_FILTER_STYLE: Record<AlumniCategory | 'all', string> = {
  all: 'bg-accent/20 text-accent border-accent/40',
  founder: 'bg-accent/20 text-accent border-accent/40',
  placed: 'bg-primary/20 text-primary border-primary/40',
  higher_studies: 'bg-violet-400/20 text-violet-400 border-violet-400/40',
}

function avatarGradient(hue: string) {
  return `linear-gradient(135deg, oklch(0.35 0.18 ${hue}) 0%, oklch(0.20 0.12 ${hue}) 100%)`
}

function AlumniCard({ alumni }: { alumni: ShowcaseAlumni }) {
  const { name, bio, company, role, category, location, avatarHue, avatarUrl } = alumni
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const CategoryIcon = CATEGORY_ICONS[category]

  return (
    <div
      className="alumni-card group relative rounded-[1.4rem] p-5 flex flex-col gap-4 overflow-hidden le-surface"
      style={{
        background: 'linear-gradient(145deg, oklch(0.155 0.035 275), oklch(0.125 0.03 275))',
        border: '1px solid oklch(1 0 0 / 0.08)',
        transition: 'transform 200ms ease-out, border-color 200ms ease-out, box-shadow 200ms ease-out',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'oklch(0.77 0.14 188 / 0.40)'
        e.currentTarget.style.boxShadow = '0 8px 32px oklch(0 0 0 / 0.40)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderColor = 'oklch(1 0 0 / 0.08)'
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full pointer-events-none origin-center scale-y-0 group-hover:scale-y-100 transition-transform duration-200 ease-out"
        style={{ background: 'oklch(0.77 0.14 188)' }}
      />

      {/* Header: avatar + identity block */}
      <div className="flex items-start gap-3.5">
        <div
          className="h-[72px] w-[72px] rounded-2xl shrink-0 overflow-hidden ring-1 ring-white/10 shadow-lg"
          style={{ background: avatarGradient(avatarHue) }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center font-display font-extrabold text-white/90 text-xl">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <p className="font-display font-extrabold text-[15px] text-foreground leading-tight">{name}</p>
          <p className="text-[11px] font-semibold mt-1 text-accent leading-tight truncate">{company}</p>
          {role && <p className="text-[10px] text-muted-foreground/55 mt-0.5 truncate">{role}</p>}
        </div>

        <CategoryIcon
          className={`h-3.5 w-3.5 shrink-0 mt-1.5 ${
            category === 'founder'
              ? 'text-accent/50'
              : category === 'placed'
              ? 'text-primary/50'
              : 'text-violet-400/50'
          }`}
        />
      </div>

      {/* Bio */}
      <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-3 flex-1">{bio}</p>

      {/* Footer: location + category chip */}
      <div className="flex items-center justify-between gap-2">
        {location ? (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/35">
            <MapPin className="h-2.5 w-2.5" />
            {location}
          </span>
        ) : <span />}
        <span
          className={`text-[9px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full border ${CATEGORY_CHIP_STYLE[category]}`}
        >
          {CATEGORY_LABELS[category]}
        </span>
      </div>
    </div>
  )
}

function Batch2026Placeholder() {
  const orb1 = useRef<HTMLDivElement>(null)
  const orb2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (orb1.current) {
      animate(orb1.current, { translateY: [-8, 8], duration: 3000, ease: 'inOutSine', loop: true, alternate: true })
    }
    if (orb2.current) {
      animate(orb2.current, { translateY: [10, -10], translateX: [-5, 5], duration: 4000, ease: 'inOutSine', loop: true, alternate: true })
    }
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center py-28 text-center overflow-hidden">
      <div ref={orb1} className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, oklch(0.77 0.14 188 / 0.12) 0%, transparent 70%)' }} />
      <div ref={orb2} className="absolute bottom-4 left-1/3 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, oklch(0.58 0.22 257 / 0.10) 0%, transparent 70%)' }} />
      <div className="relative w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'oklch(1 0 0 / 0.04)', backdropFilter: 'blur(12px)', border: '1px solid oklch(1 0 0 / 0.10)', boxShadow: '0 0 40px oklch(0.77 0.14 188 / 0.18)' }}>
        <Sparkles className="h-8 w-8 text-accent" />
      </div>
      <h2 className="font-display font-extrabold text-3xl text-foreground">Batch of 2026</h2>
      <p className="text-muted-foreground text-sm mt-3 max-w-sm leading-relaxed">
        The next cohort is still writing their stories. This space is reserved for them — watch it come alive when they graduate.
      </p>
      <div className="mt-6 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase">Coming Soon · 2026</p>
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
      </div>
    </div>
  )
}

const ALL_CATEGORIES: AlumniCategory[] = ['founder', 'placed', 'higher_studies']

function PublicAlumniPage() {
  const [activeBatch, setActiveBatch] = useState<BatchYear>(2023)
  const [activeCategory, setActiveCategory] = useState<AlumniCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const gridRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  const normalizedSearch = search.trim().toLowerCase()
  const filtered = ALUMNI.filter((alumni) => {
    const matchesBatch = alumni.batchYear === activeBatch
    const matchesCategory = activeCategory === 'all' || alumni.category === activeCategory
    const matchesSearch = !normalizedSearch || [alumni.name, alumni.company, alumni.role, alumni.location]
      .some((value) => value?.toLowerCase().includes(normalizedSearch))
    return matchesBatch && matchesCategory && matchesSearch
  })

  const animateCardsIn = useCallback(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll<HTMLElement>('.alumni-card')
    if (!cards.length) return
    animate(Array.from(cards), { opacity: [0, 1], translateY: [28, 0], scale: [0.95, 1], delay: stagger(55), duration: 480, ease: 'outExpo' })
  }, [])

  useEffect(() => { animateCardsIn() }, [activeBatch, activeCategory, animateCardsIn])

  useEffect(() => {
    if (!headerRef.current) return
    animate(Array.from(headerRef.current.children) as HTMLElement[], { opacity: [0, 1], translateY: [16, 0], delay: stagger(80), duration: 500, ease: 'outExpo' })
  }, [])

  function handleBatchChange(year: BatchYear) {
    if (year === activeBatch) return
    setActiveBatch(year)
    setActiveCategory('all')
    setSearch('')
  }

  const batchCounts = BATCH_YEARS.map((y) => ({ year: y, count: ALUMNI.filter((a) => a.batchYear === y).length }))

  return (
    <div className="dark min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Atmosphere */}
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% -5%, oklch(0.47 0.22 257 / 0.15) 0%, transparent 65%), radial-gradient(ellipse 40% 35% at 85% 85%, oklch(0.77 0.14 188 / 0.08) 0%, transparent 60%)',
        }}
      />
      <div className="le-page-grid pointer-events-none fixed inset-0" aria-hidden="true" />

      {/* Nav */}
      <header className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-5">
        <div className="le-glass flex items-center justify-between px-4 sm:px-5 py-3 rounded-2xl">
        <Link to="/" className="flex items-center gap-2.5 le-focus-ring rounded-xl">
          <div className="h-9 w-9 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-extrabold text-accent font-display tracking-tight">LE</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold font-display text-foreground leading-none">Let's Enterprise</p>
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.18em] mt-0.5">Alumni Network</p>
          </div>
        </Link>
        <Link
          to="/login"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-slate-950 hover:bg-accent transition-all duration-150 active:scale-[0.97] le-focus-ring"
        >
          Login to Network
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-14 lg:py-20 space-y-8">
        {/* Header */}
        <div ref={headerRef} className="grid lg:grid-cols-[1fr_auto] gap-8 items-end">
          <div>
            <p className="le-kicker">The people behind the progress</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.055em] leading-[0.96] mt-5">
              Know your <span className="le-gradient-text">alumni.</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl leading-relaxed mt-5">
              Founders, operators, consultants, and global scholars. Explore the stories still unfolding beyond the LE classroom.
            </p>
          </div>
          <div className="le-glass rounded-2xl p-4 flex items-center gap-4 min-w-[210px]">
            <div className="h-11 w-11 rounded-xl bg-accent/10 border border-accent/15 grid place-items-center">
              <UsersRound className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none">{ALUMNI.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] mt-1.5">Stories featured</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1 p-1.5 rounded-2xl w-full lg:w-fit overflow-x-auto le-glass">
          {batchCounts.map(({ year, count }) => (
            <button
              key={year}
              onClick={() => handleBatchChange(year as BatchYear)}
              className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0 le-focus-ring ${
                activeBatch === year ? 'bg-white text-slate-950 shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              }`}
            >
              {year}
              {count > 0 && year !== 2026 && (
                <span className={`ml-1.5 text-[9px] font-bold ${activeBatch === year ? 'text-accent/70' : 'text-muted-foreground/40'}`}>{count}</span>
              )}
              {year === 2026 && <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:w-[300px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search this cohort"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm placeholder:text-muted-foreground/45 focus:outline-none focus:border-accent/45 focus:ring-2 focus:ring-accent/10 transition-all"
          />
        </label>
        </div>

        {activeBatch === 2026 ? (
          <Batch2026Placeholder />
        ) : (
          <>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`rounded-full px-4 py-2 text-xs font-semibold border transition-colors le-focus-ring ${
                  activeCategory === 'all' ? ACTIVE_FILTER_STYLE['all'] : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                All
              </button>
              {ALL_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold border transition-colors flex items-center gap-1.5 le-focus-ring ${
                      activeCategory === cat ? ACTIVE_FILTER_STYLE[cat] : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {CATEGORY_LABELS[cat]}
                  </button>
                )
              })}
            </div>

            <p className="text-[10px] text-muted-foreground/55 uppercase tracking-[0.14em] font-semibold">
              Showing {filtered.length} {filtered.length === 1 ? 'alumnus' : 'alumni'} · Batch {activeBatch}
            </p>

            <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-live="polite">
              {filtered.map((a) => (
                <AlumniCard key={a.id} alumni={a} />
              ))}
              {filtered.length === 0 && (
                <p className="col-span-3 text-center text-muted-foreground/50 py-16 text-sm">
                  No alumni match these filters for Batch {activeBatch}.
                </p>
              )}
            </div>
          </>
        )}

        {/* Login CTA strip */}
        <div
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-5 rounded-[1.5rem] px-6 sm:px-8 py-6 le-glass"
          style={{
            background: 'linear-gradient(110deg, oklch(0.63 0.20 255 / 0.14), oklch(0.79 0.14 188 / 0.06))',
          }}
        >
          <div>
            <p className="font-display font-bold text-foreground text-sm">Part of the LE community?</p>
            <p className="text-muted-foreground text-xs mt-0.5">Access the full network — jobs, events, mentorship, and more.</p>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shrink-0 transition-all duration-150 active:scale-[0.97]"
            style={{
              background: 'oklch(0.77 0.14 188 / 0.15)',
              border: '1px solid oklch(0.77 0.14 188 / 0.30)',
              color: 'oklch(0.77 0.14 188)',
            }}
          >
            Login to Network
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
