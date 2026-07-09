import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '@/lib/trpc'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/admin/members')({
  component: AdminMembersPage,
})

function AdminMembersPage() {
  const { data, isLoading, refetch } = trpc.user.adminList.useQuery({ page: 1 })
  const verifyMutation = trpc.user.adminVerify.useMutation({ onSuccess: () => refetch() })

  return (
    <div className="space-y-6">
      <h1 className="le-headline text-3xl font-extrabold">Members <span>Management</span></h1>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/30">
            <tr>
              {['Name', 'Email', 'Role', 'Batch', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
            ))}
            {data?.map((u: { id: string; name: string; email: string; role: string; batchYear?: number | null; isVerified: boolean }) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3"><Badge variant="secondary">{u.role}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{u.batchYear ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.isVerified ? 'teal' : 'outline'}>{u.isVerified ? 'Verified' : 'Pending'}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant={u.isVerified ? 'ghost' : 'default'}
                    onClick={() => verifyMutation.mutate({ userId: u.id, verified: !u.isVerified })}
                    disabled={verifyMutation.isPending}
                  >
                    {u.isVerified ? 'Unverify' : 'Verify'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
