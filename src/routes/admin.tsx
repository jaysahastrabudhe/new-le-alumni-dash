import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { readStoredSession } from '@/lib/auth-storage'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    const session = readStoredSession()
    if (!session) throw redirect({ to: '/login' })
    if (session.user.role !== 'admin') throw redirect({ to: '/dashboard' })
  },
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="dark min-h-screen flex bg-background text-foreground">
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center px-6 gap-4">
          <h2 className="font-display text-lg font-bold le-headline">LE Admin <span>Panel</span></h2>
          <nav className="flex gap-4 ml-auto text-sm">
            <a href="/admin/members" className="text-muted-foreground hover:text-foreground transition-colors">Members</a>
            <a href="/admin/mentors" className="text-muted-foreground hover:text-foreground transition-colors">Mentors</a>
            <a href="/admin/settings" className="text-muted-foreground hover:text-foreground transition-colors">Sections</a>
            <a href="/admin/jobs" className="text-muted-foreground hover:text-foreground transition-colors">Jobs</a>
            <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">← Dashboard</a>
          </nav>
        </header>
        <main className="flex-1 p-8"><Outlet /></main>
      </div>
    </div>
  )
}
