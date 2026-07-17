import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PassportProvider } from './providers/PassportProvider.jsx'
import { CrewProvider } from './providers/CrewProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PassportProvider>
      <CrewProvider>
        <App />
      </CrewProvider>
    </PassportProvider>
  </StrictMode>,
)
