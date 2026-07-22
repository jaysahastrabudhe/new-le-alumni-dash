import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { CheckCircle2, Upload, UsersRound } from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export const Route = createFileRoute('/admin/mentors')({
  component: AdminMentorsPage,
})

type MentorCategory = 'alumni' | 'industry_expert' | 'lets_enterprise_mentor'

type BulkMentor = {
  name: string
  email: string
  category: MentorCategory
  headline?: string | null
  company?: string | null
  location?: string | null
  linkedinUrl?: string | null
  avatarUrl?: string | null
  topics: string[]
  capacity: number
  isAvailable: boolean
}

const CATEGORY_LABELS: Record<MentorCategory, string> = {
  alumni: 'Alumni',
  industry_expert: 'Industry Expert',
  lets_enterprise_mentor: "Let's Enterprise Mentor",
}

const CSV_HEADER = 'name,email,category,headline,company,location,linkedinUrl,avatarUrl,topics,capacity,isAvailable'
const CSV_EXAMPLE = `${CSV_HEADER}\nAarav Shah,aarav@example.com,industry_expert,Product Leader,Acme Labs,Pune,https://linkedin.com/in/aarav,,Product Strategy|Leadership,5,true`

function parseCsvLine(line: string) {
  const values: string[] = []
  let value = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      values.push(value.trim())
      value = ''
    } else {
      value += char
    }
  }
  values.push(value.trim())
  return values
}

function normalizeCategory(value: string): MentorCategory | null {
  const normalized = value.trim().toLowerCase().replace(/[’']/g, '').replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '')
  if (normalized === 'alumni' || normalized === 'almuni') return 'alumni'
  if (normalized === 'industry_expert' || normalized === 'industry_experts') return 'industry_expert'
  if (normalized === 'lets_enterprise_mentor' || normalized === 'lets_enterprise_mentors') return 'lets_enterprise_mentor'
  return null
}

function parseMentorsCsv(source: string): BulkMentor[] {
  const lines = source.split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0])
  if (['name', 'email', 'category'].some((header) => !headers.includes(header))) {
    throw new Error('CSV must include name, email, and category columns.')
  }

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line)
    const row = Object.fromEntries(headers.map((header, column) => [header, values[column]?.trim() ?? '']))
    if (!row.name || !row.email) throw new Error(`Row ${index + 2}: name and email are required.`)
    const category = normalizeCategory(row.category)
    if (!category) throw new Error(`Row ${index + 2}: category must be Alumni, Industry Experts, or Let's Enterprise Mentors.`)
    const capacity = row.capacity ? Number(row.capacity) : 3
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) throw new Error(`Row ${index + 2}: capacity must be between 1 and 50.`)
    return {
      name: row.name,
      email: row.email.toLowerCase(),
      category,
      headline: row.headline || null,
      company: row.company || null,
      location: row.location || null,
      linkedinUrl: row.linkedinUrl || null,
      avatarUrl: row.avatarUrl || null,
      topics: row.topics ? row.topics.split('|').map((topic) => topic.trim()).filter(Boolean) : [],
      capacity,
      isAvailable: row.isAvailable ? row.isAvailable.toLowerCase() !== 'false' : true,
    }
  })
}

function AdminMentorsPage() {
  const { data, isLoading, refetch } = trpc.mentor.adminList.useQuery()
  const [importOpen, setImportOpen] = useState(false)
  const [csvText, setCsvText] = useState(CSV_HEADER)
  const [importedCount, setImportedCount] = useState<number | null>(null)
  const parsed = useMemo(() => {
    try {
      return { mentors: parseMentorsCsv(csvText), error: null }
    } catch (error) {
      return { mentors: [], error: error instanceof Error ? error.message : 'Invalid CSV' }
    }
  }, [csvText])
  const bulkMutation = trpc.mentor.adminBulkCreate.useMutation({
    onSuccess: ({ imported }) => {
      setImportedCount(imported.length)
      void refetch()
    },
  })

  const counts = (Object.keys(CATEGORY_LABELS) as MentorCategory[]).map((category) => ({
    category,
    count: data?.filter((mentor) => mentor.category === category).length ?? 0,
  }))

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="le-kicker">Mentorship administration</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em]">Mentor directory</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage mentor categories and import up to 100 mentors from CSV.</p>
        </div>
        <Button onClick={() => { setImportOpen(true); setImportedCount(null) }}><Upload className="h-4 w-4" /> Import mentors</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {counts.map(({ category, count }) => (
          <div key={category} className="rounded-2xl border border-white/[0.07] bg-card/75 p-5 le-surface">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{CATEGORY_LABELS[category]}</p>
            <p className="mt-2 text-3xl font-extrabold">{count}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[1.4rem] border border-white/[0.08] bg-card/75 le-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-white/[0.07] bg-white/[0.025]">
              <tr>{['Mentor', 'Category', 'Company', 'Topics', 'Status'].map((heading) => <th key={heading} className="px-5 py-4 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 4 }).map((_, index) => <tr key={index}><td colSpan={5} className="px-5 py-4"><Skeleton className="h-5 w-full" /></td></tr>)}
              {data?.map((mentor) => (
                <tr key={mentor.userId} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-5 py-4"><p className="font-semibold">{mentor.user.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{mentor.user.email}</p></td>
                  <td className="px-5 py-4"><Badge variant="outline">{CATEGORY_LABELS[mentor.category]}</Badge></td>
                  <td className="px-5 py-4 text-muted-foreground">{mentor.user.company || '—'}</td>
                  <td className="max-w-xs px-5 py-4 text-xs text-muted-foreground">{mentor.topics.join(', ') || '—'}</td>
                  <td className="px-5 py-4"><Badge variant={mentor.isAvailable ? 'teal' : 'secondary'}>{mentor.isAvailable ? 'Available' : 'Hidden'}</Badge></td>
                </tr>
              ))}
              {!isLoading && data?.length === 0 && <tr><td colSpan={5} className="px-5 py-16 text-center text-muted-foreground"><UsersRound className="mx-auto h-7 w-7 text-accent/50" /><p className="mt-3">No mentors added yet.</p></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="dark max-w-3xl rounded-[1.5rem] border-white/10 bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Import mentors from CSV</DialogTitle>
            <DialogDescription>Use a pipe character between topics. Existing emails are updated instead of duplicated.</DialogDescription>
          </DialogHeader>
          {importedCount === null ? (
            <div className="mt-5 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm font-semibold hover:bg-white/[0.06]">
                  <Upload className="h-4 w-4" /> Choose CSV
                  <input type="file" accept=".csv,text/csv" className="sr-only" onChange={async (event) => { const file = event.target.files?.[0]; if (file) setCsvText(await file.text()); event.target.value = '' }} />
                </label>
                <Button variant="ghost" size="sm" onClick={() => setCsvText(CSV_EXAMPLE)}>Load example</Button>
                <span className="ml-auto text-xs text-muted-foreground">{parsed.mentors.length}/100 ready</span>
              </div>
              <Textarea value={csvText} onChange={(event) => setCsvText(event.target.value)} className="min-h-[240px] rounded-xl border-white/10 bg-black/15 font-mono text-xs leading-relaxed" spellCheck={false} />
              {(parsed.error || bulkMutation.error) && <p role="alert" className="rounded-xl border border-red-400/15 bg-red-400/[0.08] px-4 py-3 text-sm text-red-300">{parsed.error ?? bulkMutation.error?.message}</p>}
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button>
                <Button disabled={!parsed.mentors.length || parsed.mentors.length > 100 || !!parsed.error || bulkMutation.isPending} onClick={() => bulkMutation.mutate({ mentors: parsed.mentors })}>
                  {bulkMutation.isPending ? 'Importing…' : `Import ${parsed.mentors.length} mentors`}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent/[0.07] p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-accent" />
                <div><p className="font-bold">{importedCount} mentors imported</p><p className="mt-1 text-xs text-muted-foreground">The mentor directory is ready with the updated profiles.</p></div>
              </div>
              <div className="flex justify-end"><Button onClick={() => setImportOpen(false)}>Done</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
