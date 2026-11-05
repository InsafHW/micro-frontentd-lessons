/*
 * Что Shell ожидает от remote. Сами типы — из @polka/contracts, тех же, по которым remote реализует exposes.
 * Без этих объявлений `import('catalog/Catalog')` для TypeScript — неизвестный модуль: он грузится по сети, не из node_modules.
 */
declare module 'catalog/Catalog' {
  import type { ComponentType } from 'react'
  import type { CatalogProps } from '@polka/contracts'
  const Catalog: ComponentType<CatalogProps>
  export default Catalog
}

declare module 'cart/mount' {
  import type { CartBadgeProps, CartPageProps, MountFn } from '@polka/contracts'
  export const mount: MountFn<CartBadgeProps>
  export const mountPage: MountFn<CartPageProps>
}
