import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/clerk-react'
import { animate } from 'animejs'
import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    /* redirect already-authed users */
  },
  component: LoginPage,
})

function LoginPage() {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current) return
    animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 700,
      ease: 'outExpo',
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center dark bg-background">
      {/* LE indigo background with grid texture */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, oklch(0.77 0.14 188) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* LE logo / wordmark */}
        <div className="text-center mb-10">
          <h1 className="le-headline text-5xl font-extrabold text-white mb-2">
            Let's <span>Enterprise</span>
          </h1>
          <p className="text-white/60 font-medium">Alumni Network</p>
        </div>

        <div ref={cardRef} className="opacity-0">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: 'oklch(0.58 0.22 257)',
                colorBackground: 'oklch(0.14 0.12 284)',
                colorText: 'oklch(0.97 0.002 248)',
                colorInputBackground: 'oklch(0.17 0.10 284)',
                colorInputText: 'oklch(0.97 0.002 248)',
                borderRadius: '0.5rem',
                fontFamily: 'Prompt, system-ui, sans-serif',
              },
            }}
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  )
}
