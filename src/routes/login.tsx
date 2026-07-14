import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { animate } from 'animejs'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/auth'
import { trpc } from '@/lib/trpc'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    const token = localStorage.getItem('le_token')
    if (token) throw { redirect: '/dashboard' }
  },
  component: LoginPage,
})

function LoginPage() {
  const cardRef = useRef<HTMLDivElement>(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: ({ token, user }) => {
      login(token, user)
      void navigate({ to: '/dashboard' })
    },
    onError: (e) => setError(e.message),
  })

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: ({ token, user }) => {
      login(token, user)
      void navigate({ to: '/dashboard' })
    },
    onError: (e) => setError(e.message),
  })

  useEffect(() => {
    if (!cardRef.current) return
    animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 700,
      ease: 'outExpo',
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (mode === 'login') {
      loginMutation.mutate({ email: form.email, password: form.password })
    } else {
      registerMutation.mutate({ name: form.name, email: form.email, password: form.password })
    }
  }

  const isPending = loginMutation.isPending || registerMutation.isPending

  return (
    <div className="min-h-screen flex items-center justify-center dark bg-background text-foreground">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, oklch(0.77 0.14 188) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="text-center mb-10">
          <h1 className="le-headline text-5xl font-extrabold text-white mb-2">
            Let's <span>Enterprise</span>
          </h1>
          <p className="text-white/60 font-medium">Alumni Network</p>
        </div>

        <div ref={cardRef} className="opacity-0">
          <div className="rounded-2xl border border-border/40 bg-card le-surface p-7 shadow-xl">
            <div className="flex gap-1 mb-6 p-1 rounded-lg bg-white/[0.05] border border-border/30">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null) }}
                  className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all duration-150 ${
                    mode === m
                      ? 'bg-accent text-background shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    placeholder="Jay Sahastrabudhe"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jay@letsenterprise.in"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={mode === 'register' ? 'Min 8 characters' : '••••••••'}
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create account'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
