import { z } from 'zod'
import { router, protectedProcedure, adminProcedure, publicProcedure } from '../trpc.js'
import { events, eventRsvps } from '../../db/schema.js'
import { desc } from 'drizzle-orm'

export const eventRouter = router({
  upcoming: publicProcedure.query(async ({ ctx }) => {
    const eventsData = await ctx.db.query.events.findMany({
      where: (e, { and, eq, gte }) => and(eq(e.status, 'published'), gte(e.startsAt, new Date())),
      orderBy: (e, { asc }) => [asc(e.startsAt)],
      limit: 20,
      with: {
        rsvps: {
          where: (r, { eq }) => eq(r.status, 'attending'),
          columns: { userId: true, status: true },
        },
      },
    })
    const userId = ctx.userId
    return eventsData.map(({ rsvps, ...e }) => ({
      ...e,
      rsvpCount: rsvps.length,
      userRsvpStatus: userId ? (rsvps.find((r) => r.userId === userId)?.status ?? null) : null,
    }))
  }),

  past: publicProcedure
    .input(z.object({ page: z.number().default(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.events.findMany({
        where: (e, { and, eq, lt }) => and(eq(e.status, 'published'), lt(e.startsAt, new Date())),
        orderBy: [desc(events.startsAt)],
        limit: 12,
        offset: (input.page - 1) * 12,
      })
    }),

  get: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.query.events.findFirst({
        where: (e, { eq }) => eq(e.id, input.id),
      })
      if (!event) throw new Error('Not found')
      return event
    }),

  rsvp: protectedProcedure
    .input(z.object({
      eventId: z.string().uuid(),
      status: z.enum(['attending', 'maybe', 'not_attending']),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(eventRsvps)
        .values({ eventId: input.eventId, userId: ctx.userId, status: input.status })
        .onConflictDoUpdate({
          target: [eventRsvps.eventId, eventRsvps.userId],
          set: { status: input.status },
        })
    }),

  myRsvps: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.eventRsvps.findMany({
      where: (r, { eq }) => eq(r.userId, ctx.userId),
      with: { event: true },
    })
  }),

  adminCreate: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      startsAt: z.string(),
      endsAt: z.string().optional(),
      venue: z.string().optional(),
      description: z.string().optional(),
      isOnline: z.boolean().default(false),
      meetLink: z.string().optional(),
      coverUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [event] = await ctx.db.insert(events).values({
        ...input,
        startsAt: new Date(input.startsAt),
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
      }).returning()
      return event
    }),
})
