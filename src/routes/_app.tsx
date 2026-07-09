import { createFileRoute, Outlet } from '@tanstack/react-router'
import AppSidebar from '@/components/app/AppSidebar'
import TopNav from '@/components/app/TopNav'

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    /* auth guard — Clerk handles this in component */
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="dark min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
