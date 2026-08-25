import { MapPin, Package, CheckCircle, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const { pathname } = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <nav className="bg-surface border-t border-border flex justify-around p-2 sticky bottom-0">
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
          isActive('/') ? 'text-primary' : 'text-muted'
        }`}
      >
        <MapPin className="w-5 h-5" />
        <span className="text-xs font-medium">Accueil</span>
      </Link>
      <Link
        to="/deliveries"
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
          isActive('/deliveries') ? 'text-primary' : 'text-muted'
        }`}
      >
        <Package className="w-5 h-5" />
        <span className="text-xs font-medium">Livraisons</span>
      </Link>
      <Link
        to="/profile"
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
          isActive('/profile') ? 'text-primary' : 'text-muted'
        }`}
      >
        <CheckCircle className="w-5 h-5" />
        <span className="text-xs font-medium">Profil</span>
      </Link>
      <Link
        to="/login"
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors text-muted`}
      >
        <LogOut className="w-5 h-5" />
        <span className="text-xs font-medium">Déconnexion</span>
      </Link>
    </nav>
  )
}
