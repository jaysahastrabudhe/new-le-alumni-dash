import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from '../server/routers/_app'
import { createContext } from '../server/context'

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use('/api/trpc', createExpressMiddleware({ router: appRouter, createContext }))

export default app
