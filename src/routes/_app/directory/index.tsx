import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from '@tanstack/react-router'
import { useEntranceAnimation } from '@/hooks/useAnime'

export const Route = createFileRoute('/_app/directory/')({
  component: DirectoryPage,
})

function AlumniCard({ id, name, headline, company, location, batchYear, avatarUrl }: {
  id: string; name: string; headline?: string | null; company?: string | null
  location?: string | null; batchYear?: number | null; avatarUrl?: string | null; role: string
}) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <Link to="/directory/$userId" params={{ userId: id }}>
      <div className="group rounded-lg border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm truncate">{name}</p>
              {batchYear && <Badge variant="outline" className="text-xs shrink-0">Batch '{String(batchYear).slice(-2)}</Badge>}
            </div>
            {headline && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{headline}</p>}
            {company && <p className="text-xs text-muted-foreground mt-0.5">{company}</p>}
            {location && <p className="text-xs text-muted-foreground/70 mt-1">{location}</p>}
          </div>
        </div>
      </div>
    </Link>
  )
}

function DirectoryPage() {
  const [search, setSearch] = useState('')
  const [batchYear, setBatchYear] = useState<number | undefined>()
  const gridRef = useEntranceAnimation([search, batchYear])

  const { data, isLoading } = trpc.user.directory.useQuery(
    { search: search || undefined, batchYear, page: 1 },
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="le-headline text-3xl font-extrabold">
          Alumni <span>Directory</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Find and connect with your batchmates and seniors.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
          value={batchYear ?? ''}
          onChange={(e) => setBatchYear(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">All batches</option>
          {[2024, 2023, 2022, 2021, 2020].map(y => (
            <option key={y} value={y}>Batch {y}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {data?.map((a: { id: string; name: string; headline?: string | null; company?: string | null; location?: string | null; batchYear?: number | null; avatarUrl?: string | null; role: string }) => <AlumniCard key={a.id} {...a} />)}
          {data?.length === 0 && (
            <p className="col-span-3 text-center text-muted-foreground py-16">No alumni found.</p>
          )}
        </div>
      )}
    </div>
  )
}
