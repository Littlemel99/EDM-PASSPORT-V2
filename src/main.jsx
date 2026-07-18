import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PassportProvider } from './providers/PassportProvider.jsx'
import { CrewProvider } from './providers/CrewProvider.jsx'
import { ProfileProvider } from './providers/ProfileProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PassportProvider>
      <CrewProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </CrewProvider>
    </PassportProvider>
  </StrictMode>,
)
