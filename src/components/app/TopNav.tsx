import { useRouterState, useNavigate } from '@tanstack/react-router'
import { Menu, Bell, LogOut } from 'lucide-react'
import { useAuth } from '@/context/auth'

const crumbs: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/directory': 'Alumni Directory',
  '/jobs': 'Job Board',
  '/events': 'Events',
  '/mentorship': 'Mentorship',
  '/profile': 'My Profile',
  '/know-your-alumni': 'Alumni Stories',
  '/admin/members': 'Admin · Members',
  '/admin/jobs': 'Admin · Jobs',
}

export default function TopNav() {
  const { pathname } = useRouterState({ select: (s) => s.location })
  const title = crumbs[pathname] ?? 'LE Alumni'
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    void navigate({ to: '/login' })
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-4 lg:px-6 gap-4">
      <button className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground">
        <Menu className="h-5 w-5" />
      </button>

      <h2 className="font-display text-lg font-bold flex-1">{title}</h2>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-md text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
        </button>
        <button
          onClick={handleLogout}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
