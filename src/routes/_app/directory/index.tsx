import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Search, ExternalLink } from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useEntranceAnimation } from '@/hooks/useAnime'

export const Route = createFileRoute('/_app/directory/')({
  component: DirectoryPage,
})

type AlumniCardProps = {
  id: string
  name: string
  headline?: string | null
  company?: string | null
  location?: string | null
  batchYear?: number | null
  avatarUrl?: string | null
  linkedinUrl?: string | null
  role: string
}

function AlumniCard({ id, name, headline, company, location, batchYear, avatarUrl, linkedinUrl }: AlumniCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="group relative">
      <Link to="/directory/$userId" params={{ userId: id }}>
        <div className="rounded-xl border border-border/50 bg-card le-surface p-5 hover:border-accent/40 hover:ring-1 hover:ring-accent/20 transition-all duration-150 cursor-pointer">
          <div className="flex items-start gap-3.5">
            <Avatar className="h-11 w-11 shrink-0 ring-1 ring-border/50 group-hover:ring-accent/30 transition-all">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm truncate text-foreground">{name}</p>
                {batchYear && (
                  <Badge variant="outline" className="text-[10px] shrink-0 border-border/60 text-muted-foreground">
                    '{String(batchYear).slice(-2)}
                  </Badge>
                )}
              </div>
              {company && <p className="text-xs text-foreground/70 mt-0.5 truncate font-medium">{company}</p>}
              {headline && !company && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{headline}</p>}
              {location && <p className="text-[10px] text-muted-foreground/60 mt-1">{location}</p>}
            </div>
          </div>
        </div>
      </Link>

      {linkedinUrl && (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 rounded-lg bg-card border border-border/50 hover:border-accent/40 hover:bg-accent/10"
        >
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-accent transition-colors" />
        </a>
      )}
    </div>
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

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {data?.map((a) => <AlumniCard key={a.id} {...a} />)}
          {data?.length === 0 && (
            <p className="col-span-3 text-center text-muted-foreground py-16">No alumni found.</p>
          )}
        </div>
      )}
    </div>
  )
}
