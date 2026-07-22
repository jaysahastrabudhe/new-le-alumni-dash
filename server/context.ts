import type { IncomingMessage } from 'http'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import jwt from 'jsonwebtoken'
import * as schema from '../db/schema'
import * as relations from '../db/relations'

const mergedSchema = { ...schema, ...relations }

function makeDb(url: string) {
  return drizzle(neon(url), { schema: mergedSchema })
}

export type Context = {
  userId: string | null
  role: 'student' | 'alumni' | 'admin' | null
  db: ReturnType<typeof makeDb>
}

export async function createContext({ req }: { req: IncomingMessage }): Promise<Context> {
  const db = makeDb(process.env.DATABASE_URL!)

  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) return { userId: null, role: null, db }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub?: unknown; sv?: unknown }
    if (typeof payload.sub !== 'string') {
      return { userId: null, role: null, db }
    }

    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, payload.sub as string),
      columns: { role: true, sessionVersion: true },
    })
    const tokenVersion = typeof payload.sv === 'number' ? payload.sv : 0
    if (!user || user.sessionVersion !== tokenVersion) return { userId: null, role: null, db }

    return {
      userId: payload.sub,
      role: user.role,
      db,
    }
  } catch {
    return { userId: null, role: null, db }
  }
}
