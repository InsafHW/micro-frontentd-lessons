import { createApp } from 'vue'
import type { CartBadgeProps, CartPageProps, MountFn } from '@polka/contracts'
import CartBadge from './CartBadge.vue'
import CartPage from './CartPage.vue'

/**
 * Публичный контракт МФ Корзины: mount(el, props) → unmount().
 * Хосту не нужно знать, что внутри Vue. Сигнатуры проверяются по @polka/contracts —
 * тем же типам, по которым Shell их вызывает.
 */
export const mount: MountFn<CartBadgeProps> = (el, props) => {
  const app = createApp(CartBadge, { ...props })
  app.mount(el)
  return () => app.unmount()
}

export const mountPage: MountFn<CartPageProps> = (el, props) => {
  const app = createApp(CartPage, { ...props })
  app.mount(el)
  return () => app.unmount()
}
