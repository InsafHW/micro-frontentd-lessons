import { ref, computed } from 'vue'
import type { AddToCartDetail, CartChangedDetail } from '@polka/contracts'

/*
 * Состояние корзины — ОДНО на весь МФ Корзины (модуль грузится один раз).
 * Его используют и бейдж в шапке, и страница /cart: это одна команда, один владелец.
 * Приёмы из урока 2: снимок, рукопожатие, подтверждение, синхронизация вкладок.
 */
const KEY = 'polka:cart:v1'

const load = (): AddToCartDetail[] => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as AddToCartDetail[] } catch { return [] }
}

export const items = ref<AddToCartDetail[]>(load())
export const total = computed(() => items.value.reduce((s, i) => s + i.price, 0))

const bc = new BroadcastChannel('polka-cart')

const announce = (): void => {
  const detail: CartChangedDetail = { count: items.value.length, total: total.value }
  window.dispatchEvent(new CustomEvent('cart:changed', { detail }))
}

function commit(broadcast: boolean): void {
  localStorage.setItem(KEY, JSON.stringify(items.value))
  // Через границу — только простые данные: реактивный Proxy не клонируется (DataCloneError).
  if (broadcast) bc.postMessage(JSON.parse(JSON.stringify(items.value)) as AddToCartDetail[])
  announce()
}

export function removeAt(index: number): void { items.value = items.value.filter((_, i) => i !== index); commit(true) }
export function clear(): void { items.value = []; commit(true) }

let started = false
export function start(): void {
  if (started) return
  started = true
  // Тип e выводится из WindowEventMap (@polka/contracts): CustomEvent<AddToCartDetail>.
  window.addEventListener('catalog:add-to-cart', (e) => { e.preventDefault(); items.value = [...items.value, e.detail]; commit(true) })
  window.addEventListener('cart:state-request', announce)
  bc.onmessage = (m: MessageEvent<AddToCartDetail[]>) => { items.value = m.data; commit(false) }
  announce()
}
