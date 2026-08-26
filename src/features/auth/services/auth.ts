import { api } from '@/lib/api'

export interface DriverProfile {
  id: string
  firstName: string
  lastName: string
  phone: string
  role: string
  vehicleType?: string
  capacity?: number
  zones?: string[]
  isActive: boolean
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  identifier: string
  password: string
}

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const MOCK_PROFILE: DriverProfile = {
  id: 'mock-driver-id',
  firstName: 'Koffi',
  lastName: 'Yao',
  phone: '0700000001',
  role: 'DRIVER',
  vehicleType: 'Moto',
  capacity: 50,
  zones: ['Abidjan Nord'],
  isActive: true,
  accessToken: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
}

export async function login(payload: LoginPayload): Promise<DriverProfile> {
  if (USE_MOCKS) {
    if (payload.identifier !== MOCK_PROFILE.phone && payload.identifier !== 'driver') {
      throw new Error('Identifiants incorrects')
    }
    if (payload.password !== 'Driver123!') {
      throw new Error('Mot de passe incorrect')
    }
    localStorage.setItem('driver_token', MOCK_PROFILE.accessToken)
    localStorage.setItem('driver_refresh', MOCK_PROFILE.refreshToken)
    localStorage.setItem('driver_profile', JSON.stringify(MOCK_PROFILE))
    return MOCK_PROFILE
  }
  const { data } = await api.post('/auth/driver/login', payload)
  const profile: DriverProfile = {
    ...data.driver,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }
  localStorage.setItem('driver_token', data.accessToken)
  localStorage.setItem('driver_refresh', data.refreshToken)
  localStorage.setItem('driver_profile', JSON.stringify(profile))
  return profile
}

export async function getMe(): Promise<DriverProfile | null> {
  if (USE_MOCKS) return JSON.parse(localStorage.getItem('driver_profile') || 'null') ?? MOCK_PROFILE
  try {
    const { data } = await api.get('/auth/driver/me')
    const current = JSON.parse(localStorage.getItem('driver_profile') || '{}')
    const profile: DriverProfile = { ...current, ...data }
    localStorage.setItem('driver_profile', JSON.stringify(profile))
    return profile
  } catch {
    return null
  }
}

export function getStoredProfile(): DriverProfile | null {
  const raw = localStorage.getItem('driver_profile')
  return raw ? JSON.parse(raw) : null
}

export function logout() {
  localStorage.removeItem('driver_token')
  localStorage.removeItem('driver_refresh')
  localStorage.removeItem('driver_profile')
}

export function getToken(): string | null {
  return localStorage.getItem('driver_token')
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
