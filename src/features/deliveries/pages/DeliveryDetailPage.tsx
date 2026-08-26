import { useEffect, useRef, useState } from 'react'
import { PenLine, Camera } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { arriveDelivery, completeDelivery, startDelivery, verifyCode } from '../services/delivery'
import type { CompleteDeliveryPayload } from '../services/delivery'
import type { Delivery } from '../types'

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED: 'Assignée',
  IN_PROGRESS: 'En route',
  ARRIVED: 'Arrivé',
  CODE_VERIFIED: 'Code OK',
  DELIVERED: 'Livrée',
  FAILED: 'Échec',
}

interface DeliveryDetailPageProps {
  deliveries: Delivery[]
  onUpdate: () => Promise<void>
}

export default function DeliveryDetailPage({ deliveries, onUpdate }: DeliveryDetailPageProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const delivery = deliveries.find((d) => d.id === id)

  const [code, setCode] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [recipientType, setRecipientType] = useState<'CLIENT' | 'INTERMEDIARY'>('CLIENT')
  const [recipientName, setRecipientName] = useState(delivery?.recipientName || delivery?.customerName || '')
  const [intermediaryRelation, setIntermediaryRelation] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined)
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>(undefined)
  const [error, setError] = useState('')

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (delivery) {
      setRecipientName(delivery.recipientName || delivery.customerName || '')
    }
  }, [delivery])

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

  const handleComplete = async () => {
    if (!delivery) return
    const payload: CompleteDeliveryPayload = {
      recipientType,
      recipientName: recipientName.trim(),
      ...(recipientType === 'INTERMEDIARY' && { intermediaryRelation: intermediaryRelation.trim() }),
      ...(signatureUrl && { signatureUrl }),
      ...(photoUrl && { photoUrl }),
    }
    await completeDelivery(delivery.id, payload)
    await onUpdate()
    navigate('/deliveries')
  }

  if (!delivery) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/deliveries')} className="text-sm text-muted">← Retour</button>
        <p className="text-muted text-center py-6">Livraison introuvable.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/deliveries')} className="text-sm text-muted">← Retour</button>
      <h2 className="text-xl font-bold">{delivery.orderNumber}</h2>
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm space-y-2">
        <p className="text-sm"><span className="text-muted">Client :</span> {delivery.customerName}</p>
        <p className="text-sm"><span className="text-muted">Tél :</span> {delivery.customerPhone}</p>
        <p className="text-sm"><span className="text-muted">Adresse :</span> {delivery.address}</p>
        <p className="text-sm"><span className="text-muted">Statut :</span> {STATUS_LABELS[delivery.status] || delivery.status}</p>
      </div>

      {delivery.status === 'ASSIGNED' && (
        <button
          onClick={async () => { await startDelivery(delivery.id); await onUpdate() }}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold"
        >
          Démarrer la livraison
        </button>
      )}

      {delivery.status === 'IN_PROGRESS' && (
        <button
          onClick={async () => { await arriveDelivery(delivery.id); await onUpdate() }}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold"
        >
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
            onClick={async () => {
              setVerifyLoading(true)
              try {
                await verifyCode(delivery.id, { code })
                setCode('')
                await onUpdate()
              } catch (e: any) {
                setError(e.response?.data?.message || 'Code invalide')
              } finally {
                setVerifyLoading(false)
              }
            }}
            disabled={code.length !== 6 || verifyLoading}
            className="w-full py-3 bg-success text-white rounded-xl font-semibold disabled:opacity-50"
          >
            {verifyLoading ? 'Vérification...' : 'Vérifier le code'}
          </button>
          {error && <p className="text-error text-sm text-center">{error}</p>}
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
