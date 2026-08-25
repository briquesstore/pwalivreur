import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import BottomNav from './BottomNav'

export default function Layout() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <div className="flex flex-col h-full">
      {isAuthenticated && (
        <header className="bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Briques.store" className="w-6 h-6" />
            <h1 className="text-lg font-bold">Briques.store Livreur</h1>
          </div>
          <button onClick={logout} className="text-white/90">
            <LogOut className="w-5 h-5" />
          </button>
        </header>
      )}

      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>

      {isAuthenticated && <BottomNav />}
    </div>
  )
}
