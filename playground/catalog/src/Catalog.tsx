import React, { useState, type MouseEvent } from 'react'
import type { AddToCartDetail, CatalogProps, Navigate } from '@polka/contracts'

interface Book extends AddToCartDetail {
  about: string
}

const BOOKS: Book[] = [
  { sku: 'dune', title: 'Дюна', price: 790, about: 'Пустынная планета, пряность и политика.' },
  { sku: 'solaris', title: 'Солярис', price: 540, about: 'Океан, который думает, и люди, которые не понимают.' },
  { sku: 'picnic', title: 'Пикник на обочине', price: 460, about: 'Зона, сталкеры и Золотой шар.' },
]

// ДИАГНОСТИКА для урока 3: тот же ли это объект React, что у Shell? В реальном коде так не делают.
const reactSource = (): string =>
  window.__polkaShellReact === undefined ? 'нет Shell (standalone)'
  : window.__polkaShellReact === React ? 'общий с Shell ✓'
  : 'СВОЯ копия ✗'

/*
 * Контракт с Shell — CatalogProps из @polka/contracts:
 *   user, basename, path, navigate. Адресом владеет Shell; Каталог решает, что значит хвост.
 * В standalone-режиме Shell нет — заменяем navigate и path локальными.
 */
export default function Catalog({ user, basename = '', path, navigate }: CatalogProps) {
  const [localPath, setLocalPath] = useState(() => location.pathname)
  const go: Navigate = navigate ?? ((to) => { history.pushState(null, '', to); setLocalPath(to) })
  const current = path ?? localPath
  const sub = current.startsWith(basename) ? current.slice(basename.length) : current
  const [warning, setWarning] = useState('')

  const add = (book: Book) => {
    const detail: AddToCartDetail = { sku: book.sku, title: book.title, price: book.price }
    const notHandled = window.dispatchEvent(new CustomEvent('catalog:add-to-cart', { detail, cancelable: true }))
    setWarning(notHandled ? `Корзина недоступна — «${book.title}» не добавлена` : '')
  }

  /** Обычная ссылка (работает «открыть в новой вкладке»), но клик идёт через navigate. */
  const link = (to: string) => ({
    href: to,
    onClick: (e: MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); go(to) },
  })

  // Свой подмаршрут: /book/:sku. Что значит хвост адреса — решает команда Каталога.
  const match = sub.match(/^\/book\/([^/]+)$/)
  const book = match ? BOOKS.find((b) => b.sku === match[1]) : undefined

  return (
    <section className="mf mf-catalog">
      <span className="mf-label">Каталог · React {React.version} · {reactSource()}</span>
      {match ? (
        book ? (
          <>
            <p><a {...link(basename)}>← Все книги</a></p>
            <h2>{book.title}</h2>
            <p>{book.about}</p>
            <p><b>{book.price} ₽</b> <button onClick={() => add(book)}>В корзину</button></p>
            <p>
              <a {...link('/cart')}>Перейти в корзину →</a>
              {' '}
              <button className="danger" title="Учебная поломка: смена адреса в обход Shell"
                onClick={() => history.pushState(null, '', '/cart')}>
                ⚠ В корзину через history.pushState
              </button>
            </p>
          </>
        ) : <p className="warn">Книга «{match[1]}» не найдена.</p>
      ) : (
        <>
          <p className="muted">{user ? `Подборка для: ${user}` : 'Вы не вошли'}</p>
          <ul>
            {BOOKS.map((b) => (
              <li key={b.sku}>
                <a {...link(`${basename}/book/${b.sku}`)}>{b.title}</a>
                <span>{b.price} ₽ <button onClick={() => add(b)}>В корзину</button></span>
              </li>
            ))}
          </ul>
        </>
      )}
      {warning && <p className="warn">{warning}</p>}
    </section>
  )
}
