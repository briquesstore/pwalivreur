import { useState } from 'react'
import { Phone, Lock, AlertCircle } from 'lucide-react'
import { login } from '../services/auth'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      await login({ identifier: phone, password })
      window.location.href = '/'
    } catch (e: any) {
      setLoginError(e.message || 'Identifiants incorrects')
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.png" alt="Briques.store" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-text">Briques.store Livreur</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-muted mb-1 block">Téléphone ou email</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="07 xx xx xx xx"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted mb-1 block">Mot de passe</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {loginError && (
            <div className="p-3 bg-error/10 text-error rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {loginError}
            </div>
          )}
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-60"
          >
            {loginLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
