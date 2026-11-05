// Standalone-стенд команды Корзины: Каталога и Shell нет — событие имитируем кнопкой, navigate — заглушкой.
import { mount, mountPage } from './mount.js'
const navigate = (to) => console.log('[cart standalone] navigate →', to)
mount(document.getElementById('root'), { navigate })
mountPage(document.getElementById('page'), { navigate })
document.getElementById('fake').onclick = () =>
  window.dispatchEvent(new CustomEvent('catalog:add-to-cart', { detail: { sku: 'test', title: 'Тест', price: 100 }, cancelable: true }))
