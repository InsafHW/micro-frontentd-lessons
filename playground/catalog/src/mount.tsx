import React from 'react'
import { createRoot } from 'react-dom/client'
import type { Unmount } from '@polka/contracts'
import Catalog from './Catalog.tsx'

/**
 * Публичный контракт МФ Корзины: mount(el) → unmount().
 * Хосту не нужно знать, что внутри Vue.
 */
export function mount(el: HTMLElement): Unmount {
    console.log(12312312)
    const app = createRoot(el)
    app.render(<Catalog />)
    return () => app.unmount()
}
