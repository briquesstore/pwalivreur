import type { Delivery } from '@/features/deliveries/types'

interface HomePageProps {
  deliveries: Delivery[]
}

export default function HomePage({ deliveries }: HomePageProps) {
  const doneCount = deliveries.filter((d) => d.status === 'DELIVERED').length

  return (
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
  )
}
