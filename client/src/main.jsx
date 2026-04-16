import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App, {
  AdminBillingPanel,
  AdminCarouselPanel,
  AdminLayout,
  AdminMessagesPanel,
} from './App.jsx'
import './index.css'

const companyName = 'RCO HIGH LEVEL CONSTRUCTION LLC'
const apiUrl =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001`

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/admin"
          element={<AdminLayout apiUrl={apiUrl} companyName={companyName} />}
        >
          <Route
            index
            element={<AdminMessagesPanel apiUrl={apiUrl} companyName={companyName} />}
          />
          <Route
            path="carousel"
            element={<AdminCarouselPanel apiUrl={apiUrl} companyName={companyName} />}
          />
          <Route
            path="facturacion"
            element={<AdminBillingPanel apiUrl={apiUrl} companyName={companyName} />}
          />
        </Route>
        <Route path="/create-skill" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/messages" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
