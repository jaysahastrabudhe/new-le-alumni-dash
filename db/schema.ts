import { pgTable, uuid, text, integer, boolean, timestamp, date, primaryKey } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  passwordHash: text('password_hash'),
  role: text('role', { enum: ['student', 'alumni', 'admin'] }).default('student').notNull(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  batchYear: integer('batch_year'),
  headline: text('headline'),
  bio: text('bio'),
  location: text('location'),
  company: text('company'),
  avatarUrl: text('avatar_url'),
  linkedinUrl: text('linkedin_url'),
  visibility: text('visibility', { enum: ['public', 'members', 'hidden'] }).default('members').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const careerEntries = pgTable('career_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  company: text('company').notNull(),
  title: text('title').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  isCurrent: boolean('is_current').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
})

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  postedBy: uuid('posted_by').references(() => users.id).notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location'),
  type: text('type', { enum: ['full_time', 'part_time', 'internship', 'contract', 'remote'] }).default('full_time').notNull(),
  description: text('description').notNull(),
  applyUrl: text('apply_url'),
  status: text('status', { enum: ['pending', 'approved', 'closed'] }).default('pending').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at'),
  venue: text('venue'),
  description: text('description'),
  coverUrl: text('cover_url'),
  isOnline: boolean('is_online').default(false).notNull(),
  meetLink: text('meet_link'),
  status: text('status', { enum: ['draft', 'published', 'cancelled'] }).default('published').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const eventRsvps = pgTable('event_rsvps', {
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: text('status', { enum: ['attending', 'maybe', 'not_attending'] }).default('attending').notNull(),
}, (t) => [primaryKey({ columns: [t.eventId, t.userId] })])

export const mentorProfiles = pgTable('mentor_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  isAvailable: boolean('is_available').default(true).notNull(),
  topics: text('topics').array().notNull().default(sql`'{}'::text[]`),
  capacity: integer('capacity').default(3).notNull(),
})

export const mentorships = pgTable('mentorships', {
  id: uuid('id').primaryKey().defaultRandom(),
  mentorId: uuid('mentor_id').references(() => users.id).notNull(),
  menteeId: uuid('mentee_id').references(() => users.id).notNull(),
  topic: text('topic').notNull(),
  status: text('status', { enum: ['requested', 'active', 'completed', 'declined'] }).default('requested').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
