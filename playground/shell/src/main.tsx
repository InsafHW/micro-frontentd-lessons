import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

window.__polkaShellReact = React   // ДИАГНОСТИКА для урока (см. Catalog.tsx). В проде не нужно.
createRoot(document.getElementById('root')!).render(<App />)
