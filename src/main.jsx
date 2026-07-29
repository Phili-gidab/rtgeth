import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import { ContentProvider } from './lib/content.jsx'
import './styles/global.css'

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))
const Thanks = lazy(() => import('./pages/Thanks.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<ContentProvider><App /></ContentProvider>} />
          <Route path="/donate/thanks" element={<ContentProvider><Thanks /></ContentProvider>} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
