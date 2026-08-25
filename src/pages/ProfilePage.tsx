import { User, LogOut } from 'lucide-react'
import { logout } from '../services/auth'

interface ProfilePageProps {
  onLogout: () => void
}

export default function ProfilePage({ onLogout }: ProfilePageProps) {
  const handleLogout = () => {
    logout()
    onLogout()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mon profil</h2>
      <div className="bg-surface border border-border rounded-2xl p-6 text-center shadow-sm">
        <User className="w-12 h-12 text-muted mx-auto mb-3" />
        <p className="text-muted">Connecté en tant que livreur.</p>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-error/10 text-error rounded-xl text-sm font-semibold inline-flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
