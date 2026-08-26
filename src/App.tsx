import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from '@/features/auth/services/auth'
import { getDeliveries } from '@/features/deliveries/services/delivery'
import type { Delivery } from '@/features/deliveries/types'

import Layout from '@/components/Layout'
import LoginPage from '@/features/auth/pages/LoginPage'
import HomePage from '@/features/home/pages/HomePage'
import DeliveriesPage from '@/features/deliveries/pages/DeliveriesPage'
import DeliveryDetailPage from '@/features/deliveries/pages/DeliveryDetailPage'
import ProfilePage from '@/features/profile/pages/ProfilePage'

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setAuthenticated(isLoggedIn())
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
            authenticated ? <ProfilePage /> : <Navigate to="/login" />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
