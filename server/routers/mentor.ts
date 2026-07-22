import { z } from 'zod'
import { router, protectedProcedure, publicProcedure, adminProcedure } from '../trpc.js'
import { mentorProfiles, mentorships, users } from '../../db/schema.js'
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
      category: z.enum(['alumni', 'industry_expert', 'lets_enterprise_mentor']).default('alumni'),
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

  adminList: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.mentorProfiles.findMany({
      with: { user: { columns: { id: true, name: true, email: true, headline: true, company: true, avatarUrl: true } } },
      limit: 200,
    })
  }),

  adminBulkCreate: adminProcedure
    .input(z.object({
      mentors: z.array(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        category: z.enum(['alumni', 'industry_expert', 'lets_enterprise_mentor']),
        headline: z.string().nullable().optional(),
        company: z.string().nullable().optional(),
        location: z.string().nullable().optional(),
        linkedinUrl: z.string().url().nullable().optional(),
        avatarUrl: z.string().url().nullable().optional(),
        topics: z.array(z.string()).max(20),
        capacity: z.number().int().min(1).max(50).default(3),
        isAvailable: z.boolean().default(true),
      })).min(1).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const imported: Array<{ id: string; name: string; email: string }> = []
      for (const mentor of input.mentors) {
        const email = mentor.email.trim().toLowerCase()
        const [user] = await ctx.db
          .insert(users)
          .values({
            name: mentor.name.trim(),
            email,
            role: 'alumni',
            headline: mentor.headline || null,
            company: mentor.company || null,
            location: mentor.location || null,
            linkedinUrl: mentor.linkedinUrl || null,
            avatarUrl: mentor.avatarUrl || null,
            visibility: 'members',
            isVerified: true,
          })
          .onConflictDoUpdate({
            target: users.email,
            set: {
              name: mentor.name.trim(),
              headline: mentor.headline || null,
              company: mentor.company || null,
              location: mentor.location || null,
              linkedinUrl: mentor.linkedinUrl || null,
              avatarUrl: mentor.avatarUrl || null,
              isVerified: true,
              updatedAt: new Date(),
            },
          })
          .returning({ id: users.id, name: users.name, email: users.email })

        await ctx.db
          .insert(mentorProfiles)
          .values({
            userId: user.id,
            category: mentor.category,
            topics: mentor.topics,
            capacity: mentor.capacity,
            isAvailable: mentor.isAvailable,
          })
          .onConflictDoUpdate({
            target: mentorProfiles.userId,
            set: {
              category: mentor.category,
              topics: mentor.topics,
              capacity: mentor.capacity,
              isAvailable: mentor.isAvailable,
            },
          })
        imported.push(user)
      }
      return { imported }
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
