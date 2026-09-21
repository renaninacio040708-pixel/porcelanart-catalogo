import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import { CatalogoProvider } from './catalogo'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <CatalogoProvider>
          <App />
        </CatalogoProvider>
      </BrowserRouter>
    </MotionConfig>
    <Analytics />
  </StrictMode>,
)
