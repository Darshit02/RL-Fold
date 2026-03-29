'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Dna,
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { authApi } from '@/lib/api'
import Image from 'next/image'
import LOGO from "../../../../public/logo/logo-single.svg"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const e: Record<string, string> = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address'
    if (!form.username) e.username = 'Username is required'
    else if (form.username.length < 3) e.username = 'Minimum 3 characters'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (!form.confirm) e.confirm = 'Please confirm password'
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setServerError('')
    try {
      await authApi.register({
        email: form.email,
        username: form.username,
        password: form.password,
      })
      router.push('/login?registered=true')
    } catch (err: any) {
      setServerError(err.response?.data?.detail || 'Registration failed')
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
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <div className=" text-center md:text-left">
          <Link href="/" className="flex flex-col justify-center items-center gap-4 mb-8 group">
               <Image
            src={LOGO}
            alt='logo'
            height={70}
            width={70}
          />
          </Link>
          <div className='px-6 py-5 border rounded-xl'>
            <div className="w-full max-w-2xl relative z-10 py-4  ">
              {/* Header */}
              <h1 className="text-3xl font-bold text-text-primary mb-2 ">
                Create account
              </h1>
              <p className="text-text-secondary">
                Start designing proteins with reinforcement learning.
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
                <Label htmlFor="username" className="text-[11px] font-mono text-text-secondary tracking-widest uppercase px-1">USERNAME</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="labname"
                  autoComplete="username"
                  className={`${errors.username ? 'border-red-500' : ''} h-11 rounded-md`}
                  value={field('username').value}
                  onChange={field('username').onChange}
                />
                {errors.username && <span className="text-xs text-red-500 px-1">{errors.username}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-[11px] font-mono text-text-secondary tracking-widest uppercase px-1">PASSWORD</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`${errors.password ? 'border-red-500' : ''} h-11 rounded-md`}
                  value={field('password').value}
                  onChange={field('password').onChange}
                />
                {errors.password && <span className="text-xs text-red-500 px-1">{errors.password}</span>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm" className="text-[11px] font-mono text-text-secondary tracking-widest uppercase px-1">CONFIRM PASSWORD</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`${errors.confirm ? 'border-red-500' : ''} h-11 rounded-md`}
                  value={field('confirm').value}
                  onChange={field('confirm').onChange}
                />
                {errors.confirm && <span className="text-xs text-red-500 px-1">{errors.confirm}</span>}
              </div>

              {serverError && (
                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{serverError}</span>
                </div>
              )}

              <Button type="submit" disabled={loading} size="lg" className="w-full h-12 mt-4 rounded-md cursor-pointer ">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create account
                  </span>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="text-accent font-semibold hover:text-accent-hover transition-colors">
                Sign in
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
