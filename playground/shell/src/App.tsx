import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import type { MountFn, Unmount } from '@polka/contracts'
import { RemoteBoundary } from './RemoteBoundary.tsx'
import { useShellRouter, matchRoute, type MfId } from './router.ts'

// Способ 1 — тот же фреймворк: React-компонент remote рендерим как свой.
const Catalog = lazy(() => import('catalog/Catalog'))

// Способ 2 — любой фреймворк: remote отдаёт mount(el, props) → unmount, Shell даёт ему DOM-узел.
function MountSlot<P>({ load, props, name }: { load: () => Promise<MountFn<P>>; props: P; name: string }) {
  const el = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let unmount: Unmount | undefined
    let cancelled = false
    load()
      .then((mountFn) => { if (!cancelled && el.current) unmount = mountFn(el.current, props) })
      .catch((err: unknown) => { console.error(`[shell] ${name} failed`, err); setFailed(true) })
    return () => { cancelled = true; unmount?.() }
  }, [])
  return failed ? <span className="fallback">{name}: недоступно</span> : <div ref={el} />
}

type Mounted = MfId | '404'

// ДИАГНОСТИКА для урока 4: что в адресной строке и что смонтировал Shell. Расхождение — баг роутинга.
function RouteProbe({ mounted }: { mounted: Mounted }) {
  const [url, setUrl] = useState(location.pathname)
  useEffect(() => { const t = setInterval(() => setUrl(location.pathname), 150); return () => clearInterval(t) }, [])
  const expected: Mounted = matchRoute(url)?.mf ?? '404'
  const ok = expected === mounted
  return (
    <p className={`probe ${ok ? '' : 'probe-bad'}`}>
      адрес: <code>{url}</code> · Shell смонтировал: <code>{mounted}</code>
      {ok ? ' ✓' : ` ✗ рассинхрон: по адресу должен быть ${expected}`}
    </p>
  )
}

export default function App() {
  const [user, setUser] = useState<string | null>(null)   // авторизацией владеет Shell
  const { path, navigate } = useShellRouter()              // адресом владеет Shell

  useEffect(() => { if (path === '/') navigate('/catalog', { replace: true }) }, [path])

  const route = matchRoute(path)
  const link = (to: string, text: string) => (
    <a href={to} className={route && to.startsWith(route.prefix) ? 'on' : ''}
       onClick={(e) => { e.preventDefault(); navigate(to) }}>{text}</a>
  )

  return (
    <div className="shell">
      <span className="mf-label">Shell · React {React.version}</span>
      <header>
        <span className="brand">Полка</span>
        <nav>{link('/catalog', 'Каталог')}{link('/cart', 'Корзина')}</nav>
        <span className="spacer" />
        <MountSlot name="Корзина" load={() => import('cart/mount').then((m) => m.mount)} props={{ navigate }} />
        <button onClick={() => setUser(user ? null : 'Анна')}>{user ? `Выйти (${user})` : 'Войти как Анна'}</button>
      </header>

      {route?.mf === 'catalog' && (
        <RemoteBoundary name="Каталог" resetKey={path}>
          <Suspense fallback={<p className="muted">Загружаем Каталог…</p>}>
            {/* ↓ props по контракту CatalogProps: кто вошёл, где смонтирован, текущий путь и способ его сменить */}
            <Catalog user={user} basename="/catalog" path={path} navigate={navigate} />
          </Suspense>
        </RemoteBoundary>
      )}
      {route?.mf === 'cart-page' && (
        <MountSlot key="cart-page" name="Страница корзины"
          load={() => import('cart/mount').then((m) => m.mountPage)} props={{ navigate }} />
      )}
      {!route && path !== '/' && (
        <div className="fallback">Страница <code>{path}</code> не найдена. {link('/catalog', 'В каталог')}</div>
      )}

      <RouteProbe mounted={route?.mf ?? (path === '/' ? 'catalog' : '404')} />
    </div>
  )
}
