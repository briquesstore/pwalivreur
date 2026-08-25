import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './services/auth'
import { getDeliveries } from './services/delivery'
import type { Delivery } from './types'

import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import DeliveriesPage from './pages/DeliveriesPage'
import DeliveryDetailPage from './pages/DeliveryDetailPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  function handleLogout() {
    setAuthenticated(false)
    setDeliveries([])
  }

  function handleSelectDelivery(d: Delivery) {
    window.location.href = `/deliveries/${d.id}`
  }

  if (authenticated === null) return null

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            authenticated ? <HomePage deliveries={deliveries} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/deliveries"
          element={
            authenticated ? (
              <DeliveriesPage
                deliveries={deliveries}
                loading={loading}
                error={error}
                onSelect={handleSelectDelivery}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/deliveries/:id"
          element={
            authenticated ? (
              <DeliveryDetailPage deliveries={deliveries} onUpdate={loadDeliveries} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            authenticated ? <ProfilePage onLogout={handleLogout} /> : <Navigate to="/login" />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
