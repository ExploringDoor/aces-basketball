import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { inject } from '@vercel/analytics'

// Vercel Analytics. Pages live behind a hash (/#flyers), so report them as paths
// (/flyers) so the dashboard breaks views down by page instead of lumping all on /.
inject({ beforeSend: (e) => ({ ...e, url: e.url.replace(/\/#\/?([\w-]+)/, '/$1') }) })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
