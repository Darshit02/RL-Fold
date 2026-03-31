import { useState } from "react"

export const NewsletterForm = () => {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!email || !/\S+@\S+\.\S+/.test(email)) return
        setLoading(true)
        await new Promise(r => setTimeout(r, 800))
        setSubmitted(true)
        setLoading(false)
    }

    if (submitted) return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '14px 24px',
            borderRadius: 8,
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: '#10b981',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
        }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            You're on the list. We'll be in touch!
        </div>
    )

    return (
        <form onSubmit={handleSubmit} style={{
            display: 'flex',
            gap: 10,
            maxWidth: 420,
            margin: '0 auto',
        }}>
            <input
                type="email"
                placeholder="you@lab.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                    flex: 1,
                    padding: '11px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <button
                type="submit"
                disabled={loading}
                style={{
                    padding: '11px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--accent)',
                    color: '#0a0a0a',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'background 0.15s',
                    whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)' }}
            >
                {loading ? 'Sending...' : 'Notify me'}
            </button>
        </form>
    )
}