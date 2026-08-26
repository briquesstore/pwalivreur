import { useEffect, useState } from 'react'
import { isLoggedIn, logout as logoutService } from '../services/auth'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    setIsAuthenticated(isLoggedIn())
  }, [])

  const logout = () => {
    logoutService()
    setIsAuthenticated(false)
    window.location.href = '/login'
  }

  return { isAuthenticated, logout }
}
