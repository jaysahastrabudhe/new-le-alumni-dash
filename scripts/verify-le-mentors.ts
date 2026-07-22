import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import { users, mentorProfiles } from '../db/schema.js'

const db = drizzle(neon(process.env.DATABASE_URL!))
const rows = await db
  .select({ name: users.name, headline: users.headline, avatarUrl: users.avatarUrl })
  .from(mentorProfiles)
  .innerJoin(users, eq(mentorProfiles.userId, users.id))
  .where(eq(mentorProfiles.category, 'lets_enterprise_mentor'))

console.log(`\n${rows.length} Let's Enterprise Mentors in DB:\n`)
for (const r of rows) {
  console.log(`  ✓ ${r.name} | ${r.headline} | ${r.avatarUrl ? 'image ✓' : 'NO image'}`)
}
