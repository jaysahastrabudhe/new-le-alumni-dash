import { createFileRoute, Outlet, redirect, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import AppSidebar from '@/components/app/AppSidebar'
import TopNav from '@/components/app/TopNav'
import { useAuth } from '@/context/auth'
import { readStoredSession } from '@/lib/auth-storage'
import { trpc } from '@/lib/trpc'

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    if (!readStoredSession()) throw redirect({ to: '/login' })
  },
  component: AppLayout,
})

function AppLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const sessionCheck = trpc.user.me.useQuery(undefined, { retry: false })
  const { data: sections } = trpc.settings.list.useQuery(undefined, { retry: false })
  const currentSection = pathname.startsWith('/directory') ? 'directory'
    : pathname.startsWith('/jobs') ? 'jobs'
      : pathname.startsWith('/events') ? 'events'
        : pathname.startsWith('/mentorship') ? 'mentorship'
          : null
  const sectionIsHidden = user?.role !== 'admin' && currentSection
    ? !(sections?.find((section) => section.key === currentSection)?.isVisible ?? currentSection !== 'jobs')
    : false

  useEffect(() => {
    const sessionIsInvalid =
      sessionCheck.error?.data?.code === 'UNAUTHORIZED' ||
      (sessionCheck.isSuccess && !sessionCheck.data)
    if (!sessionIsInvalid) return
    logout()
    void navigate({ to: '/login', replace: true })
  }, [logout, navigate, sessionCheck.data, sessionCheck.error, sessionCheck.isSuccess])

  useEffect(() => {
    if (sectionIsHidden) void navigate({ to: '/dashboard', replace: true })
  }, [navigate, sectionIsHidden])

  return (
    <div className="dark min-h-screen flex bg-background text-foreground">
      <div className="le-atmosphere" aria-hidden="true" />
      <div className="le-page-grid fixed inset-0 pointer-events-none" aria-hidden="true" />
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-x-hidden">
          {!sectionIsHidden && <Outlet />}
        </main>
      </div>
    </div>
  )
}
