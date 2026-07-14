import { Link, useRouterState } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarDays,
  HandshakeIcon,
  UserCircle,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/directory', icon: Users, label: 'Directory' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/events', icon: CalendarDays, label: 'Events' },
  { to: '/know-your-alumni', icon: Star, label: 'Alumni Stories' },
  { to: '/mentorship', icon: HandshakeIcon, label: 'Mentorship' },
  { to: '/profile', icon: UserCircle, label: 'My Profile' },
] as const

export default function AppSidebar() {
  const { pathname } = useRouterState({ select: (s) => s.location })
  const { user } = useUser()

  return (
    <aside className="hidden lg:flex flex-col w-[220px] min-h-screen bg-card le-surface border-r border-border/40 relative z-20">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-extrabold text-accent font-display tracking-tight">LE</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold font-display text-foreground leading-none">Let's Enterprise</p>
            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-[0.18em] mt-0.5">Alumni Network</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = pathname === to || pathname.startsWith(to + '/')
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'le-nav-active'
                  : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Admin */}
      {user?.publicMetadata?.role === 'admin' && (
        <div className="px-2 pb-2 border-t border-border/30 pt-2">
          <Link
            to="/admin/members"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-all"
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Admin
          </Link>
        </div>
      )}

      {/* User chip */}
      <div className="px-3 py-3 border-t border-border/30 flex items-center gap-2.5">
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt={user.fullName ?? ''} className="h-7 w-7 rounded-full object-cover flex-shrink-0 ring-1 ring-accent/30" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-primary">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground truncate leading-none">{user?.fullName}</p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>
    </aside>
  )
}
