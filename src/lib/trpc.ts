import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../server/routers/_app'

export const trpc = createTRPCReact<AppRouter>()

export function makeTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${import.meta.env.VITE_API_URL ?? ''}/api/trpc`,
        async headers() {
          return {}
        },
      }),
    ],
  })
}
