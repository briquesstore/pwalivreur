import { api } from './api'
import {
  getMockDeliveries,
  getMockDelivery,
  startMockDelivery,
  arriveMockDelivery,
  verifyMockCode,
  completeMockDelivery,
  reportMockProblem,
} from './mocks'
import type { Delivery } from '../types'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

export interface VerifyCodePayload {
  code: string
  gpsLat?: number
  gpsLng?: number
}

export interface CompleteDeliveryPayload {
  recipientType: 'CLIENT' | 'INTERMEDIARY'
  recipientName: string
  intermediaryRelation?: string
  signatureUrl?: string
  photoUrl?: string
  gpsLat?: number
  gpsLng?: number
}

export interface ReportProblemPayload {
  type: 'CLIENT_ABSENT' | 'ADDRESS_NOT_FOUND' | 'ACCESS_IMPOSSIBLE' | 'DAMAGED_GOODS' | 'CLIENT_REFUSED' | 'OTHER'
  description: string
  photoUrl?: string
}

export async function getDeliveries(status?: string): Promise<Delivery[]> {
  if (USE_MOCKS) return getMockDeliveries(status)
  const params = status ? `?status=${status}` : ''
  const { data } = await api.get(`/driver/deliveries${params}`)
  return data
}

export async function getDelivery(id: string): Promise<Delivery> {
  if (USE_MOCKS) return getMockDelivery(id)
  const { data } = await api.get(`/driver/deliveries/${id}`)
  return data
}

export async function startDelivery(id: string) {
  if (USE_MOCKS) return startMockDelivery(id)
  const { data } = await api.post(`/driver/deliveries/${id}/start`)
  return data
}

export async function arriveDelivery(id: string) {
  if (USE_MOCKS) return arriveMockDelivery(id)
  const { data } = await api.post(`/driver/deliveries/${id}/arrive`, { status: 'ARRIVED' })
  return data
}

export async function verifyCode(id: string, payload: VerifyCodePayload) {
  if (USE_MOCKS) return verifyMockCode(id, payload.code)
  const { data } = await api.post(`/driver/deliveries/${id}/verify-code`, payload)
  return data
}

export async function completeDelivery(id: string, payload: CompleteDeliveryPayload) {
  if (USE_MOCKS) return completeMockDelivery(id, payload)
  const { data } = await api.post(`/driver/deliveries/${id}/complete`, payload)
  return data
}

export async function reportProblem(id: string, payload: ReportProblemPayload) {
  if (USE_MOCKS) return reportMockProblem(id)
  const { data } = await api.post(`/driver/deliveries/${id}/problem`, payload)
  return data
}
