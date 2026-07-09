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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/directory', icon: Users, label: 'Directory' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/events', icon: CalendarDays, label: 'Events' },
  { to: '/mentorship', icon: HandshakeIcon, label: 'Mentorship' },
  { to: '/profile', icon: UserCircle, label: 'My Profile' },
] as const

export default function AppSidebar() {
  const { pathname } = useRouterState({ select: (s) => s.location })
  const { user } = useUser()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border bg-card">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-border">
        <h1 className="le-headline text-2xl font-extrabold text-foreground">
          Let's <span>Enterprise</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">Alumni Network</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
              pathname === to || pathname.startsWith(to + '/')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Admin link */}
      {(user?.publicMetadata?.role === 'admin') && (
        <div className="px-3 py-3 border-t border-border">
          <Link
            to="/admin/members"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Admin
          </Link>
        </div>
      )}

      {/* User chip */}
      <div className="px-4 py-4 border-t border-border flex items-center gap-3">
        {user?.imageUrl && (
          <img src={user.imageUrl} alt={user.fullName ?? ''} className="h-8 w-8 rounded-full object-cover" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user?.fullName}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>
    </aside>
  )
}
