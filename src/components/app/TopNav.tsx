import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Bell, LogOut, Menu, Search, X } from 'lucide-react'
import { useAuth } from '@/context/auth'
import { BrandLogo } from '@/components/brand-logo'
import { trpc } from '@/lib/trpc'

const crumbs: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/directory': 'Alumni Directory',
  '/jobs': 'Job Board',
  '/events': 'Events',
  '/mentorship': 'Mentorship',
  '/profile': 'My Profile',
  '/admin/members': 'Admin · Members',
  '/admin/jobs': 'Admin · Jobs',
}

const mobileLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/directory', label: 'Directory', section: 'directory' },
  { to: '/jobs', label: 'Jobs', section: 'jobs' },
  { to: '/events', label: 'Events', section: 'events' },
  { to: '/mentorship', label: 'Mentorship', section: 'mentorship' },
  { to: '/profile', label: 'Profile' },
] as const

export default function TopNav() {
  const { pathname } = useRouterState({ select: (state) => state.location })
  const title = crumbs[pathname] ?? 'LE Alumni'
  const { user, logout } = useAuth()
  const { data: sections } = trpc.settings.list.useQuery()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const visibleMobileLinks = mobileLinks.filter((item) => {
    if (!('section' in item) || user?.role === 'admin') return true
    return sections?.find((section) => section.key === item.section)?.isVisible ?? item.section !== 'jobs'
  })

  const handleLogout = () => {
    logout()
    void navigate({ to: '/login' })
  }

  return (
    <>
      <header className="h-[72px] border-b border-white/[0.07] bg-background/65 backdrop-blur-xl flex items-center px-4 lg:px-7 gap-4 sticky top-0 z-30">
        <button
          onClick={() => setMenuOpen(true)}
          className="lg:hidden h-10 w-10 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="hidden sm:block text-[9px] uppercase tracking-[0.16em] font-semibold text-muted-foreground/50 mb-0.5">Member space</p>
          <h2 className="font-display text-lg font-extrabold tracking-tight truncate">{title}</h2>
        </div>

        <button className="hidden md:flex items-center gap-2.5 h-10 w-60 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 text-xs text-muted-foreground hover:border-white/[0.12] hover:bg-white/[0.04] transition-all">
          <Search className="h-3.5 w-3.5" />
          Search the network
          <span className="ml-auto text-[9px] border border-white/10 rounded px-1.5 py-0.5">⌘K</span>
        </button>
        <button className="h-10 w-10 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.05] relative transition-colors" aria-label="Notifications">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-background" />
        </button>
        <div className="hidden sm:block h-7 w-px bg-white/[0.07]" />
        <button
          onClick={handleLogout}
          className="hidden sm:flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 hover:bg-white/[0.05] transition-colors text-left"
          title="Sign out"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/15 grid place-items-center text-[10px] font-extrabold text-foreground">
            {user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden xl:block max-w-28">
            <p className="text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-[9px] text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </header>

      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/90 backdrop-blur-2xl p-5">
          <div className="flex items-center justify-between mb-10">
            <BrandLogo className="w-[155px]" showNetworkLabel={false} />
            <button onClick={() => setMenuOpen(false)} className="h-10 w-10 rounded-xl border border-white/10 grid place-items-center" aria-label="Close navigation">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-2">
            {visibleMobileLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3.5 rounded-xl text-lg font-bold ${pathname.startsWith(item.to) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-white/[0.05]'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button onClick={handleLogout} className="absolute bottom-8 left-5 right-5 flex items-center justify-center gap-2 h-12 rounded-xl border border-white/10 text-sm font-semibold text-muted-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </>
  )
}
