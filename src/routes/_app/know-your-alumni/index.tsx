import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { animate, stagger } from 'animejs'
import { Building2, Briefcase, GraduationCap, Sparkles, MapPin } from 'lucide-react'
import {
  ALUMNI,
  BATCH_YEARS,
  CATEGORY_LABELS,
  type AlumniCategory,
  type BatchYear,
  type ShowcaseAlumni,
} from '@/data/alumni-showcase'

export const Route = createFileRoute('/_app/know-your-alumni/')({
  component: KnowYourAlumniPage,
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
  return `linear-gradient(135deg, oklch(0.25 0.18 ${hue}) 0%, oklch(0.18 0.10 ${hue}) 100%)`
}

function AlumniCard({ alumni }: { alumni: ShowcaseAlumni }) {
  const { name, bio, company, role, category, location, avatarHue } = alumni
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const CategoryIcon = CATEGORY_ICONS[category]

  return (
    <div
      className="alumni-card group relative rounded-2xl p-5 flex flex-col gap-3 opacity-0 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        background: 'oklch(1 0 0 / 0.035)',
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: '1px solid oklch(1 0 0 / 0.09)',
        boxShadow:
          '0 4px 24px oklch(0 0 0 / 0.30), inset 0 1px 0 oklch(1 0 0 / 0.09)',
      }}
    >
      {/* inner top-left ambient glow based on avatar hue */}
      <div
        className="absolute -top-8 -left-8 w-32 h-32 rounded-full pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(circle, oklch(0.60 0.16 ${avatarHue} / 0.35) 0%, transparent 65%)`,
        }}
      />

      {/* Header */}
      <div className="flex items-start gap-3 relative">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 font-display font-extrabold text-white/90 text-sm shadow-lg"
          style={{ background: avatarGradient(avatarHue) }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-extrabold text-sm text-foreground leading-tight">
            {name}
          </p>
          <p className="text-[10px] font-semibold mt-0.5 text-accent truncate">{company}</p>
          {role && (
            <p className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{role}</p>
          )}
        </div>
        <CategoryIcon
          className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
            category === 'founder'
              ? 'text-accent/60'
              : category === 'placed'
              ? 'text-primary/60'
              : 'text-violet-400/60'
          }`}
        />
      </div>

      {/* Bio */}
      <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-4 flex-1 relative">
        {bio}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 relative">
        {location && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
            <MapPin className="h-2.5 w-2.5" />
            {location}
          </span>
        )}
        <span
          className={`ml-auto text-[9px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full border ${CATEGORY_CHIP_STYLE[category]}`}
        >
          {CATEGORY_LABELS[category]}
        </span>
      </div>

      {/* Hover border glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px oklch(0.77 0.14 188 / 0.25), 0 0 28px oklch(0.77 0.14 188 / 0.08)`,
        }}
      />
    </div>
  )
}

function Batch2026Placeholder() {
  const orb1 = useRef<HTMLDivElement>(null)
  const orb2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (orb1.current) {
      animate(orb1.current, {
        translateY: [-8, 8],
        duration: 3000,
        ease: 'inOutSine',
        loop: true,
        alternate: true,
      })
    }
    if (orb2.current) {
      animate(orb2.current, {
        translateY: [10, -10],
        translateX: [-5, 5],
        duration: 4000,
        ease: 'inOutSine',
        loop: true,
        alternate: true,
      })
    }
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center py-28 text-center overflow-hidden">
      {/* ambient orbs */}
      <div
        ref={orb1}
        className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, oklch(0.77 0.14 188 / 0.12) 0%, transparent 70%)',
        }}
      />
      <div
        ref={orb2}
        className="absolute bottom-4 left-1/3 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, oklch(0.58 0.22 257 / 0.10) 0%, transparent 70%)',
        }}
      />

      <div
        className="relative w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{
          background: 'oklch(1 0 0 / 0.04)',
          backdropFilter: 'blur(12px)',
          border: '1px solid oklch(1 0 0 / 0.10)',
          boxShadow: '0 0 40px oklch(0.77 0.14 188 / 0.18)',
        }}
      >
        <Sparkles className="h-8 w-8 text-accent" />
      </div>

      <h2 className="font-display font-extrabold text-3xl text-foreground">Batch of 2026</h2>
      <p className="text-muted-foreground text-sm mt-3 max-w-sm leading-relaxed">
        The next cohort is still writing their stories. This space is reserved for them — watch
        it come alive when they graduate.
      </p>
      <div className="mt-6 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
        <p className="text-accent text-[10px] font-bold tracking-[0.2em] uppercase">
          Coming Soon · 2026
        </p>
        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
      </div>
    </div>
  )
}

const ALL_CATEGORIES: AlumniCategory[] = ['founder', 'placed', 'higher_studies']

function KnowYourAlumniPage() {
  const [activeBatch, setActiveBatch] = useState<BatchYear>(2023)
  const [activeCategory, setActiveCategory] = useState<AlumniCategory | 'all'>('all')
  const gridRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  const filtered = ALUMNI.filter(
    (a) =>
      a.batchYear === activeBatch &&
      (activeCategory === 'all' || a.category === activeCategory),
  )

  const animateCardsIn = useCallback(() => {
    if (!gridRef.current) return
    const cards = gridRef.current.querySelectorAll<HTMLElement>('.alumni-card')
    if (!cards.length) return
    animate(Array.from(cards), {
      opacity: [0, 1],
      translateY: [28, 0],
      scale: [0.95, 1],
      delay: stagger(55),
      duration: 480,
      ease: 'outExpo',
    })
  }, [])

  // Animate on batch or category change
  useEffect(() => {
    animateCardsIn()
  }, [activeBatch, activeCategory, animateCardsIn])

  // Animate page header on mount
  useEffect(() => {
    if (!headerRef.current) return
    animate(Array.from(headerRef.current.children) as HTMLElement[], {
      opacity: [0, 1],
      translateY: [16, 0],
      delay: stagger(80),
      duration: 500,
      ease: 'outExpo',
    })
  }, [])

  function handleBatchChange(year: BatchYear) {
    if (year === activeBatch) return
    setActiveBatch(year)
    setActiveCategory('all')
  }

  const batchCounts = BATCH_YEARS.map((y) => ({
    year: y,
    count: ALUMNI.filter((a) => a.batchYear === y).length,
  }))

  return (
    <div className="space-y-7">
      {/* Header */}
      <div ref={headerRef} className="space-y-1">
        <p className="text-[10px] font-semibold text-accent tracking-[0.22em] uppercase opacity-0">
          Let's Enterprise · Pune
        </p>
        <h1 className="le-headline font-display text-4xl font-extrabold leading-none opacity-0">
          Know Your <span>Alumni</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-md leading-relaxed pt-1 opacity-0">
          From founders to consultants to global scholars — meet the people who made it happen.
        </p>
      </div>

      {/* Batch year tabs */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl w-fit"
        style={{
          background: 'oklch(1 0 0 / 0.04)',
          backdropFilter: 'blur(8px)',
          border: '1px solid oklch(1 0 0 / 0.08)',
        }}
      >
        {batchCounts.map(({ year, count }) => (
          <button
            key={year}
            onClick={() => handleBatchChange(year as BatchYear)}
            className={`relative px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeBatch === year
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {year}
            {count > 0 && year !== 2026 && (
              <span
                className={`ml-1.5 text-[9px] font-bold ${
                  activeBatch === year ? 'text-accent/70' : 'text-muted-foreground/40'
                }`}
              >
                {count}
              </span>
            )}
            {year === 2026 && (
              <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {activeBatch === 2026 ? (
        <Batch2026Placeholder />
      ) : (
        <>
          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`rounded-full px-3.5 py-1 text-xs font-medium border transition-colors ${
                activeCategory === 'all'
                  ? ACTIVE_FILTER_STYLE['all']
                  : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
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
                  className={`rounded-full px-3.5 py-1 text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? ACTIVE_FILTER_STYLE[cat]
                      : 'border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {CATEGORY_LABELS[cat]}
                </button>
              )
            })}
          </div>

          {/* Count */}
          <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.12em] font-semibold -mb-2">
            {filtered.length} {filtered.length === 1 ? 'alumnus' : 'alumni'}
          </p>

          {/* Grid */}
          <div
            ref={gridRef}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((a) => (
              <AlumniCard key={a.id} alumni={a} />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-3 text-center text-muted-foreground/50 py-16 text-sm">
                No alumni in this category for Batch {activeBatch}.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
