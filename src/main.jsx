import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { inject } from '@vercel/analytics'

// Vercel Analytics. Every page has a real address (/schedule) and page changes
// use history.pushState, which Vercel's script counts on its own.
inject()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
