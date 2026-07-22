import { Link, useRouterState } from '@tanstack/react-router'
import { useAuth } from '@/context/auth'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarDays,
  HandshakeIcon,
  UserCircle,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/components/brand-logo'
import { trpc } from '@/lib/trpc'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/directory', icon: Users, label: 'Directory', section: 'directory' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs', section: 'jobs' },
  { to: '/events', icon: CalendarDays, label: 'Events', section: 'events' },
  { to: '/mentorship', icon: HandshakeIcon, label: 'Mentorship', section: 'mentorship' },
  { to: '/profile', icon: UserCircle, label: 'My Profile' },
] as const

export default function AppSidebar() {
  const { pathname } = useRouterState({ select: (s) => s.location })
  const { user } = useAuth()
  const { data: sections } = trpc.settings.list.useQuery()
  const visibleItems = navItems.filter((item) => {
    if (!('section' in item) || user?.role === 'admin') return true
    return sections?.find((section) => section.key === item.section)?.isVisible ?? item.section !== 'jobs'
  })

  return (
    <aside className="hidden lg:flex flex-col w-[248px] min-h-screen bg-card/80 backdrop-blur-xl border-r border-white/[0.07] relative z-20">
      {/* Brand */}
      <div className="px-5 pt-5 pb-5 border-b border-white/[0.06]">
        <BrandLogo className="w-[170px]" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/45">Member space</p>
        {visibleItems.map(({ to, icon: Icon, label }) => {
          const isActive = pathname === to || pathname.startsWith(to + '/')
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 le-focus-ring',
                isActive
                  ? 'bg-white/[0.07] text-foreground shadow-[inset_0_1px_0_oklch(1_0_0_/_0.06)]'
                  : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground',
              )}
            >
              <span className={cn('h-8 w-8 rounded-lg grid place-items-center transition-colors', isActive ? 'bg-accent/10 text-accent' : 'bg-white/[0.025] group-hover:bg-white/[0.05]')}>
                <Icon className="h-4 w-4 shrink-0" />
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Admin */}
      {user?.role === 'admin' && (
        <div className="px-3 pb-3 border-t border-white/[0.06] pt-3">
          <Link
            to="/admin/members"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-all"
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Admin
          </Link>
        </div>
      )}

      {/* User chip */}
      <div className="m-3 px-3 py-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] flex items-center gap-3">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-xl object-cover flex-shrink-0 ring-1 ring-accent/30" />
        ) : (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/25 to-accent/10 flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
            <span className="text-[10px] font-bold text-primary">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground truncate leading-none">{user?.name}</p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
        </div>
      </div>
    </aside>
  )
}
