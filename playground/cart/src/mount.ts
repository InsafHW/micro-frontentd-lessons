import { createApp, type Component } from 'vue'
import type { CartBadgeProps, CartPageProps, MountFn, Unmount } from '@polka/contracts'
import CartBadge from './CartBadge.vue'
import CartPage from './CartPage.vue'

/**
 * Монтирует Vue-приложение с собственной «границей ошибок».
 * React error boundary Shell про Vue ничего не знает: ловить свои ошибки — обязанность МФ.
 * Политика (решение команды Корзины): любая непойманная ошибка → лог + заглушка вместо пустого места.
 */
function mountIsolated(component: Component, el: HTMLElement, props: object, name: string): Unmount {
  const app = createApp(component, { ...props })
  let mounted = true
  app.config.errorHandler = (err, _instance, info) => {
    console.error(`[cart] ${name} упал (${info})`, err)
    queueMicrotask(() => {
      if (!mounted) return
      mounted = false
      app.unmount()
      el.innerHTML = `<div class="fallback">${name} временно недоступна. Остальная «Полка» работает.</div>`
    })
  }
  app.mount(el)
  return () => { if (mounted) { mounted = false; app.unmount() } }
}

/**
 * Публичный контракт МФ Корзины: mount(el, props) → unmount().
 * Хосту не нужно знать, что внутри Vue. Сигнатуры проверяются по @polka/contracts —
 * тем же типам, по которым Shell их вызывает.
 */
export const mount: MountFn<CartBadgeProps> = (el, props) => mountIsolated(CartBadge, el, props, 'Корзина')
export const mountPage: MountFn<CartPageProps> = (el, props) => mountIsolated(CartPage, el, props, 'Страница корзины')
