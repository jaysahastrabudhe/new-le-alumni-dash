import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { CheckCircle2, Copy, KeyRound, Upload } from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/admin/members')({
  component: AdminMembersPage,
})

type BulkMember = {
  name: string
  email: string
  role: 'student' | 'alumni'
  batchYear?: number | null
  headline?: string | null
  company?: string | null
  location?: string | null
  linkedinUrl?: string | null
  visibility: 'public' | 'members' | 'hidden'
  isVerified: boolean
  temporaryPassword?: string
}

const CSV_HEADER = 'name,email,role,batchYear,company,location,headline,visibility,isVerified,temporaryPassword'
const CSV_EXAMPLE = `${CSV_HEADER}\nAarav Shah,aarav@example.com,alumni,2024,Acme Labs,Pune,Product Designer,members,true,`

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

function parseMembersCsv(source: string): BulkMember[] {
  const lines = source.split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0]).map((header) => header.trim())
  const required = ['name', 'email']
  if (required.some((header) => !headers.includes(header))) {
    throw new Error('CSV must include name and email columns.')
  }

  return lines.slice(1).map((line, rowIndex) => {
    const values = parseCsvLine(line)
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? '']))
    if (!row.name || !row.email) throw new Error(`Row ${rowIndex + 2}: name and email are required.`)
    const role = row.role || 'alumni'
    if (role !== 'student' && role !== 'alumni') throw new Error(`Row ${rowIndex + 2}: role must be student or alumni.`)
    const visibility = row.visibility || 'members'
    if (!['public', 'members', 'hidden'].includes(visibility)) throw new Error(`Row ${rowIndex + 2}: invalid visibility.`)
    const batchYear = row.batchYear ? Number(row.batchYear) : null
    if (batchYear !== null && (!Number.isInteger(batchYear) || batchYear < 2000 || batchYear > 2100)) {
      throw new Error(`Row ${rowIndex + 2}: invalid batch year.`)
    }
    return {
      name: row.name,
      email: row.email.toLowerCase(),
      role,
      batchYear,
      company: row.company || null,
      location: row.location || null,
      headline: row.headline || null,
      linkedinUrl: row.linkedinUrl || null,
      visibility: visibility as BulkMember['visibility'],
      isVerified: row.isVerified ? row.isVerified.toLowerCase() !== 'false' : true,
      temporaryPassword: row.temporaryPassword || undefined,
    }
  })
}

function AdminMembersPage() {
  const { data, isLoading, refetch } = trpc.user.adminList.useQuery({ page: 1 })
  const verifyMutation = trpc.user.adminVerify.useMutation({ onSuccess: () => refetch() })
  const [importOpen, setImportOpen] = useState(false)
  const [csvText, setCsvText] = useState(CSV_HEADER)
  const [importResult, setImportResult] = useState<null | {
    created: Array<{ id: string; name: string; email: string; temporaryPassword: string }>
    skipped: string[]
  }>(null)
  const [selectedMember, setSelectedMember] = useState<null | { id: string; name: string; email: string }>(null)
  const [customPassword, setCustomPassword] = useState('')
  const [resetResult, setResetResult] = useState<null | { email: string; temporaryPassword: string }>(null)

  const parsedImport = useMemo(() => {
    try {
      return { members: parseMembersCsv(csvText), error: null }
    } catch (error) {
      return { members: [], error: error instanceof Error ? error.message : 'Invalid CSV' }
    }
  }, [csvText])

  const bulkMutation = trpc.user.adminBulkCreate.useMutation({
    onSuccess: (result) => {
      setImportResult(result)
      void refetch()
    },
  })
  const resetMutation = trpc.user.adminResetPassword.useMutation({
    onSuccess: (result) => {
      setResetResult(result)
      setCustomPassword('')
    },
  })

  const verifiedCount = data?.filter((member) => member.isVerified).length ?? 0
  const alumniCount = data?.filter((member) => member.role === 'alumni').length ?? 0

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <p className="le-kicker">Administration</p>
          <h1 className="text-4xl font-extrabold tracking-[-0.04em] mt-3">Member management</h1>
          <p className="text-sm text-muted-foreground mt-2">Create profiles, manage access, and verify the alumni directory.</p>
        </div>
        <Button onClick={() => { setImportOpen(true); setImportResult(null) }}>
          <Upload className="h-4 w-4" /> Bulk create profiles
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          ['Total members', data?.length ?? 0],
          ['Verified', verifiedCount],
          ['Alumni', alumniCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/[0.07] bg-card/75 p-5 le-surface">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
            <p className="text-3xl font-extrabold mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[1.4rem] border border-white/[0.08] bg-card/75 overflow-hidden le-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="border-b border-white/[0.07] bg-white/[0.025]">
              <tr>
                {['Name', 'Email', 'Role', 'Batch', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-5 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em]">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}><td colSpan={6} className="px-5 py-4"><Skeleton className="h-5 w-full" /></td></tr>
              ))}
              {data?.map((member) => (
                <tr key={member.id} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.025] transition-colors">
                  <td className="px-5 py-4 font-semibold">{member.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{member.email}</td>
                  <td className="px-5 py-4"><Badge variant="secondary" className="capitalize">{member.role}</Badge></td>
                  <td className="px-5 py-4 text-muted-foreground">{member.batchYear ?? '—'}</td>
                  <td className="px-5 py-4">
                    <Badge variant={member.isVerified ? 'teal' : 'outline'}>{member.isVerified ? 'Verified' : 'Pending'}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={member.isVerified ? 'ghost' : 'default'}
                        onClick={() => verifyMutation.mutate({ userId: member.id, verified: !member.isVerified })}
                        disabled={verifyMutation.isPending}
                      >
                        {member.isVerified ? 'Unverify' : 'Verify'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelectedMember(member); setResetResult(null); setCustomPassword('') }}
                      >
                        <KeyRound className="h-3.5 w-3.5" /> Reset password
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="dark max-w-3xl rounded-[1.5rem] border-white/10 bg-card p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold">Bulk create profiles</DialogTitle>
            <DialogDescription>Upload or paste up to 100 CSV rows. Missing passwords are generated automatically.</DialogDescription>
          </DialogHeader>

          {!importResult ? (
            <div className="space-y-5 mt-6">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-white/10 bg-white/[0.035] text-sm font-semibold cursor-pointer hover:bg-white/[0.06]">
                  <Upload className="h-4 w-4" /> Choose CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={async (event) => {
                      const file = event.target.files?.[0]
                      if (file) setCsvText(await file.text())
                      event.target.value = ''
                    }}
                  />
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setCsvText(CSV_EXAMPLE)}>Load example</Button>
                <span className="text-xs text-muted-foreground ml-auto">{parsedImport.members.length}/100 rows ready</span>
              </div>
              <Textarea
                value={csvText}
                onChange={(event) => setCsvText(event.target.value)}
                className="min-h-[220px] rounded-xl bg-black/15 border-white/10 font-mono text-xs leading-relaxed"
                spellCheck={false}
              />
              {(parsedImport.error || bulkMutation.error) && (
                <p role="alert" className="text-sm text-red-300 bg-red-400/[0.08] border border-red-400/15 rounded-xl px-4 py-3">
                  {parsedImport.error ?? bulkMutation.error?.message}
                </p>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button>
                <Button
                  disabled={!parsedImport.members.length || parsedImport.members.length > 100 || !!parsedImport.error || bulkMutation.isPending}
                  onClick={() => bulkMutation.mutate({ members: parsedImport.members })}
                >
                  {bulkMutation.isPending ? 'Creating profiles…' : `Create ${parsedImport.members.length} profiles`}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-accent/20 bg-accent/[0.07] p-5 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-bold">{importResult.created.length} profiles created</p>
                  <p className="text-xs text-muted-foreground mt-1">Copy these credentials now. Passwords are not shown again.</p>
                </div>
              </div>
              {importResult.created.length > 0 && (
                <div className="rounded-xl border border-white/[0.08] overflow-hidden">
                  <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.06]">
                    {importResult.created.map((member) => (
                      <div key={member.id} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 px-4 py-3 text-xs">
                        <span className="font-semibold">{member.email}</span>
                        <code className="text-accent">{member.temporaryPassword}</code>
                        <button
                          onClick={() => navigator.clipboard.writeText(`${member.email}\t${member.temporaryPassword}`)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={`Copy credentials for ${member.name}`}
                        ><Copy className="h-3.5 w-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {importResult.skipped.length > 0 && (
                <p className="text-xs text-amber-200/80">Skipped {importResult.skipped.length} existing or duplicate emails.</p>
              )}
              <div className="flex justify-end">
                <Button onClick={() => setImportOpen(false)}>Done</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedMember} onOpenChange={(open) => { if (!open) setSelectedMember(null) }}>
        <DialogContent className="dark rounded-[1.5rem] border-white/10 bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Reset member password</DialogTitle>
            <DialogDescription>
              Reset access for {selectedMember?.name}. All of their existing sessions will be signed out.
            </DialogDescription>
          </DialogHeader>
          {!resetResult ? (
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="temporary-password">Temporary password</Label>
                <Input
                  id="temporary-password"
                  type="text"
                  value={customPassword}
                  onChange={(event) => setCustomPassword(event.target.value)}
                  placeholder="Leave blank to generate securely"
                />
                <p className="text-[10px] text-muted-foreground">If supplied, use 8–72 characters.</p>
              </div>
              {resetMutation.error && <p role="alert" className="text-sm text-red-300">{resetMutation.error.message}</p>}
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setSelectedMember(null)}>Cancel</Button>
                <Button
                  disabled={resetMutation.isPending || (!!customPassword && customPassword.length < 8)}
                  onClick={() => selectedMember && resetMutation.mutate({
                    userId: selectedMember.id,
                    temporaryPassword: customPassword || undefined,
                  })}
                >
                  {resetMutation.isPending ? 'Resetting…' : 'Reset password'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border border-accent/20 bg-accent/[0.07] p-5">
                <p className="text-xs text-muted-foreground">Temporary credentials</p>
                <p className="font-semibold mt-2">{resetResult.email}</p>
                <code className="block text-accent text-lg mt-1">{resetResult.temporaryPassword}</code>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(`${resetResult.email}\t${resetResult.temporaryPassword}`)}
              >
                <Copy className="h-4 w-4" /> Copy credentials
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">Share this securely. The password cannot be retrieved later.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
