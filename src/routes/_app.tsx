import { createFileRoute, Outlet } from '@tanstack/react-router'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import AppSidebar from '@/components/app/AppSidebar'
import TopNav from '@/components/app/TopNav'

export const Route = createFileRoute('/_app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="dark min-h-screen flex bg-background text-foreground">
          <div className="le-atmosphere" aria-hidden="true" />
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 relative z-10">
            <TopNav />
            <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
              <Outlet />
            </main>
          </div>
        </div>
      </SignedIn>
    </>
  )
}
