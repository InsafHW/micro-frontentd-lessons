# «Полка» на Module Federation

Три независимых приложения, три сервера, как три команды с отдельными деплоями:

| Приложение | Роль | Стек | Порт | Отдаёт наружу |
|---|---|---|---|---|
| `shell/` | host | React | 5170 | — (потребляет `catalog/Catalog`, `cart/mount`) |
| `catalog/` | remote | React | 5171 | `./Catalog`: React-компонент |
| `cart/` | remote | Vue | 5172 | `./mount`: `mount(el, {navigate})` (бейдж) и `mountPage(el, {navigate})` (страница) |

```sh
npm install
npm start                  # собрать всё и поднять три preview-сервера → http://localhost:5170
npm run build -w catalog   # «задеплоить» только Каталог (Shell и Корзина не трогаются)
npm run preview:no-catalog # поднять всё, кроме Каталога («его сервер лежит»)
```

Каждый remote работает и сам по себе, без Shell: откройте http://localhost:5171 (Каталог) или http://localhost:5172 (Корзина). Это standalone-стенды команд из `catalog/index.html` и `cart/index.html`: так команда разрабатывает и проверяет свой МФ изолированно. Без стилей Shell они выглядят голо, и это нормально.

Маршруты (урок 4): Shell владеет адресом и таблицей префиксов (`shell/src/router.js`): `/catalog/*` → Каталог (сам понимает `/book/:sku`), `/cart` → страница Корзины (`mountPage`). Переходы — только через `navigate(to)`, который Shell передаёт вниз. Полоска внизу Shell показывает, совпадает ли адрес с тем, что смонтировано.

Контракт событий тот же, что в уроках 1–2: `catalog:add-to-cart` (cancelable, подтверждение через `preventDefault`), `cart:changed`, `cart:state-request`, BroadcastChannel `polka-cart`.

`window.__polkaShellReact` — только диагностика для урока 3 (показывает, общий ли React у Shell и Каталога). В реальном коде этого нет.
