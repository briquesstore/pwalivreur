import { Package } from 'lucide-react'
import type { Delivery } from '../types'

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED: 'Assignée',
  IN_PROGRESS: 'En route',
  ARRIVED: 'Arrivé',
  CODE_VERIFIED: 'Code OK',
  DELIVERED: 'Livrée',
  FAILED: 'Échec',
}

interface DeliveriesPageProps {
  deliveries: Delivery[]
  loading: boolean
  error: string
  onSelect: (d: Delivery) => void
}

export default function DeliveriesPage({ deliveries, loading, error, onSelect }: DeliveriesPageProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Mes livraisons</h2>
      {loading && <p className="text-muted text-center py-6">Chargement...</p>}
      {error && <p className="text-error text-center py-4">{error}</p>}
      <div className="space-y-3">
        {deliveries.map((d) => (
          <button
            key={d.id}
            onClick={() => onSelect(d)}
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
    </div>
  )
}
