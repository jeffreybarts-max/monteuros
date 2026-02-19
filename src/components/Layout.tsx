import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Thermometer, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/warmtepompscan', icon: Thermometer, label: 'Warmtepompscan' },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-orange-600">MonteurOS</h1>
          <p className="text-sm text-gray-500">Barts Installatietechniek</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 w-64">
          <button
            onClick={async () => {
              // Clear mock session from localStorage
              localStorage.removeItem('monteuros_mock_session')
              // Also try to sign out from Supabase (if configured)
              await supabase.auth.signOut()
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600"
          >
            <LogOut size={20} />
            <span>Uitloggen</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
