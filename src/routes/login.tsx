import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { animate } from 'animejs'
import { ArrowLeft, ArrowRight, Network, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/auth'
import { trpc } from '@/lib/trpc'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { readStoredSession } from '@/lib/auth-storage'
import { BrandLogo } from '@/components/brand-logo'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (readStoredSession()) throw redirect({ to: '/dashboard' })
  },
  component: LoginPage,
})

function LoginPage() {
  const cardRef = useRef<HTMLDivElement>(null)
  const { login } = useAuth()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [showResetHelp, setShowResetHelp] = useState(false)

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: ({ token, user }) => {
      queryClient.clear()
      login(token, user)
      window.location.assign('/dashboard')
    },
    onError: (e) => setError(e.message),
  })

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: ({ token, user }) => {
      queryClient.clear()
      login(token, user)
      window.location.assign('/dashboard')
    },
    onError: (e) => setError(e.message),
  })

  useEffect(() => {
    if (!cardRef.current) return
    animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 650,
      ease: 'outExpo',
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (mode === 'login') {
      loginMutation.mutate({ email: form.email.trim(), password: form.password })
    } else {
      registerMutation.mutate({ name: form.name.trim(), email: form.email.trim(), password: form.password })
    }
  }

  const isPending = loginMutation.isPending || registerMutation.isPending

  return (
    <div className="dark min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="le-atmosphere" aria-hidden="true" />
      <div className="le-page-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:flex flex-col justify-between p-10 xl:p-14 border-r border-white/[0.07] relative overflow-hidden">
          <Link to="/" className="w-fit le-focus-ring rounded-xl">
            <BrandLogo />
          </Link>

          <div className="max-w-xl">
            <div className="le-kicker">Members only</div>
            <h1 className="mt-6 text-5xl xl:text-6xl font-extrabold tracking-[-0.05em] leading-[1.02]">
              Your network gets
              <span className="block le-gradient-text">more valuable</span>
              every year.
            </h1>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
              Reconnect with peers, find your next collaborator, discover opportunities, and give back to the community that helped you begin.
            </p>

            <div className="mt-9 grid grid-cols-2 gap-3 max-w-md">
              <div className="le-glass rounded-2xl p-4">
                <Network className="h-4 w-4 text-accent mb-5" />
                <p className="text-2xl font-extrabold">120+</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] mt-1">Members</p>
              </div>
              <div className="le-glass rounded-2xl p-4">
                <Sparkles className="h-4 w-4 text-primary mb-5" />
                <p className="text-2xl font-extrabold">4</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.14em] mt-1">Cohorts</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.15em]">Pune roots · Global ambitions</p>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-10 lg:px-14 relative">
          <div className="w-full max-w-[440px]">
            <div className="flex lg:hidden items-center justify-between mb-10">
              <Link to="/" className="le-focus-ring rounded-xl">
                <BrandLogo className="w-[138px]" showNetworkLabel={false} />
              </Link>
              <Link to="/" className="h-9 w-9 rounded-full border border-white/10 grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div ref={cardRef}>
              <div className="mb-8">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/15 border border-white/10 grid place-items-center mb-6">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                </div>
                <p className="le-kicker">Secure member access</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.04em] mt-3">
                  {mode === 'login' ? 'Welcome back.' : 'Join the network.'}
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {mode === 'login' ? 'Sign in to continue to your community.' : 'Create your profile and meet your people.'}
                </p>
              </div>

              <div className="le-glass rounded-[1.75rem] p-2">
                <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-black/10">
                  {(['login', 'register'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => { setMode(item); setError(null) }}
                      className={`h-10 rounded-xl text-sm font-semibold transition-all le-focus-ring ${
                        mode === item
                          ? 'bg-white text-slate-950 shadow-lg'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item === 'login' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
                  {mode === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs text-muted-foreground">Full name</Label>
                      <Input
                        id="name"
                        autoComplete="name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs text-muted-foreground">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setShowResetHelp((visible) => !visible)}
                          className="text-[10px] font-semibold text-accent hover:text-accent/80"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
                      value={form.password}
                      onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                      required
                      minLength={mode === 'register' ? 8 : undefined}
                    />
                  </div>

                  {showResetHelp && mode === 'login' && (
                    <p className="text-xs text-muted-foreground bg-white/[0.035] border border-white/[0.07] rounded-xl px-3.5 py-3 leading-relaxed">
                      Contact your LE administrator for a secure temporary password. Your previous sessions will be revoked when it is reset.
                    </p>
                  )}

                  {error && (
                    <p role="alert" className="text-sm text-red-300 bg-red-400/[0.08] border border-red-400/15 rounded-xl px-3.5 py-3">
                      {error}
                    </p>
                  )}

                  <Button type="submit" size="lg" className="w-full mt-1" disabled={isPending}>
                    {isPending ? 'Please wait…' : mode === 'login' ? 'Enter the network' : 'Create my account'}
                    {!isPending && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </form>
              </div>

              <p className="mt-6 text-center text-[10px] text-muted-foreground/55 leading-relaxed">
                By continuing, you agree to keep this community respectful and useful.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
