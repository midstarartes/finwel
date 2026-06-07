import Sidebar from '@/components/Layout/Sidebar'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1e' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto lg:pl-0 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
