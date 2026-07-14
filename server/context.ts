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
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: string }
    return {
      userId: payload.sub,
      role: payload.role as 'student' | 'alumni' | 'admin',
      db,
    }
  } catch {
    return { userId: null, role: null, db }
  }
}
