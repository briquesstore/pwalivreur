import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

registerSW({
  immediate: true,
  onRegisteredSW(swUrl) {
    console.log('BRIKE Driver PWA registered', swUrl)
  },
  onOfflineReady() {
    console.log('BRIKE Driver prêt pour le mode hors-ligne')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
