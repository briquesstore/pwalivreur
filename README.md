# BRIKE Driver — PWA livreur

Application Progressive Web App (PWA) pour les livreurs de BRIKE.STORE.

## Stack

- Vite 7 + React 19 + TypeScript
- Tailwind CSS v4
- `vite-plugin-pwa` pour service worker et manifest
- `react-router-dom`
- `lucide-react` / `axios`

## Démarrage

```bash
cd pwa-driver
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Structure

```
src/
  components/  — composants réutilisables
  pages/       — écrans (Login, Deliveries, DeliveryDetail, Profile)
  services/    — appels API
  stores/      — état global (Zustand)
  hooks/       — hooks métier
  types/       — types TypeScript
  lib/         — utilitaires
```
