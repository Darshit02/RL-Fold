'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Image from 'next/image'
import LOGO from "../../../public/logo/logo.svg"

const AA_CHARS = 'ACDEFGHIKLMNPQRSTVWY'

function randomAA() {
  return AA_CHARS[Math.floor(Math.random() * AA_CHARS.length)]
}

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

function HelixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      const points = 80
      const cx = w / 2
      const amplitude = Math.min(w * 0.18, 120)
      const spacing = h / points

      for (let i = 0; i < points; i++) {
        const y = i * spacing
        const phase = (i / points) * Math.PI * 6 + t
        const x1 = cx + Math.sin(phase) * amplitude
        const x2 = cx + Math.sin(phase + Math.PI) * amplitude
        const progress = i / points
        const opacity = Math.sin(progress * Math.PI) * 0.6 + 0.1

        // Strand 1
        ctx.beginPath()
        ctx.arc(x1, y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`
        ctx.fill()

        // Strand 2
        ctx.beginPath()
        ctx.arc(x2, y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(52, 211, 153, ${opacity * 0.7})`
        ctx.fill()

        // Connecting rungs every 5
        if (i % 5 === 0) {
          ctx.beginPath()
          ctx.moveTo(x1, y)
          ctx.lineTo(x2, y)
          ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.3})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      // Floating particles
      for (let i = 0; i < 20; i++) {
        const px = (Math.sin(t * 0.3 + i * 1.5) * 0.5 + 0.5) * w
        const py = (Math.cos(t * 0.2 + i * 2.1) * 0.5 + 0.5) * h
        const size = Math.sin(t + i) * 1 + 1.5
        ctx.beginPath()
        ctx.arc(px, py, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16, 185, 129, 0.15)`
        ctx.fill()
      }

      t += 0.012
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

function MorphingSequence() {
  const [seq, setSeq] = useState('MKTAYIAKQRQISFVKSHFSRQLEERLGL')
  const [highlight, setHighlight] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const positions = Array.from({ length: 3 }, () => Math.floor(Math.random() * seq.length))
      setHighlight(positions)
      setSeq(prev => {
        const arr = prev.split('')
        positions.forEach(p => { arr[p] = randomAA() })
        return arr.join('')
      })
      setTimeout(() => setHighlight([]), 400)
    }, 600)
    return () => clearInterval(interval)
  }, [seq.length])

  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      color: 'var(--text-muted)',
      letterSpacing: '0.15em',
      lineHeight: 2,
      wordBreak: 'break-all',
    }}>
      {seq.split('').map((char, i) => (
        <span key={i} style={{
          color: highlight.includes(i) ? 'var(--accent)' : 'var(--text-muted)',
          transition: 'color 0.2s',
          textShadow: highlight.includes(i) ? '0 0 12px var(--accent)' : 'none',
        }}>
          {char}
        </span>
      ))}
      <span style={{ color: 'var(--accent)', animation: 'pulse-dot 1s infinite' }}>█</span>
    </div>
  )
}

function TerminalDemo() {
  const lines = [
    { text: '$ rlfold init --target thermostability', color: 'var(--text-secondary)', delay: 0 },
    { text: '> Initializing RL environment...', color: 'var(--text-muted)', delay: 600 },
    { text: '> Loading ESMFold predictor', color: 'var(--text-muted)', delay: 1000 },
    { text: '> PyRosetta energy function: REF15', color: 'var(--text-muted)', delay: 1400 },
    { text: '> PPO agent ready. GNN policy loaded.', color: 'var(--text-muted)', delay: 1800 },
    { text: '', delay: 2200 },
    { text: 'Episode  1 | reward: 0.312 | pLDDT: 42.1 | ΔE: -23.4', color: 'var(--cyan)', delay: 2600 },
    { text: 'Episode  8 | reward: 0.481 | pLDDT: 55.8 | ΔE: -61.2', color: 'var(--cyan)', delay: 3000 },
    { text: 'Episode 19 | reward: 0.623 | pLDDT: 68.3 | ΔE: -89.7', color: 'var(--cyan)', delay: 3400 },
    { text: 'Episode 31 | reward: 0.741 | pLDDT: 74.9 | ΔE: -112.3', color: 'var(--accent)', delay: 3800 },
    { text: 'Episode 50 | reward: 0.891 | pLDDT: 82.4 | ΔE: -134.8', color: 'var(--accent)', delay: 4200 },
    { text: '', delay: 4600 },
    { text: '> Structure saved: output_job_a4f9.pdb', color: 'var(--accent)', delay: 5000 },
    { text: '> pLDDT improvement: +95.7% over baseline', color: 'var(--accent)', delay: 5400 },
  ]

  const [visible, setVisible] = useState<number[]>([])

  useEffect(() => {
    lines.forEach((line, i) => {
      setTimeout(() => setVisible(prev => [...prev, i]), line.delay)
    })
  }, [])

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginLeft: 8 }}>
          rlfold — terminal
        </span>
      </div>
      <div style={{ padding: '20px 24px', minHeight: 320, fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.8 }}>
        {lines.map((line, i) => (
          <div key={i} style={{
            color: line.color || 'var(--text-secondary)',
            opacity: visible.includes(i) ? 1 : 0,
            transform: visible.includes(i) ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity 0.3s, transform 0.3s',
          }}>
            {line.text || '\u00A0'}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ value, label, suffix = '', start }: { value: number; label: string; suffix?: string; start: boolean }) {
  const count = useCountUp(value, 2000, start)
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '36px', fontWeight: 500, color: 'var(--accent)', lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 8, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
    </div>
  )
}

const FEATURES = [
  {
    tag: 'RL Core',
    title: 'PPO agent with graph neural network policy',
    body: 'Treats protein design as a Markov decision process. Each amino acid mutation is an action. The GNN policy encodes spatial relationships between residues — something flat networks can\'t see.',
    accent: 'var(--accent)',
  },
  {
    tag: 'Structure',
    title: 'ESMFold in the reward loop',
    body: 'Every mutation gets scored by ESMFold in under 2 seconds. pLDDT confidence becomes a dense reward signal — solving the sparse reward problem that kills naive RL approaches.',
    accent: 'var(--cyan)',
  },
  {
    tag: 'Scoring',
    title: 'PyRosetta energy as ground truth',
    body: 'Rosetta REF15 scorefunction provides thermodynamic stability scores. Lower energy = more stable protein. Combined with pLDDT for a composite reward that captures real biochemistry.',
    accent: 'var(--accent)',
  },
  {
    tag: 'Generative',
    title: 'RFDiffusion as the exploration engine',
    body: 'Instead of random mutations, the RL agent conditions RFDiffusion to propose structurally informed candidates. Guided generative search across an astronomically large sequence space.',
    accent: 'var(--cyan)',
  },
  {
    tag: 'Infra',
    title: 'Async pipeline — submit and walk away',
    body: 'Jobs queue via Celery and Redis. GPU workers train independently. Live metrics stream over WebSocket. Your dashboard updates in real time while you do other work.',
    accent: 'var(--accent)',
  },
]

export default function LandingPage() {
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--bg-base), transparent 15%)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{
            
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
           <Image
           src={LOGO}
           alt='logo'
           height={200}
           width={200}
           />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--accent)', background: 'var(--accent-dim)',
            padding: '2px 6px', borderRadius: 4, marginLeft: 4,
          }}>
            BETA
          </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* <ThemeToggle /> */}
          <Link href="/login" className='cursor-pointer' style={{
            color: 'var(--text-secondary)', textDecoration: 'none',
            padding: '6px 14px', borderRadius: 6,
            border: '1px solid var(--border)',
            transition: 'border-color 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            Sign in
          </Link>
          <Link href="/register" className='cursor-pointer' style={{
            color: 'var(--bg-base)', textDecoration: 'none',
            padding: '6px 14px', borderRadius: 6,
            background: 'var(--accent)',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            Get started
          </Link>
        </div>
      </nav>
      <section style={{
        minHeight: '100vh', display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0, paddingTop: 56,
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 60px 80px 80px',
          borderRight: '1px solid var(--border)',
        }}>
          <div className="fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--accent)', letterSpacing: '0.12em',
              background: 'var(--accent-dim)',
              padding: '5px 12px', borderRadius: 20,
              border: '1px solid rgba(0,212,170,0.2)',
              marginBottom: 32,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
              REINFORCEMENT LEARNING × PROTEIN DESIGN
            </div>
          </div>

          <h1 className="fade-up" style={{
            animationDelay: '0.2s', opacity: 0,
            fontSize: 'clamp(40px, 4vw, 70px)',
            fontWeight: 500, lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: 24,
          }}>
            Design  <span style={{ color: 'var(--accent)' }}> proteins {" "}
            </span>
            that
            <span style={{ color: 'var(--accent)' }}> evolution</span>{" "}
            never tried.
          </h1>

          <p className="fade-up" style={{
            animationDelay: '0.3s', opacity: 0,
            fontSize: '15px', color: 'var(--text-secondary)',
            lineHeight: 1.7, maxWidth: 650, marginBottom: 40,
          }}>
            RL-Fold uses a PPO agent with a graph neural network policy to navigate protein sequence space — guided by ESMFold structure prediction and PyRosetta thermodynamic scoring.
          </p>

          <div className="fade-up" style={{
            animationDelay: '0.4s', opacity: 0,
            display: 'flex', gap: 12, flexWrap: 'wrap',
          }}>
            <Link href="/register" className='cursor-pointer' style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--accent)', color: '#0a0a0a',
              padding: '12px 24px', borderRadius: 8,
              textDecoration: 'none', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              Start designing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/login" className='cursor-pointer' style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: 'var(--text-secondary)',
              padding: '8px 20px', borderRadius: 8,
              border: '1px solid var(--border)', textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              View demo
            </Link>
          </div>

          <div className="fade-up" style={{
            animationDelay: '0.5s', opacity: 0,
            marginTop: 48, paddingTop: 32,
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12, letterSpacing: '0.08em' }}>
              LIVE SEQUENCE MUTATION
            </div>
            <MorphingSequence />
          </div>
        </div>
        <div style={{
          position: 'relative',
          background: 'var(--bg-surface)',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0,212,170,0.04) 0%, transparent 70%)',
          }} />
          <HelixCanvas />
          <div className="fade-up" style={{
            animationDelay: '0.6s', opacity: 0,
            position: 'absolute', top: 80, right: 40,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>pLDDT SCORE</div>
            <div style={{ fontSize: '24px', color: 'var(--accent)', fontWeight: 500, marginTop: 2 }}>82.4</div>
            <div style={{ fontSize: '10px', color: '#10b981', marginTop: 2 }}>↑ +95.7% from baseline</div>
          </div>

          <div className="fade-up" style={{
            animationDelay: '0.8s', opacity: 0,
            position: 'absolute', bottom: 120, left: 40,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ROSETTA ENERGY</div>
            <div style={{ fontSize: '24px', color: '#22d3ee', fontWeight: 500, marginTop: 2 }}>−134.8</div>
            <div style={{ fontSize: '10px', color: '#10b981', marginTop: 2 }}>↓ REF15 score</div>
          </div>

          <div className="fade-up" style={{
            animationDelay: '1s', opacity: 0,
            position: 'absolute', bottom: 80, right: 40,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 10, padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>EPISODE</div>
            <div style={{ fontSize: '24px', color: 'var(--text-primary)', fontWeight: 500, marginTop: 2 }}>50/50</div>
            <div style={{ fontSize: '10px', color: 'var(--accent)', marginTop: 2 }}>● completed</div>
          </div>
        </div>
      </section>
      <section ref={statsRef} style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '60px 80px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 40,
      }}>
        <StatCard value={20} suffix="+" label="Amino acids in action space" start={statsVisible} />
        <StatCard value={95} suffix="%" label="pLDDT improvement vs baseline" start={statsVisible} />
        <StatCard value={50} label="RL episodes per design job" start={statsVisible} />
        <StatCard value={3} label="Scoring models in reward fn" start={statsVisible} />
      </section>
      <section style={{ padding: '100px 80px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 16,
          }}>
            LIVE DEMO
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 500,
            letterSpacing: '-0.02em', color: 'var(--text-primary)',
            marginBottom: 12, lineHeight: 1.15,
          }}>
            Watch the agent learn.
          </h2>
          <p style={{
            fontSize: '14px', color: 'var(--text-secondary)',
            marginBottom: 48, maxWidth: 560, lineHeight: 1.7,
          }}>
            Each episode the PPO agent mutates residues, ESMFold predicts the structure, PyRosetta scores stability — reward flows back, policy improves. In 50 episodes, pLDDT climbs from 42 to 82.
          </p>
          <TerminalDemo />
        </div>
      </section>
      <section style={{ padding: '100px 80px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 16,
        }}>
          HOW IT WORKS
        </div>
        <h2 style={{
          fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 500,
          letterSpacing: '-0.02em', color: 'var(--text-primary)',
          marginBottom: 64, lineHeight: 1.15,
        }}>
          Every component engineered for <br /> real science.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr',
              gap: 40,
              padding: '32px 25px',
              borderTop: '1px solid var(--border)',
              cursor: 'default',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: f.accent, letterSpacing: '0.1em',
                paddingTop: 4,
              }}>
                {f.tag}
              </div>
              <div>
                <div style={{
                  fontSize: '20px', fontWeight: 500,
                  color: 'var(--text-primary)', marginBottom: 8,
                  letterSpacing: '-0.01em',
                }}>
                  {f.title}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 560 }}>
                  {f.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{
        padding: '120px 80px',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 24,
        }}>
          GET STARTED FREE
        </div>
        <h2 style={{
          fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 500,
          letterSpacing: '-0.03em', color: 'var(--text-primary)',
          lineHeight: 1.1, marginBottom: 20, maxWidth: 600,
        }}>
          The sequence space is vast.<br />
          <span style={{ color: 'var(--accent)' }}>Start exploring it.</span>
        </h2>
        <p style={{
          fontSize: '14px', color: 'var(--text-secondary)',
          marginBottom: 40, maxWidth: 440, lineHeight: 1.7,
        }}>
          Submit your first protein design job in under 2 minutes. No credit card. No setup. Just science.
        </p>
        <Link href="/register" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'var(--accent)', color: '#0a0a0a',
          padding: '14px 32px', borderRadius: 8,
          fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500,
          textDecoration: 'none', transition: 'background 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        >
          Create free account
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <div style={{
          marginTop: 80, paddingTop: 40,
          borderTop: '1px solid var(--border)',
          width: '100%', maxWidth: 600,
          display: 'flex', justifyContent: 'center', gap: 32,
        }}>
          {['Privacy Policy', 'Terms of Service', 'Documentation', 'GitHub'].map(item => (
            <span key={item} style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--text-muted)', cursor: 'pointer',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {item}
            </span>
          ))}
        </div>
      </section>

    </div>
  )
}
