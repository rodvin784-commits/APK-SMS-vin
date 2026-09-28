import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { assertConfig } from './lib/env.ts'

// Produksi (APK): bungkam console.log/info/debug agar logcat bersih dan
// URL deep link berisi token OAuth tidak bocor ke log sistem.
// console.warn/error tetap hidup agar masalah serius tetap terlacak.
if (import.meta.env.PROD) {
  for (const metode of ['log', 'info', 'debug'] as const) {
    // eslint-disable-next-line no-console
    console[metode] = () => undefined
  }
}

assertConfig()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
