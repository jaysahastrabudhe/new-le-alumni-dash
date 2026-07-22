import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { users } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

function jwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Authentication is not configured' })
  }
  return secret
}

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      name: z.string().trim().min(2),
      email: z.string().trim().toLowerCase().email(),
      password: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      const email = input.email.trim().toLowerCase()
      const name = input.name.trim()
      const existing = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
        columns: { id: true },
      })
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered' })
      }
      const passwordHash = await bcrypt.hash(input.password, 12)
      const [user] = await ctx.db.insert(users).values({
        name,
        email,
        passwordHash,
      }).returning({ id: users.id, name: users.name, email: users.email, role: users.role, avatarUrl: users.avatarUrl, sessionVersion: users.sessionVersion })

      const token = jwt.sign({ sub: user.id, sv: user.sessionVersion }, jwtSecret(), { expiresIn: '30d' })
      return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } }
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().trim().toLowerCase().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const email = input.email.trim().toLowerCase()
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, email),
        columns: { id: true, name: true, email: true, role: true, passwordHash: true, avatarUrl: true, sessionVersion: true },
      })
      if (!user?.passwordHash) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' })
      }
      const valid = await bcrypt.compare(input.password, user.passwordHash)
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' })
      }
      const token = jwt.sign({ sub: user.id, sv: user.sessionVersion }, jwtSecret(), { expiresIn: '30d' })
      return {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      }
    }),

  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8).max(72),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.userId),
        columns: { passwordHash: true },
      })
      if (!user?.passwordHash || !await bcrypt.compare(input.currentPassword, user.passwordHash)) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Current password is incorrect' })
      }
      if (await bcrypt.compare(input.newPassword, user.passwordHash)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Choose a different password' })
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12)
      await ctx.db.update(users).set({
        passwordHash,
        sessionVersion: sql`${users.sessionVersion} + 1`,
        updatedAt: new Date(),
      }).where(eq(users.id, ctx.userId))
      return { success: true }
    }),
})
