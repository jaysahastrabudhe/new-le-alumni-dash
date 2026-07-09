import { relations } from 'drizzle-orm'
import { users, careerEntries, jobs, events, eventRsvps, mentorProfiles, mentorships } from './schema'

export const usersRelations = relations(users, ({ many, one }) => ({
  careerEntries: many(careerEntries),
  jobs: many(jobs),
  eventRsvps: many(eventRsvps),
  mentorProfile: one(mentorProfiles, { fields: [users.id], references: [mentorProfiles.userId] }),
  mentorshipsAsMentor: many(mentorships, { relationName: 'mentor' }),
  mentorshipsAsMentee: many(mentorships, { relationName: 'mentee' }),
}))

export const careerEntriesRelations = relations(careerEntries, ({ one }) => ({
  user: one(users, { fields: [careerEntries.userId], references: [users.id] }),
}))

export const jobsRelations = relations(jobs, ({ one }) => ({
  postedByUser: one(users, { fields: [jobs.postedBy], references: [users.id] }),
}))

export const eventsRelations = relations(events, ({ many }) => ({
  rsvps: many(eventRsvps),
}))

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, { fields: [eventRsvps.eventId], references: [events.id] }),
  user: one(users, { fields: [eventRsvps.userId], references: [users.id] }),
}))

export const mentorProfilesRelations = relations(mentorProfiles, ({ one }) => ({
  user: one(users, { fields: [mentorProfiles.userId], references: [users.id] }),
}))

export const mentorshipsRelations = relations(mentorships, ({ one }) => ({
  mentor: one(users, { fields: [mentorships.mentorId], references: [users.id], relationName: 'mentor' }),
  mentee: one(users, { fields: [mentorships.menteeId], references: [users.id], relationName: 'mentee' }),
}))
