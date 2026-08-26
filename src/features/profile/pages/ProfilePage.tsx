import { useEffect, useState } from 'react'
import { User, LogOut, Truck, Phone, Mail, Package } from 'lucide-react'
import { getMe, getStoredProfile, logout, type DriverProfile } from '@/features/auth/services/auth'

export default function ProfilePage() {
  const [profile, setProfile] = useState<DriverProfile | null>(getStoredProfile)
  const [loading, setLoading] = useState(!profile)

  useEffect(() => {
    async function load() {
      const p = await getMe()
      setProfile(p)
      setLoading(false)
    }
    load()
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mon profil</h2>
      {loading ? (
        <p className="text-muted text-center py-6">Chargement...</p>
      ) : profile ? (
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-text">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-sm text-muted">Livreur</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
              <Phone className="w-5 h-5 text-muted" />
              <div>
                <p className="text-xs text-muted">Téléphone</p>
                <p className="text-sm font-medium text-text">{profile.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
              <Truck className="w-5 h-5 text-muted" />
              <div>
                <p className="text-xs text-muted">Véhicule</p>
                <p className="text-sm font-medium text-text">{profile.vehicleType || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
              <Package className="w-5 h-5 text-muted" />
              <div>
                <p className="text-xs text-muted">Capacité</p>
                <p className="text-sm font-medium text-text">{profile.capacity ? `${profile.capacity} kg` : '-'}</p>
              </div>
            </div>

            {profile.zones && profile.zones.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-background rounded-xl">
                <Mail className="w-5 h-5 text-muted" />
                <div>
                  <p className="text-xs text-muted">Zones</p>
                  <p className="text-sm font-medium text-text">{profile.zones.join(', ')}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: profile.isActive ? '#10B981' : '#6B7280' }} />
              <p className="text-sm font-medium text-text">
                {profile.isActive ? 'Actif' : 'Inactif'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-error/10 text-error rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-6 text-center shadow-sm">
          <User className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">Impossible de charger le profil.</p>
        </div>
      )}
    </div>
  )
}
