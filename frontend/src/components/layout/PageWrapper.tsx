export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  )
}
