import React from 'react'
import { createRoot } from 'react-dom/client'
import Catalog from './Catalog.jsx'

/**
 * Публичный контракт МФ Корзины: mount(el) → unmount().
 * Хосту не нужно знать, что внутри Vue.
 */
export function mount(el) {
    console.log(12312312)
    const app = createRoot(el)
    app.render(<Catalog />)
    return () => app.unmount()
}
