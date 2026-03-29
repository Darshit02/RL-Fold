import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RL-Fold — Protein Design Lab',
  description: 'Reinforcement learning guided protein structure optimization',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}