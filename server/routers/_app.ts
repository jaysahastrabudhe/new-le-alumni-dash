import { router } from '../trpc'
import { authRouter } from './auth'
import { userRouter } from './user'
import { jobRouter } from './job'
import { eventRouter } from './event'
import { mentorRouter } from './mentor'

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  job: jobRouter,
  event: eventRouter,
  mentor: mentorRouter,
})

export type AppRouter = typeof appRouter
