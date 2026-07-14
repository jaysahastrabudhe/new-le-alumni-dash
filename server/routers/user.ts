import { z } from 'zod'
import { router, protectedProcedure, adminProcedure, publicProcedure } from '../trpc'
import { users, careerEntries, jobs, events, mentorProfiles } from '../../db/schema'
import { eq, ilike, and, desc, count, gte } from 'drizzle-orm'

const visibilityCheck = (role: string | null) =>
  role ? ['public', 'members'] : ['public']

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, ctx.userId),
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
      const allowed = visibilityCheck(ctx.role)
      const conditions = [
        allowed.length === 1 ? eq(users.visibility, 'public') : undefined,
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
        with: { careerEntries: { orderBy: (c, { asc }) => [asc(c.sortOrder)] } },
      })
      if (!user) throw new Error('Not found')
      if (user.visibility === 'hidden') throw new Error('Not found')
      if (user.visibility === 'members' && !ctx.userId) throw new Error('Login required')
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
})
