export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen"
      style={{ background: 'var(--bg-base)' }}>
      {children}
    </main>
  )
}
