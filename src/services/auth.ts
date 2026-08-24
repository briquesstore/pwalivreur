import { api } from './api'

export interface LoginPayload {
  identifier: string
  password: string
}

export interface DriverProfile {
  id: string
  firstName: string
  lastName: string
  phone: string
  role: string
  accessToken: string
  refreshToken: string
}

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

const MOCK_PROFILE: DriverProfile = {
  id: 'mock-driver-id',
  firstName: 'Koffi',
  lastName: 'Yao',
  phone: '0700000001',
  role: 'DRIVER',
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
    return MOCK_PROFILE
  }
  const { data } = await api.post('/auth/login', payload)
  localStorage.setItem('driver_token', data.accessToken)
  localStorage.setItem('driver_refresh', data.refreshToken)
  return data
}

export function logout() {
  localStorage.removeItem('driver_token')
  localStorage.removeItem('driver_refresh')
}

export function getToken(): string | null {
  return localStorage.getItem('driver_token')
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
