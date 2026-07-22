import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc.js'
import { appSections } from '../../db/schema.js'

export const SECTION_DEFAULTS = [
  { key: 'directory', label: 'Alumni Directory', description: 'Member profiles and alumni discovery.', isVisible: true },
  { key: 'jobs', label: 'Jobs', description: 'Job board, openings, and job posting.', isVisible: false },
  { key: 'events', label: 'Events', description: 'Community events and registrations.', isVisible: true },
  { key: 'mentorship', label: 'Mentorship', description: 'Mentor discovery and guidance requests.', isVisible: true },
] as const

const sectionKey = z.enum(['directory', 'jobs', 'events', 'mentorship'])

export const settingsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const stored = await ctx.db.select().from(appSections)
    const values = new Map(stored.map((section) => [section.key, section.isVisible]))
    return SECTION_DEFAULTS.map((section) => ({
      ...section,
      isVisible: values.get(section.key) ?? section.isVisible,
    }))
  }),

  adminSetVisibility: adminProcedure
    .input(z.object({ key: sectionKey, isVisible: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(appSections)
        .values({ ...input, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: appSections.key,
          set: { isVisible: input.isVisible, updatedAt: new Date() },
        })
      return input
    }),
})
