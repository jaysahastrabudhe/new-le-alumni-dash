import { z } from 'zod'
import { router, protectedProcedure, publicProcedure } from '../trpc'
import { mentorProfiles, mentorships } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'

export const mentorRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.mentorProfiles.findMany({
      where: (m, { eq }) => eq(m.isAvailable, true),
      with: { user: { columns: { id: true, name: true, headline: true, company: true, avatarUrl: true, batchYear: true } } },
      limit: 50,
    })
  }),

  setProfile: protectedProcedure
    .input(z.object({
      isAvailable: z.boolean(),
      topics: z.array(z.string()),
      capacity: z.number().min(1).max(10),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(mentorProfiles)
        .values({ userId: ctx.userId, ...input })
        .onConflictDoUpdate({
          target: mentorProfiles.userId,
          set: input,
        })
    }),

  request: protectedProcedure
    .input(z.object({
      mentorId: z.string().uuid(),
      topic: z.string().min(5),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.mentorId === ctx.userId) throw new Error('Cannot mentor yourself')
      const [m] = await ctx.db
        .insert(mentorships)
        .values({ ...input, menteeId: ctx.userId, status: 'requested' })
        .returning()
      return m
    }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    const asMentee = await ctx.db.query.mentorships.findMany({
      where: (m, { eq }) => eq(m.menteeId, ctx.userId),
      with: { mentor: { columns: { id: true, name: true, avatarUrl: true, headline: true } } },
      orderBy: [desc(mentorships.createdAt)],
    })
    const asMentor = await ctx.db.query.mentorships.findMany({
      where: (m, { eq }) => eq(m.mentorId, ctx.userId),
      with: { mentee: { columns: { id: true, name: true, avatarUrl: true, headline: true } } },
      orderBy: [desc(mentorships.createdAt)],
    })
    return { asMentee, asMentor }
  }),

  respond: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['active', 'declined']),
    }))
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.query.mentorships.findFirst({
        where: (m, { eq }) => eq(m.id, input.id),
      })
      if (!row || row.mentorId !== ctx.userId) throw new Error('Forbidden')
      await ctx.db.update(mentorships).set({ status: input.status }).where(eq(mentorships.id, input.id))
    }),
})
