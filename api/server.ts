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

    try {
      // Load the API tree inside the request boundary. If a deployment-specific
      // dependency or environment issue occurs, Vercel can still return JSON
      // instead of terminating the function before our error handler runs.
      const [{ fetchRequestHandler }, { appRouter }, { createContext }] = await Promise.all([
        import('@trpc/server/adapters/fetch'),
        import('../server/routers/_app'),
        import('../server/context'),
      ])
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
