// Standalone-стенд команды Корзины: Каталога и Shell нет — событие имитируем кнопкой, navigate — заглушкой.
import type { Navigate } from '@polka/contracts'
import { mount, mountPage } from './mount.ts'

const navigate: Navigate = (to) => console.log('[cart standalone] navigate →', to)
mount(document.getElementById('root')!, { navigate })
mountPage(document.getElementById('page')!, { navigate })
document.getElementById('fake')!.onclick = () =>
  window.dispatchEvent(new CustomEvent('catalog:add-to-cart', { detail: { sku: 'test', title: 'Тест', price: 100 }, cancelable: true }))
