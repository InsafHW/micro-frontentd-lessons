import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

window.__polkaShellReact = React   // ДИАГНОСТИКА для урока (см. Catalog.jsx). В проде не нужно.
createRoot(document.getElementById('root')).render(<App />)
