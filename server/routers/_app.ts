import { router } from '../trpc.js'
import { authRouter } from './auth.js'
import { userRouter } from './user.js'
import { jobRouter } from './job.js'
import { eventRouter } from './event.js'
import { mentorRouter } from './mentor.js'

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  job: jobRouter,
  event: eventRouter,
  mentor: mentorRouter,
})

export type AppRouter = typeof appRouter
