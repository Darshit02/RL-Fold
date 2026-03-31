'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Image from 'next/image'
import LOGO from "../../../public/logo/logo.svg"
import { NewsletterForm } from './news-letter'

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

const TEAM = [
  {
    name: 'Darshit',
    role: 'ML Engineer & Founder',
    bio: 'Built RL-Fold from scratch — RL pipeline, protein scoring, full-stack. Passionate about the intersection of AI and biology.',
    initials: 'D',
    links: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
  },
]

const FAQS = [
  {
    q: 'What is RL-Fold?',
    a: 'RL-Fold is a reinforcement learning system for protein design. It trains a PPO agent with a graph neural network policy to navigate the vast space of amino acid sequences, guided by ESMFold structure prediction and PyRosetta thermodynamic scoring.',
  },
  {
    q: 'Do I need a biology background to use it?',
    a: 'No. You just need an amino acid sequence — a string of letters like MKTAYIAKQR. RL-Fold handles all the structural biology and scoring automatically. The dashboard shows results in plain terms: pLDDT confidence and energy score.',
  },
  {
    q: 'How long does a design job take?',
    a: 'In simulation mode, a 50-episode job takes about 30 seconds. With real ESMFold + PyRosetta on GPU, each episode takes 2-5 seconds — so 50 episodes runs in roughly 2-4 minutes.',
  },
  {
    q: 'Is my sequence data private?',
    a: 'Yes. Your sequences are stored only in your private database instance. We do not share, sell, or use your protein sequences for any purpose other than running your design jobs.',
  },
  {
    q: 'Can I use my own protein structure as a target?',
    a: 'Yes — the reward function supports RMSD-based scoring against a target PDB structure. Upload your target structure and the RL agent will optimise sequences that fold toward it.',
  },
  {
    q: 'What is pLDDT and why does it matter?',
    a: 'pLDDT (predicted Local Distance Difference Test) is a per-residue confidence score from ESMFold. Values above 70 indicate a well-folded, confident structure. It is the primary signal we use to evaluate whether a designed protein is likely to fold correctly.',
  },
]

const ROADMAP = [
  {
    phase: 'Phase 1',
    status: 'completed',
    title: 'Core RL pipeline',
    items: ['PPO agent + GNN policy', 'Gymnasium environment', 'Composite reward function', 'Celery async job queue'],
  },
  {
    phase: 'Phase 2',
    status: 'completed',
    title: 'Full stack app',
    items: ['FastAPI backend + JWT auth', 'Next.js dashboard', 'Live WebSocket metrics', '3D PDB structure viewer'],
  },
  {
    phase: 'Phase 3',
    status: 'active',
    title: 'Real ML integration',
    items: ['ESMFold structure prediction', 'PyRosetta REF15 scoring', 'RFDiffusion backbone generation', 'ProteinMPNN inverse folding'],
  },
  {
    phase: 'Phase 4',
    status: 'upcoming',
    title: 'Advanced features',
    items: ['Multi-objective optimization', 'Antibody design mode', 'Batch job processing', 'API access for researchers'],
  },
  {
    phase: 'Phase 5',
    status: 'upcoming',
    title: 'Research platform',
    items: ['Public benchmark datasets', 'Experiment sharing', 'Collaborative design', 'Paper-ready exports'],
  },
]

const HOW_TO_USE = [
  {
    step: '01',
    title: 'Paste your sequence',
    body: 'Enter any amino acid sequence using single-letter codes. Use one of our example sequences or your own protein of interest.',
    code: 'LSDEDFKAVFGMTRSAFANLPLWKQQNLKKEKGLF',
  },
  {
    step: '02',
    title: 'Choose a target property',
    body: 'Select what you want to optimise for — thermostability, solubility, binding affinity, or general stability.',
    code: 'target: thermostability',
  },
  {
    step: '03',
    title: 'Watch the agent learn',
    body: 'The PPO agent runs 50 episodes, mutating residues and scoring each variant with ESMFold + PyRosetta. Watch the reward curve climb in real time.',
    code: 'Episode 31 | pLDDT: 74.9 | reward: 0.741',
  },
  {
    step: '04',
    title: 'Download your structure',
    body: 'When complete, download the optimised PDB file and view the 3D structure colored by pLDDT confidence — just like AlphaFold.',
    code: 'output_job_a4f9.pdb → pLDDT: 82.4',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        cursor: 'pointer',
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 0',
        gap: 16,
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {q}
        </span>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'transform 0.2s, border-color 0.15s',
          transform: open ? 'rotate(45deg)' : 'none',
          color: open ? 'var(--accent)' : 'var(--text-muted)',
          borderColor: open ? 'var(--accent)' : 'var(--border)',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      {open && (
        <div style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          paddingBottom: 20,
          maxWidth: 640,
        }}>
          {a}
        </div>
      )}
    </div>
  )
}



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
          <Link href="/login" className='cursor-pointer font-medium px-2 py-1 text-md rounded-md' 
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            Sign in
          </Link>
          <div className="">|</div>
          <Link href="/register" className='cursor-pointer bg-primary font-medium px-2 py-1 text-md rounded-md'
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
      {/* HOW TO USE */}
      <section style={{ padding: '100px 80px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 16,
          }}>
            QUICK START
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 500,
            letterSpacing: '-0.02em', color: 'var(--text-primary)',
            marginBottom: 64, lineHeight: 1.15, maxWidth: 480,
          }}>
            From sequence to structure in 4 steps.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {HOW_TO_USE.map((step, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 1fr',
                gap: 40,
                padding: '36px 0',
                borderTop: '1px solid var(--border)',
                alignItems: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '32px',
                  fontWeight: 500,
                  color: 'var(--border-focus)',
                  lineHeight: 1,
                }}>
                  {step.step}
                </div>
                <div>
                  <div style={{
                    fontSize: '16px', fontWeight: 500,
                    color: 'var(--text-primary)', marginBottom: 10,
                  }}>
                    {step.title}
                  </div>
                  <div style={{
                    fontSize: '13px', color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                  }}>
                    {step.body}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--accent)',
                  background: 'var(--accent-dim)',
                  border: '1px solid rgba(0,212,170,0.15)',
                  borderRadius: 8,
                  padding: '14px 18px',
                  letterSpacing: '0.05em',
                  wordBreak: 'break-all',
                }}>
                  {step.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section style={{
        padding: '80px 80px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 40,
            textAlign: 'center',
          }}>
            BUILT WITH
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {[
              { name: 'PyTorch',          role: 'Deep learning',         color: '#ee4c2c' },
              { name: 'Stable-Baselines3',role: 'PPO algorithm',          color: '#00d4aa' },
              { name: 'ESMFold',          role: 'Structure prediction',   color: '#1877f2' },
              { name: 'PyRosetta',        role: 'Energy scoring',         color: '#7c3aed' },
              { name: 'FastAPI',          role: 'Backend API',            color: '#009688' },
              { name: 'Next.js',          role: 'Frontend',               color: 'var(--text-primary)' },
              { name: 'PostgreSQL',       role: 'Database',               color: '#336791' },
              { name: 'Redis',            role: 'Queue + pub/sub',        color: '#dc382d' },
              { name: 'Celery',           role: 'Task workers',           color: '#37b34a' },
              { name: 'Docker',           role: 'Containerisation',       color: '#2496ed' },
              { name: 'RFDiffusion',      role: 'Structure generation',   color: '#f59e0b' },
              { name: 'Gymnasium',        role: 'RL environment',         color: '#00d4aa' },
            ].map((tech, i) => (
              <div key={i} style={{
                padding: '20px 24px',
                background: 'var(--bg-surface)',
                borderRight: (i + 1) % 4 !== 0 ? '1px solid var(--border)' : 'none',
                borderBottom: i < 8 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
              >
                <div style={{
                  fontSize: '13px', fontWeight: 500,
                  color: tech.color,
                  marginBottom: 4,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {tech.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {tech.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section style={{ padding: '100px 80px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 16,
          }}>
            ROADMAP
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 500,
            letterSpacing: '-0.02em', color: 'var(--text-primary)',
            marginBottom: 64, lineHeight: 1.15,
          }}>
            Where we are. Where we're going.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ROADMAP.map((phase, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: 40,
                padding: '28px 0',
                borderTop: '1px solid var(--border)',
                opacity: phase.status === 'upcoming' ? 0.5 : 1,
                transition: 'opacity 0.15s',
              }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginBottom: 6,
                    letterSpacing: '0.08em',
                  }}>
                    {phase.phase}
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 8px',
                    borderRadius: 20,
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    background: phase.status === 'completed'
                      ? 'rgba(16,185,129,0.1)'
                      : phase.status === 'active'
                      ? 'rgba(0,212,170,0.1)'
                      : 'rgba(136,136,132,0.1)',
                    color: phase.status === 'completed'
                      ? '#10b981'
                      : phase.status === 'active'
                      ? 'var(--accent)'
                      : 'var(--text-muted)',
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: 'currentColor',
                      display: 'inline-block',
                      animation: phase.status === 'active' ? 'pulse-dot 1.5s infinite' : 'none',
                    }}/>
                    {phase.status === 'completed' ? 'Done' : phase.status === 'active' ? 'In progress' : 'Upcoming'}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '15px', fontWeight: 500,
                    color: 'var(--text-primary)', marginBottom: 12,
                  }}>
                    {phase.title}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {phase.items.map((item, j) => (
                      <span key={j} style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        padding: '4px 10px',
                        borderRadius: 20,
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      {/* <section style={{
        padding: '100px 80px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 16,
          }}>
            THE TEAM
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 500,
            letterSpacing: '-0.02em', color: 'var(--text-primary)',
            marginBottom: 64, lineHeight: 1.15,
          }}>
            Built by researchers,<br/>for researchers.
          </h2>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {TEAM.map((member, i) => (
              <div key={i} style={{
                flex: '1 1 280px',
                padding: '28px',
                border: '1px solid var(--border)',
                borderRadius: 12,
                background: 'var(--bg-base)',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '20px', fontWeight: 500,
                  color: 'var(--accent)',
                  marginBottom: 16,
                }}>
                  {member.initials}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {member.name}
                </div>
                <div style={{
                  fontSize: '11px', fontFamily: 'var(--font-mono)',
                  color: 'var(--accent)', marginBottom: 12,
                }}>
                  {member.role}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                  {member.bio}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {Object.entries(member.links).map(([platform, url]) => (
                    <a key={platform} href={url} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                      onMouseEnter={e => {
                        e.currentTarget.style.color = 'var(--accent)'
                        e.currentTarget.style.borderColor = 'var(--accent)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--text-muted)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                      }}
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* QUOTE */}
      <section style={{
        padding: '80px 80px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 760, textAlign: 'center' }}>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            letterSpacing: '0.12em',
            marginBottom: 28,
          }}>
            THE MISSION
          </div>

          {/* Opening quote mark */}
          <div style={{
            fontSize: '80px',
            lineHeight: 0.6,
            color: 'var(--accent)',
            fontFamily: 'Georgia, serif',
            marginBottom: 24,
            opacity: 0.4,
          }}>
            "
          </div>

          <blockquote style={{
            fontSize: 'clamp(20px, 2.8vw, 32px)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            lineHeight: 1.5,
            letterSpacing: '-0.02em',
            margin: '0 0 32px 0',
            fontStyle: 'italic',
          }}>
            If you can write the sequence,{' '}
            <span style={{ color: 'var(--accent)', fontStyle: 'normal', fontWeight: 500 }}>
              you can write the cure.
            </span>{' '}
            Protein design is not just biology — it is programming life itself.
          </blockquote>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
          }}>
            <div style={{
              width: 32, height: 1,
              background: 'var(--border)',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
            }}>
              RL-FOLD MANIFESTO
            </span>
            <div style={{
              width: 32, height: 1,
              background: 'var(--border)',
            }} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '100px 80px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 16,
          }}>
            FAQ
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 500,
            letterSpacing: '-0.02em', color: 'var(--text-primary)',
            marginBottom: 48, lineHeight: 1.15,
          }}>
            Everything you need to know.
          </h2>
          <div>
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
            <div style={{ borderTop: '1px solid var(--border)' }} />
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{
        padding: '80px 80px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'var(--accent)', letterSpacing: '0.12em', marginBottom: 16,
          }}>
            STAY UPDATED
          </div>
          <h2 style={{
            fontSize: 'clamp(25px, 3vw, 35px)', fontWeight: 500,
            letterSpacing: '0.12em', color: 'var(--text-primary)',
            marginBottom: 12, lineHeight: 1.2,
          }}>
            Research updates, straight to your inbox.
          </h2>
          <p style={{
            fontSize: '16px', color: 'var(--text-secondary)',
            marginBottom: 32, lineHeight: 1.7,
          }}>
            Get notified when we ship real ESMFold integration, new design modes, and research results. No spam — ever.
          </p>
          <NewsletterForm />
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
