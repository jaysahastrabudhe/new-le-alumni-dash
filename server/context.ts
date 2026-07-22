import type { IncomingHttpHeaders, IncomingMessage } from 'http'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import jwt from 'jsonwebtoken'
import * as schema from '../db/schema.js'
import * as relations from '../db/relations.js'

const mergedSchema = { ...schema, ...relations }

function makeDb(url: string) {
  return drizzle(neon(url), { schema: mergedSchema })
}

export type Context = {
  userId: string | null
  role: 'student' | 'alumni' | 'admin' | null
  db: ReturnType<typeof makeDb>
}

type ContextRequest = IncomingMessage | Request | { headers: IncomingHttpHeaders | Headers }

function getAuthorizationHeader(req: ContextRequest) {
  if (req.headers instanceof Headers) return req.headers.get('authorization') ?? ''
  const header = req.headers.authorization
  return Array.isArray(header) ? header[0] ?? '' : header ?? ''
}

export async function createContext({ req }: { req: ContextRequest }): Promise<Context> {
  const db = makeDb(process.env.DATABASE_URL!)

  const authHeader = getAuthorizationHeader(req)
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
