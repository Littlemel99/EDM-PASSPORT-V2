import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PassportProvider } from './providers/PassportProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PassportProvider>
      <App />
    </PassportProvider>
  </StrictMode>,
)
