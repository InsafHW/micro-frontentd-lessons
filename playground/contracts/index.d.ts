/*
 * Публичные контракты между микрофронтендами «Полки».
 *
 * Только типы: `import type` из этого пакета полностью исчезает при сборке,
 * поэтому рантайм-связи между командами он не создаёт. Это общий словарь,
 * а не общий код. Меняется он как публичный API: с согласованием и обратной совместимостью.
 */

// ───────── Роутинг (урок 4) ─────────

/** Единственный способ сменить адрес. Его даёт Shell, владелец URL. */
export type Navigate = (to: string, options?: { replace?: boolean }) => void

// ───────── События (уроки 1–2) ─────────

/** Каталог → кому интересно: «пользователь добавил книгу». cancelable: владелец подтверждает через preventDefault(). */
export interface AddToCartDetail {
  sku: string
  title: string
  price: number
}

/** Корзина → все: снимок состояния (не дельта), чтобы одного события хватало. */
export interface CartChangedDetail {
  count: number
  total: number
}

declare global {
  interface WindowEventMap {
    'catalog:add-to-cart': CustomEvent<AddToCartDetail>
    'cart:changed': CustomEvent<CartChangedDetail>
    /** Опоздавший подписчик просит владельца прислать снимок. */
    'cart:state-request': CustomEvent<null>
  }
  interface Window {
    /** ДИАГНОСТИКА урока 3: React Shell, чтобы Каталог проверил singleton. В проде не нужно. */
    __polkaShellReact?: unknown
  }
}

// ───────── Способы встраивания (урок 3) ─────────

/** Способ 1: компонент. exposes './Catalog' — props React-компонента Каталога. */
export interface CatalogProps {
  /** Кто вошёл. Авторизацией владеет Shell. */
  user?: string | null
  /** Под каким префиксом смонтирован Каталог, например '/catalog'. */
  basename?: string
  /** Текущий путь. Адресом владеет Shell; Каталог решает, что значит хвост. */
  path?: string
  navigate?: Navigate
}

/** Способ 2: mount(el, props) → unmount. Не зависит от фреймворка хоста. */
export type Unmount = () => void
export type MountFn<Props> = (el: HTMLElement, props: Props) => Unmount

/** exposes './mount' Корзины: бейдж в шапке. */
export interface CartBadgeProps {
  navigate?: Navigate
}

/** exposes './mount' Корзины: страница /cart. */
export interface CartPageProps {
  navigate: Navigate
}
