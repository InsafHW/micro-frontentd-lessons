import { ref, computed } from 'vue'

/*
 * Состояние корзины — ОДНО на весь МФ Корзины (модуль грузится один раз).
 * Его используют и бейдж в шапке, и страница /cart: это одна команда, один владелец.
 * Приёмы из урока 2: снимок, рукопожатие, подтверждение, синхронизация вкладок.
 */
const KEY = 'polka:cart:v1'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

export const items = ref(load())
export const total = computed(() => items.value.reduce((s, i) => s + i.price, 0))

const bc = new BroadcastChannel('polka-cart')
const announce = () => window.dispatchEvent(new CustomEvent('cart:changed', {
  detail: { count: items.value.length, total: total.value },
}))
function commit(broadcast) {
  localStorage.setItem(KEY, JSON.stringify(items.value))
  // Через границу — только простые данные: реактивный Proxy не клонируется (DataCloneError).
  if (broadcast) bc.postMessage(JSON.parse(JSON.stringify(items.value)))
  announce()
}

export function removeAt(index) { items.value = items.value.filter((_, i) => i !== index); commit(true) }
export function clear() { items.value = []; commit(true) }

let started = false
export function start() {
  if (started) return
  started = true
  window.addEventListener('catalog:add-to-cart', (e) => { e.preventDefault(); items.value = [...items.value, e.detail]; commit(true) })
  window.addEventListener('cart:state-request', announce)
  bc.onmessage = (m) => { items.value = m.data; commit(false) }
  announce()
}
