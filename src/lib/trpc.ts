import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../server/routers/_app'
import { readStoredSession } from '@/lib/auth-storage'

export const trpc = createTRPCReact<AppRouter>()

export function makeTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${import.meta.env.VITE_API_URL ?? ''}/api/trpc`,
        async headers() {
          const token = readStoredSession()?.token
          return token ? { Authorization: `Bearer ${token}` } : {}
        },
      }),
    ],
  })
}
