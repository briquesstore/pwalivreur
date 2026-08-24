import type { CompleteDeliveryPayload } from './delivery'
import type { Delivery } from '../types'

let mockDeliveries: Delivery[] = [
  {
    id: 'mock-dlv-1',
    orderId: 'mock-order-1',
    orderNumber: 'CMD-2026-00042',
    customerName: 'Jean Kouassi',
    customerPhone: '0712345678',
    address: 'Cocody, Rue des Jardins, Abidjan',
    status: 'ASSIGNED',
    scheduledAt: '2026-07-24T09:00:00.000Z',
    validationCode: '123456',
    gpsLat: 5.359951,
    gpsLng: -4.008256,
  },
  {
    id: 'mock-dlv-2',
    orderId: 'mock-order-2',
    orderNumber: 'CMD-2026-00043',
    customerName: 'Marie Koné',
    customerPhone: '0598765432',
    address: 'Marcory, Boulevard de Marseille, Abidjan',
    status: 'IN_PROGRESS',
    scheduledAt: '2026-07-24T10:30:00.000Z',
    validationCode: '654321',
    gpsLat: 5.300,
    gpsLng: -4.000,
  },
  {
    id: 'mock-dlv-3',
    orderId: 'mock-order-3',
    orderNumber: 'CMD-2026-00044',
    customerName: 'Amadou Bamba',
    customerPhone: '0788889999',
    address: 'Treichville, Avenue 20, Abidjan',
    status: 'ARRIVED',
    scheduledAt: '2026-07-24T11:00:00.000Z',
    validationCode: '111111',
    gpsLat: 5.280,
    gpsLng: -4.010,
  },
  {
    id: 'mock-dlv-4',
    orderId: 'mock-order-4',
    orderNumber: 'CMD-2026-00045',
    customerName: 'Fatou Diallo',
    customerPhone: '0566667777',
    address: 'Plateau, Avenue de la République, Abidjan',
    status: 'CODE_VERIFIED',
    scheduledAt: '2026-07-24T12:00:00.000Z',
    validationCode: '999999',
    gpsLat: 5.330,
    gpsLng: -4.020,
  },
  {
    id: 'mock-dlv-5',
    orderId: 'mock-order-5',
    orderNumber: 'CMD-2026-00046',
    customerName: 'Yao Koffi',
    customerPhone: '0744445555',
    address: 'Koumassi, Carrefour Anoumabo, Abidjan',
    status: 'DELIVERED',
    scheduledAt: '2026-07-23T15:00:00.000Z',
    recipientName: 'Yao Koffi',
  },
  {
    id: 'mock-dlv-6',
    orderId: 'mock-order-6',
    orderNumber: 'CMD-2026-00047',
    customerName: 'Awa Touré',
    customerPhone: '0733332222',
    address: 'Yopougon, Siporex, Abidjan',
    status: 'FAILED',
    scheduledAt: '2026-07-23T08:00:00.000Z',
  },
]

function findById(id: string): Delivery {
  const d = mockDeliveries.find((x) => x.id === id)
  if (!d) throw new Error('Livraison introuvable')
  return d
}

export function getMockDeliveries(status?: string): Delivery[] {
  if (status) return mockDeliveries.filter((d) => d.status === status)
  return mockDeliveries
}

export function getMockDelivery(id: string): Delivery {
  return findById(id)
}

export function startMockDelivery(id: string): Delivery {
  const d = findById(id)
  d.status = 'IN_PROGRESS'
  return d
}

export function arriveMockDelivery(id: string): Delivery {
  const d = findById(id)
  d.status = 'ARRIVED'
  return d
}

export function verifyMockCode(id: string, code: string): Delivery {
  const d = findById(id)
  if (d.validationCode && d.validationCode !== code) {
    throw new Error('Code de validation incorrect')
  }
  d.status = 'CODE_VERIFIED'
  return d
}

export function completeMockDelivery(id: string, _payload?: CompleteDeliveryPayload): Delivery {
  const d = findById(id)
  d.status = 'DELIVERED'
  return d
}

export function reportMockProblem(id: string): Delivery {
  const d = findById(id)
  d.status = 'FAILED'
  return d
}
