import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { appRouter } from './routers/_app.js'
import { createContext } from './context.js'

const app = express()

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5182'], credentials: true }))
app.use(express.json())

app.use(
  '/api/trpc',
  createExpressMiddleware({ router: appRouter, createContext }),
)

app.listen(3001, () => {
  console.log('API server on http://localhost:3001')
})
