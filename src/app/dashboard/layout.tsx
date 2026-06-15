'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Share2, LayoutDashboard, FileText, Calendar,
  BarChart2, Settings, LogOut, Menu, X, User
} from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
}

const navItems = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/dashboard/posts', label: 'Publicações', icon: FileText },
  { href: '/dashboard/schedule', label: 'Agendamentos', icon: Calendar },
  { href: '/dashboard/analytics', label: 'Métricas', icon: BarChart2 },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) setUser(data.user)
        else router.push('/login')
      })
      .catch(() => router.push('/login'))
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Até logo!')
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-pink-500 border-t-transparent" />
      </div>
    )
  }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-gray-900 border-r border-white/10">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl instagram-gradient">
            <Share2 size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">UpGrid</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'instagram-gradient text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-full instagram-gradient flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-gray-500 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all w-full text-sm"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 z-20">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gray-900">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg instagram-gradient">
              <Share2 size={16} className="text-white" />
            </div>
            <span className="font-bold">UpGrid</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
