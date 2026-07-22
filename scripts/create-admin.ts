import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, sql } from 'drizzle-orm'
import { users } from '../db/schema'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const name = process.env.ADMIN_NAME?.trim() || 'LE Administrator'
const password = process.env.ADMIN_PASSWORD

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
if (!email) throw new Error('ADMIN_EMAIL is required')
if (password && password.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters')

const db = drizzle(neon(process.env.DATABASE_URL))
const [existing] = await db.select({
  id: users.id,
  passwordHash: users.passwordHash,
}).from(users).where(eq(users.email, email)).limit(1)

if (existing) {
  if (!existing.passwordHash && !password) {
    throw new Error('ADMIN_PASSWORD is required because this account does not have a password')
  }
  await db.update(users).set({
    role: 'admin',
    isVerified: true,
    passwordHash: password ? await bcrypt.hash(password, 12) : existing.passwordHash,
    sessionVersion: sql`${users.sessionVersion} + 1`,
    updatedAt: new Date(),
  }).where(eq(users.id, existing.id))
  console.log(`Promoted ${email} to admin.`)
} else {
  if (!password) throw new Error('ADMIN_PASSWORD is required when creating a new admin')
  await db.insert(users).values({
    name,
    email,
    role: 'admin',
    isVerified: true,
    visibility: 'hidden',
    passwordHash: await bcrypt.hash(password, 12),
  })
  console.log(`Created admin ${email}.`)
}
