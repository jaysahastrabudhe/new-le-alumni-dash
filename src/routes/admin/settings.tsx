import { createFileRoute } from '@tanstack/react-router'
import { Eye, EyeOff, SlidersHorizontal } from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettingsPage,
})

function AdminSettingsPage() {
  const utils = trpc.useUtils()
  const { data: sections, isLoading } = trpc.settings.list.useQuery()
  const visibilityMutation = trpc.settings.adminSetVisibility.useMutation({
    onSuccess: () => utils.settings.list.invalidate(),
  })

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <div>
        <p className="le-kicker">Application controls</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em]">Section visibility</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose which areas members can see. Admin access remains available for management.</p>
      </div>

      <div className="rounded-[1.5rem] border border-white/[0.08] bg-card/75 p-3 le-surface">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent"><SlidersHorizontal className="h-4 w-4" /></span>
          <div><p className="font-bold">Member navigation</p><p className="text-xs text-muted-foreground">Changes apply across desktop, mobile, dashboard actions, and direct links.</p></div>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {isLoading && Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="m-4 h-16 rounded-xl" />)}
          {sections?.map((section) => (
            <div key={section.key} className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{section.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
              </div>
              <Button
                variant={section.isVisible ? 'outline' : 'ghost'}
                className={section.isVisible ? 'border-accent/25 text-accent' : 'text-muted-foreground'}
                disabled={visibilityMutation.isPending}
                onClick={() => visibilityMutation.mutate({ key: section.key, isVisible: !section.isVisible })}
              >
                {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {section.isVisible ? 'Visible' : 'Hidden'}
              </Button>
            </div>
          ))}
        </div>
      </div>
      {visibilityMutation.error && <p role="alert" className="rounded-xl border border-red-400/15 bg-red-400/[0.08] px-4 py-3 text-sm text-red-300">{visibilityMutation.error.message}</p>}
    </div>
  )
}
