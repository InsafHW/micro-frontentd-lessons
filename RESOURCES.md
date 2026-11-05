# Микрофронтенды: Resources

## Knowledge

- [Article: "Micro Frontends" by Cam Jackson (martinfowler.com)](https://martinfowler.com/articles/micro-frontends.html)
  Каноническая статья: определение, способы интеграции (сервер / build-time / runtime через JS, iframe, Web Components), коммуникация, стили, BFF, минусы. Use for: основы, аргументы «за/против» для собеседований.
- [Site: micro-frontends.org by Michael Geers](https://micro-frontends.org/)
  Пять базовых принципов (технологическая независимость, изоляция, префиксы команд, нативные API браузера, устойчивость) и коммуникация через атрибуты и CustomEvent. Use for: коммуникация, неймспейсы событий.
- [Book: _Micro Frontends in Action_ by Michael Geers (Manning)](https://www.manning.com/books/micro-frontends-in-action)
  Книга автора micro-frontends.org, подробно разбирает композицию и коммуникацию. Use for: углубление после базовых уроков.
- [Docs: Module Federation (module-federation.io)](https://module-federation.io/guide/start/index.html)
  Официальная документация Module Federation 2.0 (webpack, Rspack; Vite через `@module-federation/vite`). Use for: host/remote, exposes, runtime.
- [Docs: Module Federation — shared](https://module-federation.io/configure/shared.html)
  Опции `singleton`, `requiredVersion`, `eager`. Use for: урок про общие зависимости и конфликт версий.
- [Repo: module-federation/vite](https://github.com/module-federation/vite)
  Официальный Vite-плагин. Use for: практический пример.
- [MDN: CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent) · [MDN: dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent) · [MDN: BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) · [MDN: storage event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event)
  Нативные механизмы: события (синхронный dispatch, возврат false при preventDefault = подтверждение), синхронизация вкладок. Use for: уроки про коммуникацию и состояние.

- [Docs: React — Invalid Hook Call Warning](https://react.dev/warnings/invalid-hook-call-warning)
  Причины ошибки, включая дубликат React. Use for: объяснение, зачем `shared: { react: { singleton: true } }`.
- [Docs: Module Federation — runtime troubleshooting](https://module-federation.io/guide/troubleshooting/runtime)
  Коды ошибок рантайма (RUNTIME-008 = не загрузился remoteEntry). Use for: отладка playground.

- [MDN: Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API) · [MDN: popstate](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event)
  pushState не вызывает popstate; Navigation API (Baseline 2026) видит все переходы. Use for: роутинг между МФ.

- [react.dev: Component → Error Boundary](https://react.dev/reference/react/Component) · [Vue: app.config.errorHandler](https://vuejs.org/api/application.html) · [Vue: scoped CSS](https://vuejs.org/api/sfc-css-features.html) · [Vite: CSS Modules](https://vite.dev/guide/features.html) · [MDN: Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
  Что ловят границы ошибок и как изолируются стили. Use for: урок 5.

## Wisdom (Communities)

- [Module Federation — GitHub Discussions](https://github.com/module-federation/core/discussions)
  Мейнтейнеры отвечают на вопросы по реальным конфигурациям. Use for: вопросы про shared, версии, продакшен-проблемы.
- [r/Frontend](https://www.reddit.com/r/Frontend/)
  Общее фронтенд-сообщество. Use for: «стоит ли нам вообще идти в микрофронтенды?» — истории из практики.

## Gaps

- Нужен хороший разбор реального продакшен-кейса (почему компания пришла или отказалась). Найти в следующих сессиях.
