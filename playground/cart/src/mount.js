import { createApp } from 'vue'
import CartBadge from './CartBadge.vue'
import CartPage from './CartPage.vue'

/**
 * Публичный контракт МФ Корзины: mount(el, props) → unmount().
 * Хосту не нужно знать, что внутри Vue. props: { navigate(to) } — функция Shell для переходов.
 */
export function mount(el, props = {}) {
  const app = createApp(CartBadge, props)
  app.mount(el)
  return () => app.unmount()
}

export function mountPage(el, props) {
  const app = createApp(CartPage, props)
  app.mount(el)
  return () => app.unmount()
}
