export type DeliveryStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ARRIVED'
  | 'CODE_VERIFIED'
  | 'DELIVERED'
  | 'FAILED'

export interface Delivery {
  id: string
  orderId: string
  orderNumber: string
  customerName: string
  customerPhone: string
  address: string
  status: DeliveryStatus
  scheduledAt: string
  validationCode?: string
  recipientName?: string
  recipientPhone?: string
  gpsLat?: number
  gpsLng?: number
}

export interface Driver {
  id: string
  firstName: string
  lastName: string
  phone: string
  token: string
}
