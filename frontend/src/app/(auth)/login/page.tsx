'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Dna,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { authApi } from '@/lib/api'
import { useAppStore } from '@/store'
import { toast } from "sonner"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setToken, setUser } = useAppStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (searchParams.get('registered')) {
      toast.success('Account created successfully! Please sign in.')
    }
  }, [searchParams])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setServerError('')
    try {
      const res = await authApi.login(form)
      setToken(res.data.access_token)
      const me = await authApi.me()
      setUser(me.data)
      router.push('/dashboard')
    } catch (err: any) {
      setServerError(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    error: errors[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(p => ({ ...p, [key]: e.target.value }))
      setErrors(p => ({ ...p, [key]: '' }))
    },
  })

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-text-primary">
      {/* Left Side: Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        
        <Link href="/" className="flex flex-col justify-center items-center gap-4 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center transition-transform group-hover:scale-105">
            <Dna className="w-6 h-6 text-background" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-text-primary">
            RL-Fold
          </span>
        </Link>
        <div className='px-6 py-5 border rounded-xl'>
          <div className="w-full max-md relative z-10">
            {/* Header */}
            <div className="mb-10 text-center md:text-left">

              <h1 className="text-3xl font-bold text-text-primary mb-3">
                Welcome Back
              </h1>
              <p className="text-text-secondary">
                Sign in to continue your protein design research.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-[11px] font-mono text-text-secondary tracking-widest uppercase px-1">EMAIL</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@lab.com"
                  autoComplete="email"
                  className={`${errors.email ? 'border-red-500' : ''} h-11 rounded-md`}
                  value={field('email').value}
                  onChange={field('email').onChange}
                />
                {errors.email && <span className="text-xs text-red-500 px-1">{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[11px] font-mono text-text-secondary tracking-widest uppercase">PASSWORD</Label>
                  <Link href="/forgot-password" className="text-[11px] text-accent hover:underline font-medium transition-colors">
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${errors.password ? 'border-red-500' : ''} h-11 rounded-md`}
                  value={field('password').value}
                  onChange={field('password').onChange}
                />
                {errors.password && <span className="text-xs text-red-500 px-1">{errors.password}</span>}
              </div>

              {serverError && (
                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{serverError}</span>
                </div>
              )}

              <Button type="submit" disabled={loading} size="lg" className="w-full h-12 mt-4 rounded-md cursor-pointer">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className='h-4 w-4 animate-spin'/>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign in
                  </span>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-accent font-semibold hover:text-accent-hover transition-colors">
                Register now
              </Link>
            </div>

         
          </div>
        </div>
      </div>

      {/* Right Side: Visual/Branding */}
      <div className="hidden md:flex w-1/2 bg-surface border-l border-border relative overflow-hidden items-center justify-center">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(var(--accent) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className=" p-12 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Revolutionizing protein folding
            </div>

            <h2 className="text-4xl font-bold text-text-primary">
              Design molecules with <span className="text-accent italic">precision</span>.
            </h2>

            <p className="text-lg text-text-secondary leading-relaxed">
              Leverage state-of-the-art reinforcement learning to explore the <br /> protein landscape like never before.
            </p>

            <div className="grid grid-cols-1 gap-6 pt-4">
              {[
                { icon: ShieldCheck, title: "Enterprise Security", desc: "Your data is encrypted and protected with industry standards." },
                { icon: Globe, title: "Global Collaboration", desc: "Share findings and collaborate with researchers worldwide." },
                { icon: Zap, title: "High Performance", desc: "Scale your simulations across our distributed cloud infrastructure." }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-elevated border border-border flex items-center justify-center transition-all group-hover:border-accent/50 group-hover:bg-accent/5">
                    <feature.icon className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-text-primary group-hover:text-accent transition-colors">{feature.title}</h3>
                    <p className="text-sm text-text-muted">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -right-20 w-64 h-64 rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute bottom-1/4 -left-20 w-64 h-64 rounded-full bg-accent/5 blur-[80px]" />
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

