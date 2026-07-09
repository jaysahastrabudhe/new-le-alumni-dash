import { UserButton } from '@clerk/clerk-react'
import { useRouterState } from '@tanstack/react-router'
import { Menu, Bell } from 'lucide-react'

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

export default function TopNav() {
  const { pathname } = useRouterState({ select: (s) => s.location })
  const title = crumbs[pathname] ?? 'LE Alumni'

  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile menu placeholder */}
      <button className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground">
        <Menu className="h-5 w-5" />
      </button>

      <h2 className="font-display text-lg font-bold flex-1">{title}</h2>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-md text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
        </button>
        <UserButton afterSignOutUrl="/login" />
      </div>
    </header>
  )
}
