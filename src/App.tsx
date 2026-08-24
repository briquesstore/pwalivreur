import { useEffect, useRef, useState } from 'react'
import { Truck, Package, MapPin, CheckCircle, User, LogOut, Phone, Lock, AlertCircle, PenLine, Camera } from 'lucide-react'
import { isLoggedIn, login, logout } from './services/auth'
import { getDeliveries, verifyCode, startDelivery, arriveDelivery, completeDelivery } from './services/delivery'
import type { CompleteDeliveryPayload } from './services/delivery'
import type { Delivery } from './types'

type Tab = 'home' | 'deliveries' | 'profile'

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED: 'Assignée',
  IN_PROGRESS: 'En route',
  ARRIVED: 'Arrivé',
  CODE_VERIFIED: 'Code OK',
  DELIVERED: 'Livrée',
  FAILED: 'Échec',
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Delivery | null>(null)
  const [code, setCode] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)

  useEffect(() => {
    setAuthenticated(isLoggedIn())
    if (isLoggedIn()) loadDeliveries()
  }, [])

  async function loadDeliveries() {
    setLoading(true)
    setError('')
    try {
      const data = await getDeliveries()
      setDeliveries(data)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur chargement livraisons')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      await login({ identifier: phone, password })
      setAuthenticated(true)
      setActiveTab('deliveries')
      await loadDeliveries()
    } catch (e: any) {
      setLoginError(e.response?.data?.message || 'Identifiants incorrects')
    } finally {
      setLoginLoading(false)
    }
  }

  function handleLogout() {
    logout()
    setAuthenticated(false)
    setDeliveries([])
    setSelected(null)
  }

  if (authenticated === null) return null

  if (!authenticated) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Truck className="w-10 h-10 text-primary" />
            <h1 className="text-2xl font-bold text-text">BRIKE Driver</h1>
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

  const doneCount = deliveries.filter((d) => d.status === 'DELIVERED').length

  return (
    <div className="flex flex-col h-full">
      <header className="bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6" />
          <h1 className="text-lg font-bold">BRIKE Driver</h1>
        </div>
        <button onClick={handleLogout} className="text-white/90">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'home' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Aujourd'hui</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface border border-border rounded-2xl p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-primary">{deliveries.length}</div>
                <div className="text-sm text-muted mt-1">Livraisons</div>
              </div>
              <div className="bg-surface border border-border rounded-2xl p-4 text-center shadow-sm">
                <div className="text-3xl font-bold text-success">{doneCount}</div>
                <div className="text-sm text-muted mt-1">Terminées</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deliveries' && (
          <div className="space-y-4">
            {selected ? (
              <DeliveryDetail
                delivery={selected}
                onBack={() => setSelected(null)}
                code={code}
                setCode={setCode}
                verifyLoading={verifyLoading}
                onStart={async () => { await startDelivery(selected.id); await loadDeliveries() }}
                onArrive={async () => { await arriveDelivery(selected.id); await loadDeliveries() }}
                onVerify={async () => {
                  setVerifyLoading(true)
                  try {
                    await verifyCode(selected.id, { code })
                    setCode('')
                    await loadDeliveries()
                  } catch (e: any) {
                    setError(e.response?.data?.message || 'Code invalide')
                  } finally {
                    setVerifyLoading(false)
                  }
                }}
                onComplete={async (payload: CompleteDeliveryPayload) => {
                  await completeDelivery(selected.id, payload)
                  await loadDeliveries()
                  setSelected(null)
                }}
              />
            ) : (
              <>
                <h2 className="text-xl font-bold">Mes livraisons</h2>
                {loading && <p className="text-muted text-center py-6">Chargement...</p>}
                {error && <p className="text-error text-center py-4">{error}</p>}
                <div className="space-y-3">
                  {deliveries.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { setSelected(d); setError('') }}
                      className="w-full bg-surface border border-border rounded-2xl p-4 text-left shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-text">{d.orderNumber}</div>
                          <div className="text-sm text-muted">{d.address}</div>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                          {STATUS_LABELS[d.status] || d.status}
                        </span>
                      </div>
                    </button>
                  ))}
                  {deliveries.length === 0 && !loading && (
                    <div className="bg-surface border border-border rounded-2xl p-6 text-center">
                      <Package className="w-12 h-12 text-muted mx-auto mb-3" />
                      <p className="text-muted">Aucune livraison assignée.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
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
        )}
      </main>

      <nav className="bg-surface border-t border-border flex justify-around p-2 sticky bottom-0">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === 'home' ? 'text-primary' : 'text-muted'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-xs font-medium">Accueil</span>
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === 'deliveries' ? 'text-primary' : 'text-muted'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-xs font-medium">Livraisons</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
            activeTab === 'profile' ? 'text-primary' : 'text-muted'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-xs font-medium">Profil</span>
        </button>
      </nav>
    </div>
  )
}

function DeliveryDetail({
  delivery,
  onBack,
  code,
  setCode,
  verifyLoading,
  onStart,
  onArrive,
  onVerify,
  onComplete,
}: {
  delivery: Delivery
  onBack: () => void
  code: string
  setCode: (v: string) => void
  verifyLoading: boolean
  onStart: () => void
  onArrive: () => void
  onVerify: () => void
  onComplete: (payload: CompleteDeliveryPayload) => void
}) {
  const [recipientType, setRecipientType] = useState<'CLIENT' | 'INTERMEDIARY'>('CLIENT')
  const [recipientName, setRecipientName] = useState(delivery.recipientName || delivery.customerName || '')
  const [intermediaryRelation, setIntermediaryRelation] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined)
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>(undefined)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    let clientX = 0
    let clientY = 0
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent<HTMLCanvasElement>).clientX
      clientY = (e as React.MouseEvent<HTMLCanvasElement>).clientY
    }
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY }
  }

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    isDrawing.current = true
    lastPos.current = getPos(e)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing.current || !canvasRef.current || !lastPos.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#111827'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = { x, y }
  }

  const stopDraw = () => {
    isDrawing.current = false
    lastPos.current = null
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignatureUrl(undefined)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setSignatureUrl(canvas.toDataURL('image/png'))
  }

  const canComplete = () =>
    recipientName.trim().length > 1 && !!signatureUrl

  const handleComplete = () => {
    const payload: CompleteDeliveryPayload = {
      recipientType,
      recipientName: recipientName.trim(),
      ...(recipientType === 'INTERMEDIARY' && { intermediaryRelation: intermediaryRelation.trim() }),
      ...(signatureUrl && { signatureUrl }),
      ...(photoUrl && { photoUrl }),
    }
    onComplete(payload)
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-muted">← Retour</button>
      <h2 className="text-xl font-bold">{delivery.orderNumber}</h2>
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm space-y-2">
        <p className="text-sm"><span className="text-muted">Client :</span> {delivery.customerName}</p>
        <p className="text-sm"><span className="text-muted">Tél :</span> {delivery.customerPhone}</p>
        <p className="text-sm"><span className="text-muted">Adresse :</span> {delivery.address}</p>
        <p className="text-sm"><span className="text-muted">Statut :</span> {STATUS_LABELS[delivery.status] || delivery.status}</p>
      </div>

      {delivery.status === 'ASSIGNED' && (
        <button onClick={onStart} className="w-full py-3 bg-primary text-white rounded-xl font-semibold">
          Démarrer la livraison
        </button>
      )}

      {delivery.status === 'IN_PROGRESS' && (
        <button onClick={onArrive} className="w-full py-3 bg-primary text-white rounded-xl font-semibold">
          Je suis arrivé
        </button>
      )}

      {delivery.status === 'ARRIVED' && (
        <div className="space-y-3">
          <label className="text-sm text-muted">Code à 6 chiffres du client</label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 rounded-xl border border-border text-center text-2xl tracking-widest outline-none focus:border-primary"
            placeholder="______"
          />
          <button
            onClick={onVerify}
            disabled={code.length !== 6 || verifyLoading}
            className="w-full py-3 bg-success text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {verifyLoading ? 'Vérification...' : 'Vérifier le code'}
          </button>
        </div>
      )}

      {delivery.status === 'CODE_VERIFIED' && (
        <div className="space-y-4">
          <h3 className="font-semibold">Preuve de livraison</h3>

          <div className="space-y-2">
            <label className="text-sm text-muted block">Destinataire</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={recipientType === 'CLIENT'}
                  onChange={() => setRecipientType('CLIENT')}
                  className="accent-primary"
                />
                <span className="text-sm">Client</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={recipientType === 'INTERMEDIARY'}
                  onChange={() => setRecipientType('INTERMEDIARY')}
                  className="accent-primary"
                />
                <span className="text-sm">Intermédiaire</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted block mb-1">Nom du destinataire</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-primary"
              placeholder="Nom et prénom"
            />
          </div>

          {recipientType === 'INTERMEDIARY' && (
            <div>
              <label className="text-sm text-muted block mb-1">Lien avec le client</label>
              <input
                type="text"
                value={intermediaryRelation}
                onChange={(e) => setIntermediaryRelation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-primary"
                placeholder="Ex : voisin, collègue"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-muted block mb-1 flex items-center gap-2">
              <PenLine className="w-4 h-4" /> Signature
            </label>
            <canvas
              ref={canvasRef}
              width={600}
              height={240}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
              className="w-full h-40 border border-border rounded-xl bg-white cursor-crosshair touch-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={clearSignature}
                className="flex-1 py-2 text-sm border border-border rounded-xl"
              >
                Effacer
              </button>
              <button
                type="button"
                onClick={saveSignature}
                className="flex-1 py-2 text-sm bg-primary/10 text-primary rounded-xl font-semibold"
              >
                Sauvegarder la signature
              </button>
            </div>
            {signatureUrl && <p className="text-xs text-success">Signature enregistrée</p>}
          </div>

          <div>
            <label className="text-sm text-muted block mb-1 flex items-center gap-2">
              <Camera className="w-4 h-4" /> Photo (optionnel)
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary/10 file:text-primary"
            />
            {photoUrl && (
              <img src={photoUrl} alt="Preuve" className="mt-2 w-full h-40 object-cover rounded-xl border border-border" />
            )}
          </div>

          <button
            onClick={handleComplete}
            disabled={!canComplete()}
            className="w-full py-3 bg-success text-white rounded-xl font-semibold disabled:opacity-50"
          >

          
            Valider la livraison
          </button>
        </div>
      )}
    </div>
  )
}

export default App
