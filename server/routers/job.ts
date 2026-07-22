import { z } from 'zod'
import { router, protectedProcedure, adminProcedure, publicProcedure } from '../trpc.js'
import { jobs } from '../../db/schema.js'
import { eq, desc, and } from 'drizzle-orm'

export const jobRouter = router({
  list: publicProcedure
    .input(z.object({
      type: z.enum(['full_time', 'part_time', 'internship', 'contract', 'remote']).optional(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(jobs.status, 'approved'),
        input.type ? eq(jobs.type, input.type) : undefined,
      ].filter(Boolean)
      return ctx.db.query.jobs.findMany({
        where: and(...conditions),
        orderBy: [desc(jobs.createdAt)],
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
        with: { postedByUser: { columns: { name: true, avatarUrl: true } } },
      })
    }),

  get: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.query.jobs.findFirst({
        where: (j, { eq }) => eq(j.id, input.id),
        with: { postedByUser: { columns: { name: true, avatarUrl: true, company: true } } },
      })
      if (!job) throw new Error('Not found')
      return job
    }),

  post: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      company: z.string().min(1),
      location: z.string().optional(),
      type: z.enum(['full_time', 'part_time', 'internship', 'contract', 'remote']),
      description: z.string().min(10),
      applyUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [job] = await ctx.db.insert(jobs).values({ ...input, postedBy: ctx.userId, status: 'pending' }).returning()
      return job
    }),

  adminList: adminProcedure
    .input(z.object({ status: z.enum(['pending', 'approved', 'closed']).optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.jobs.findMany({
        where: input.status ? eq(jobs.status, input.status) : undefined,
        orderBy: [desc(jobs.createdAt)],
        limit: 100,
      })
    }),

  adminApprove: adminProcedure
    .input(z.object({ id: z.string().uuid(), status: z.enum(['approved', 'closed', 'pending']) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(jobs).set({ status: input.status }).where(eq(jobs.id, input.id))
    }),
})
