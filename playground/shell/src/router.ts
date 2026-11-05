import { useEffect, useState, useCallback } from 'react'
import type { Navigate } from '@polka/contracts'

/*
 * Роутер Shell. Адресом владеет Shell: все переходы — и свои, и внутри МФ — идут через navigate().
 * Это аналог «одного общего history» из статьи Cam Jackson: история одна, писатель один.
 */
export function useShellRouter(): { path: string; navigate: Navigate } {
  const [path, setPath] = useState(() => location.pathname)

  // Назад/вперёд в браузере. ВАЖНО: history.pushState() popstate НЕ вызывает (MDN),
  // поэтому о переходах, сделанных в обход navigate(), Shell не узнает.
  useEffect(() => {
    const onPop = () => setPath(location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback<Navigate>((to, { replace = false } = {}) => {
    if (to === location.pathname) return
    history[replace ? 'replaceState' : 'pushState'](null, '', to)
    setPath(to)
  }, [])

  return { path, navigate }
}

/** Какой МФ стоит за префиксом. 'cart-page' — страница корзины (exposes cart/mount → mountPage). */
export type MfId = 'catalog' | 'cart-page'

/*
 * Таблица маршрутов верхнего уровня: какой префикс → какой МФ.
 * Хвост после префикса Shell не интерпретирует — это дело МФ.
 * Это публичный контракт: другие команды ссылаются на эти адреса (Корзина ведёт на /catalog/book/:sku).
 */
export const ROUTES: ReadonlyArray<{ prefix: string; mf: MfId }> = [
  { prefix: '/catalog', mf: 'catalog' },
  { prefix: '/cart', mf: 'cart-page' },
]

export const matchRoute = (path: string) =>
  ROUTES.find((r) => path === r.prefix || path.startsWith(r.prefix + '/')) ?? null
