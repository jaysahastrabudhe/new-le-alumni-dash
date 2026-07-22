import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../server/routers/_app'
import { createContext } from '../server/context'

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'Content-Type, Authorization',
}

function withCors(response: Response) {
  const headers = new Headers(response.headers)
  for (const [name, value] of Object.entries(corsHeaders)) headers.set(name, value)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default {
  async fetch(request: Request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const missingConfig = ['DATABASE_URL', 'JWT_SECRET'].filter((name) => !process.env[name])
    if (missingConfig.length > 0) {
      console.error(`Missing required server configuration: ${missingConfig.join(', ')}`)
      return new Response(
        JSON.stringify({
          error: 'Server configuration is incomplete',
          code: 'MISSING_SERVER_CONFIG',
          missing: missingConfig,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'content-type': 'application/json' },
        },
      )
    }

    try {
      const response = await fetchRequestHandler({
        endpoint: '/api/trpc',
        req: request,
        router: appRouter,
        createContext: () => createContext({ req: request }),
        onError: ({ error, path }) => {
          console.error(`tRPC error on ${path ?? 'unknown path'}:`, error)
        },
      })
      return withCors(response)
    } catch (error) {
      console.error('Unhandled API error:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      })
    }
  },
}
