import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { router, publicProcedure } from '../trpc'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
        columns: { id: true },
      })
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered' })
      }
      const passwordHash = await bcrypt.hash(input.password, 12)
      const [user] = await ctx.db.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
      }).returning({ id: users.id, name: users.name, email: users.email, role: users.role, avatarUrl: users.avatarUrl })

      const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '30d' })
      return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } }
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.email, input.email),
        columns: { id: true, name: true, email: true, role: true, passwordHash: true, avatarUrl: true },
      })
      if (!user?.passwordHash) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' })
      }
      const valid = await bcrypt.compare(input.password, user.passwordHash)
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' })
      }
      const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '30d' })
      return {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      }
    }),
})
