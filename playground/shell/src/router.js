import { useEffect, useState, useCallback } from 'react'

/*
 * Роутер Shell. Адресом владеет Shell: все переходы — и свои, и внутри МФ — идут через navigate().
 * Это аналог «одного общего history» из статьи Cam Jackson: история одна, писатель один.
 */
export function useShellRouter() {
  const [path, setPath] = useState(() => location.pathname)

  // Назад/вперёд в браузере. ВАЖНО: history.pushState() popstate НЕ вызывает (MDN),
  // поэтому о переходах, сделанных в обход navigate(), Shell не узнает.
  useEffect(() => {
    const onPop = () => setPath(location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to, { replace = false } = {}) => {
    if (to === location.pathname) return
    history[replace ? 'replaceState' : 'pushState'](null, '', to)
    setPath(to)
  }, [])

  return { path, navigate }
}

/*
 * Таблица маршрутов верхнего уровня: какой префикс → какой МФ.
 * Хвост после префикса Shell не интерпретирует — это дело МФ.
 * Это публичный контракт: другие команды ссылаются на эти адреса (Корзина ведёт на /catalog/book/:sku).
 */
export const ROUTES = [
  { prefix: '/catalog', mf: 'catalog' },
  { prefix: '/cart', mf: 'cart-page' },
]
export const matchRoute = (path) =>
  ROUTES.find((r) => path === r.prefix || path.startsWith(r.prefix + '/')) ?? null
