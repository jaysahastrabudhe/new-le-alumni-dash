import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from '../server/routers/_app'
import { createContext } from '../server/context'

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use('/api/trpc', createExpressMiddleware({ router: appRouter, createContext }))

// Catch-all: ensure errors always return JSON so the client doesn't get HTML
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
