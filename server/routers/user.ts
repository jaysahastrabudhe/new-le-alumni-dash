import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { router, protectedProcedure, adminProcedure, publicProcedure } from '../trpc'
import { users, careerEntries, jobs, events, mentorProfiles } from '../../db/schema'
import { eq, ilike, inArray, and, desc, count, gte, sql } from 'drizzle-orm'

const visibleProfileLevels = (role: string | null): Array<'public' | 'members'> =>
  role ? ['public', 'members'] : ['public']

const bulkMemberSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(['student', 'alumni']).default('alumni'),
  batchYear: z.number().int().min(2000).max(2100).nullable().optional(),
  headline: z.string().trim().max(160).nullable().optional(),
  company: z.string().trim().max(120).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  visibility: z.enum(['public', 'members', 'hidden']).default('members'),
  isVerified: z.boolean().default(true),
  temporaryPassword: z.string().min(8).max(72).optional(),
})

function temporaryPassword() {
  return `LE-${randomBytes(9).toString('base64url')}`
}

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, ctx.userId),
      columns: {
        id: true, role: true, name: true, email: true, batchYear: true,
        headline: true, bio: true, location: true, company: true, avatarUrl: true,
        linkedinUrl: true, visibility: true, isVerified: true, createdAt: true, updatedAt: true,
      },
      with: { careerEntries: { orderBy: (c, { asc }) => [asc(c.sortOrder)] } },
    })
  }),

  update: protectedProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      headline: z.string().optional(),
      bio: z.string().optional(),
      location: z.string().optional(),
      company: z.string().optional(),
      linkedinUrl: z.string().url().optional().or(z.literal('')),
      avatarUrl: z.string().optional(),
      visibility: z.enum(['public', 'members', 'hidden']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(users)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(users.id, ctx.userId))
        .returning()
      return updated
    }),

  stats: publicProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const [alumniRes, jobsRes, eventsRes, mentorsRes] = await Promise.all([
      ctx.db.select({ count: count() }).from(users).where(eq(users.isVerified, true)),
      ctx.db.select({ count: count() }).from(jobs).where(eq(jobs.status, 'approved')),
      ctx.db.select({ count: count() }).from(events).where(and(eq(events.status, 'published'), gte(events.startsAt, now))),
      ctx.db.select({ count: count() }).from(mentorProfiles).where(eq(mentorProfiles.isAvailable, true)),
    ])
    return {
      alumni: Number(alumniRes[0]?.count ?? 0),
      jobs: Number(jobsRes[0]?.count ?? 0),
      events: Number(eventsRes[0]?.count ?? 0),
      mentors: Number(mentorsRes[0]?.count ?? 0),
    }
  }),

  directory: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      batchYear: z.number().optional(),
      role: z.enum(['student', 'alumni']).optional(),
      page: z.number().default(1),
      limit: z.number().max(48).default(24),
    }))
    .query(async ({ ctx, input }) => {
      const allowed = visibleProfileLevels(ctx.role)
      const conditions = [
        inArray(users.visibility, allowed),
        input.search ? ilike(users.name, `%${input.search}%`) : undefined,
        input.batchYear ? eq(users.batchYear, input.batchYear) : undefined,
        input.role ? eq(users.role, input.role) : undefined,
        eq(users.isVerified, true),
      ].filter(Boolean)

      const rows = await ctx.db.query.users.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        columns: { id: true, name: true, headline: true, company: true, location: true, batchYear: true, avatarUrl: true, role: true, linkedinUrl: true },
        orderBy: [desc(users.createdAt)],
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      })
      return rows
    }),

  profile: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, input.userId),
        columns: {
          id: true, role: true, name: true, batchYear: true, headline: true, bio: true,
          location: true, company: true, avatarUrl: true, linkedinUrl: true,
          visibility: true, isVerified: true, createdAt: true, updatedAt: true,
        },
        with: { careerEntries: { orderBy: (c, { asc }) => [asc(c.sortOrder)] } },
      })
      if (!user) throw new Error('Not found')
      if (user.visibility === 'hidden') throw new Error('Not found')
      if (user.visibility === 'members' && !ctx.userId) throw new Error('Login required')
      if (!user.isVerified && ctx.userId !== user.id && ctx.role !== 'admin') throw new Error('Not found')
      return user
    }),

  addCareerEntry: protectedProcedure
    .input(z.object({
      company: z.string().min(1),
      title: z.string().min(1),
      startDate: z.string(),
      endDate: z.string().optional(),
      isCurrent: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const [entry] = await ctx.db.insert(careerEntries).values({ ...input, userId: ctx.userId }).returning()
      return entry
    }),

  adminList: adminProcedure
    .input(z.object({ page: z.number().default(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.users.findMany({
        columns: {
          id: true, role: true, name: true, email: true, batchYear: true,
          headline: true, location: true, company: true, avatarUrl: true,
          visibility: true, isVerified: true, createdAt: true, updatedAt: true,
        },
        orderBy: [desc(users.createdAt)],
        limit: 50,
        offset: (input.page - 1) * 50,
      })
    }),

  adminVerify: adminProcedure
    .input(z.object({ userId: z.string().uuid(), verified: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(users).set({ isVerified: input.verified }).where(eq(users.id, input.userId))
    }),

  adminBulkCreate: adminProcedure
    .input(z.object({ members: z.array(bulkMemberSchema).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const uniqueMembers = Array.from(new Map(input.members.map((member) => [member.email, member])).values())
      const emails = uniqueMembers.map((member) => member.email)
      const existing = await ctx.db.select({ email: users.email }).from(users).where(inArray(users.email, emails))
      const existingEmails = new Set(existing.map((user) => user.email))
      const newMembers = uniqueMembers.filter((member) => !existingEmails.has(member.email))

      const prepared = await Promise.all(newMembers.map(async (member) => {
        const password = member.temporaryPassword ?? temporaryPassword()
        return {
          values: {
            name: member.name,
            email: member.email,
            role: member.role,
            batchYear: member.batchYear ?? null,
            headline: member.headline || null,
            company: member.company || null,
            location: member.location || null,
            linkedinUrl: member.linkedinUrl || null,
            visibility: member.visibility,
            isVerified: member.isVerified,
            passwordHash: await bcrypt.hash(password, 12),
          },
          password,
        }
      }))

      const created = prepared.length
        ? await ctx.db.insert(users).values(prepared.map((item) => item.values)).onConflictDoNothing({ target: users.email }).returning({ id: users.id, name: users.name, email: users.email })
        : []
      const passwordByEmail = new Map(prepared.map((item) => [item.values.email, item.password]))

      return {
        created: created.map((user) => ({ ...user, temporaryPassword: passwordByEmail.get(user.email)! })),
        skipped: emails.filter((email) => !created.some((user) => user.email === email)),
      }
    }),

  adminResetPassword: adminProcedure
    .input(z.object({
      userId: z.string().uuid(),
      temporaryPassword: z.string().min(8).max(72).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const password = input.temporaryPassword ?? temporaryPassword()
      const passwordHash = await bcrypt.hash(password, 12)
      const [updated] = await ctx.db.update(users).set({
        passwordHash,
        sessionVersion: sql`${users.sessionVersion} + 1`,
        updatedAt: new Date(),
      }).where(eq(users.id, input.userId)).returning({ id: users.id, email: users.email })
      if (!updated) throw new Error('Member not found')
      return { ...updated, temporaryPassword: password }
    }),
})
