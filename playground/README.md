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
npm run typecheck          # проверить типы во всех трёх приложениях (build делает это сам)
```

## TypeScript и контракты

- `contracts/` (`@polka/contracts`) — пакет **только с типами**: props Каталога, сигнатуры `mount`, `Navigate`, `detail` событий и `WindowEventMap`. Это общий словарь команд, а не общий код: `import type` исчезает при сборке, рантайм-связи нет. Меняется как публичный API.
- Remote реализует контракт (`Catalog(props: CatalogProps)`, `mount: MountFn<CartBadgeProps>`), а Shell объявляет, что ждёт от сети, в `shell/src/remotes.d.ts`, по тем же типам. Нарушит контракт любая сторона — упадёт `tsc` у неё.
- Слушатели событий типизированы автоматически: `window.addEventListener('cart:changed', e => e.detail.count)`. А `new CustomEvent('имя', …)` TypeScript с именем не связывает, поэтому при отправке `detail` нужно явно аннотировать: `const detail: AddToCartDetail = …`.
- TypeScript 6.0: в 7.0 нет JS API компилятора (`ts.createProgram`), а на нём работают `vue-tsc` и разбор типов в `defineProps<…>()`.
- `dts: false`: автогенерацию типов remote (`@mf-types`) Module Federation не используем, контракты описаны явно, чтобы их было видно и они проходили ревью как API.

Каждый remote работает и сам по себе, без Shell: откройте http://localhost:5171 (Каталог) или http://localhost:5172 (Корзина). Это standalone-стенды команд из `catalog/index.html` и `cart/index.html`: так команда разрабатывает и проверяет свой МФ изолированно. Без стилей Shell они выглядят голо, и это нормально.

Маршруты (урок 4): Shell владеет адресом и таблицей префиксов (`shell/src/router.ts`): `/catalog/*` → Каталог (сам понимает `/book/:sku`), `/cart` → страница Корзины (`mountPage`). Переходы — только через `navigate(to)`, который Shell передаёт вниз. Полоска внизу Shell показывает, совпадает ли адрес с тем, что смонтировано.

Изоляция (урок 5): глобальный CSS — только `shell/public/polka.css` (reset, токены `--*`). Каталог — CSS Modules (`Catalog.module.css`), Корзина — `<style scoped>`. Ошибки: `RemoteBoundary` в Shell (со сбросом по `resetKey={path}`), во Vue — `app.config.errorHandler` в `cart/src/mount.ts`. Кнопки «💥» и «⚠» — учебные поломки.

Контракт событий тот же, что в уроках 1–2: `catalog:add-to-cart` (cancelable, подтверждение через `preventDefault`), `cart:changed`, `cart:state-request`, BroadcastChannel `polka-cart`.

`window.__polkaShellReact` — только диагностика для урока 3 (показывает, общий ли React у Shell и Каталога). В реальном коде этого нет.
