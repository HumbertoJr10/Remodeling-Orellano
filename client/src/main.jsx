import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App, { AdminMessagesView } from './App.jsx'
import './index.css'

const companyName = 'RCO HIGH LEVEL CONSTRUCTION LLC - Orellano'
const apiUrl =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001`

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/admin/messages"
          element={<AdminMessagesView apiUrl={apiUrl} companyName={companyName} />}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
