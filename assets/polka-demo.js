/*
 * «Полка» — учебный маркетплейс из микрофронтендов в одной странице.
 * Каждый МФ — Custom Element со своим Shadow DOM и своим внутренним состоянием.
 * В реальности это были бы отдельные репозитории и бандлы (React, Vue, Angular, Svelte);
 * здесь их «стек» только подписан, а границы и каналы связи — настоящие.
 *
 *   <polka-app id="demo"></polka-app>                    — урок 1: наивная версия
 *   <polka-app id="demo" mode="owned" with-recs></polka-app> — урок 2: владелец + синхронизация
 *   app.setCartEnabled(false)   — «корзина не загрузилась»
 *   app.setRecsEnabled(true)    — смонтировать «Рекомендации» (опоздавший подписчик)
 *   app.setMode("naive"|"owned")
 *
 * Контракты:
 *   ↓ атрибуты:  catalog-list[user, genre], account-page[user]
 *   ↑ события:   catalog:add-to-cart {sku, title, price}   (owned: cancelable, Корзина подтверждает preventDefault())
 *                cart:changed {count, total}               — снимок состояния, не дельта
 *                cart:state-request                        — owned: «владелец, пришли снимок»
 *   ⇄ URL:       #/catalog?genre=sf | #/account
 *   ⇆ вкладки:   BroadcastChannel "polka-cart"             — owned: только владелец пишет и читает
 */
(function () {
  const rub = (n) => n.toLocaleString("ru-RU") + " ₽";
  const modeOf = (el) => (el.closest("polka-app")?.getAttribute("mode")) || "naive";
  const STORAGE_KEY = "polka:cart:v1";        // префикс команды + версия контракта
  const CHANNEL = "polka-cart";
  const TAB_ID = Math.random().toString(36).slice(2, 8);   // чтобы журнал отличал свою вкладку от чужой
  document.documentElement.dataset.tab = TAB_ID;

  const LABELS = { catalog: "Каталог", cart: "Корзина", account: "Аккаунт", recs: "Рекомендации" };
  const frame = (team, stack) => `
    :host { display: block; position: relative; border: 1.5px dashed var(--${team}); border-radius: 10px; padding: 1.4rem .9rem .8rem; font-family: var(--sans); font-size: .82rem; color: var(--ink); }
    :host::before { content: "${LABELS[team]} · ${stack}"; position: absolute; top: -.6rem; left: .7rem; background: var(--${team}); color: #fff; font-size: .62rem; font-weight: 600; padding: .1rem .45rem; border-radius: 999px; letter-spacing: .03em; }
    button { font: inherit; font-size: .75rem; border: 1px solid var(--rule); background: var(--surface); color: var(--ink); border-radius: 5px; padding: .3rem .6rem; cursor: pointer; }
    button:hover { border-color: var(--${team}); }
    a { color: var(--${team}); }
    .muted { color: var(--ink-soft); }
    .warn { color: var(--bad); }`;

  // ────────── МФ «Каталог» (команда Каталога, «React») ──────────
  const BOOKS = [
    { sku: "dune", title: "Дюна", price: 790, genre: "sf" },
    { sku: "solaris", title: "Солярис", price: 540, genre: "sf" },
    { sku: "picnic", title: "Пикник на обочине", price: 460, genre: "sf" },
    { sku: "master", title: "Мастер и Маргарита", price: 620, genre: "classic" },
    { sku: "karenina", title: "Анна Каренина", price: 710, genre: "classic" },
  ];
  class CatalogList extends HTMLElement {
    static observedAttributes = ["user", "genre"];
    constructor() { super(); this.attachShadow({ mode: "open" }); this.warning = ""; }
    connectedCallback() { this.dataset.team = "catalog"; this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      const user = this.getAttribute("user");
      const genre = this.getAttribute("genre") || "all";
      const books = BOOKS.filter((b) => genre === "all" || b.genre === genre);
      const chip = (g, label) => g === genre ? `<b>${label}</b>` : `<a href="#/catalog${g === "all" ? "" : "?genre=" + g}">${label}</a>`;
      this.shadowRoot.innerHTML = `<style>${frame("catalog", "React")}
          ul { list-style: none; padding: 0; margin: .5rem 0 0; }
          li { display: flex; justify-content: space-between; align-items: center; gap: .5rem; padding: .35rem 0; border-bottom: 1px solid var(--rule); }
          li:last-child { border: 0; }
          .filters { display: flex; gap: .8rem; flex-wrap: wrap; }
          .warn { margin-top: .4rem; }</style>
        <div class="muted">${user ? `Подборка для: <b>${user}</b>` : "Вы не вошли — показываем всё подряд"}</div>
        <div class="filters">Жанр: ${chip("all", "все")} ${chip("sf", "фантастика")} ${chip("classic", "классика")}</div>
        <ul>${books.map((b) => `<li><span>${b.title} <span class="muted">· ${rub(b.price)}</span></span><button data-sku="${b.sku}">В корзину</button></li>`).join("")}</ul>
        ${this.warning ? `<div class="warn">${this.warning}</div>` : ""}`;
      this.shadowRoot.querySelectorAll("button[data-sku]").forEach((btn) => {
        btn.onclick = () => this.addToCart(BOOKS.find((x) => x.sku === btn.dataset.sku));
      });
    }
    addToCart(b) {
      const owned = modeOf(this) === "owned";
      // Каталог сообщает ФАКТ. Он не знает, кто слушает, и не трогает чужое состояние.
      // В режиме owned событие cancelable: владелец подтверждает приём через preventDefault().
      const notHandled = this.dispatchEvent(new CustomEvent("catalog:add-to-cart", {
        detail: { sku: b.sku, title: b.title, price: b.price },
        bubbles: true, composed: true, cancelable: owned,
      }));
      const warning = owned && notHandled ? `Корзина сейчас недоступна — «${b.title}» не добавлена. Попробуйте позже.` : "";
      if (warning !== this.warning) { this.warning = warning; this.render(); }
    }
  }

  // ────────── МФ «Корзина» (команда Корзины, «Vue») — ВЛАДЕЛЕЦ данных корзины ──────────
  class CartBadge extends HTMLElement {
    constructor() {
      super(); this.attachShadow({ mode: "open" });
      this.items = [];
      this.onAdd = (e) => {
        if (this.owned) e.preventDefault();               // «принято» — отправитель узнает об этом синхронно
        this.items = [...this.items, e.detail];
        this.commit({ broadcast: true });
      };
      this.onRequest = () => this.announce();              // опоздавший подписчик просит снимок
    }
    connectedCallback() {
      this.dataset.team = "cart";
      this.owned = modeOf(this) === "owned";
      window.addEventListener("catalog:add-to-cart", this.onAdd);
      if (this.owned) {
        // 1. Состояние живёт дольше компонента: поднимаем его из хранилища владельца.
        //    (В проде источник истины — бэкенд корзины; localStorage здесь — его заменитель.)
        try { this.items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { this.items = []; }
        // 2. Отвечаем тем, кто смонтировался раньше и ждёт снимок.
        window.addEventListener("cart:state-request", this.onRequest);
        // 3. Синхронизация между вкладками: читаем только свой канал.
        try {
          this.bc = new BroadcastChannel(CHANNEL);
          this.bc.onmessage = (m) => { this.items = m.data.items; this.commit({ broadcast: false }); };
        } catch { this.bc = null; }
        this.render();
        this.announce();                                    // «я здесь, вот текущее состояние»
      } else {
        this.render();
      }
    }
    disconnectedCallback() {
      window.removeEventListener("catalog:add-to-cart", this.onAdd);
      window.removeEventListener("cart:state-request", this.onRequest);
      this.bc?.close();
    }
    summary() { return { count: this.items.length, total: this.items.reduce((s, i) => s + i.price, 0) }; }
    announce() { window.dispatchEvent(new CustomEvent("cart:changed", { detail: this.summary() })); }
    commit({ broadcast }) {
      if (this.owned) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items)); } catch {}
        if (broadcast) this.bc?.postMessage({ items: this.items, tab: TAB_ID });   // отправитель своё сообщение не получит
      }
      this.render();
      this.announce();
    }
    render() {
      const { count, total } = this.summary();
      this.shadowRoot.innerHTML = `<style>${frame("cart", "Vue")} :host { padding: .9rem .7rem .5rem; } .row { display: flex; gap: .6rem; align-items: center; white-space: nowrap; }</style>
        <div class="row"><span>Корзина: <b>${count}</b> · ${rub(total)}</span>${count ? `<button>очистить</button>` : ""}</div>`;
      const btn = this.shadowRoot.querySelector("button");
      if (btn) btn.onclick = () => { this.items = []; this.commit({ broadcast: true }); };
    }
  }

  // ────────── МФ «Аккаунт» (команда Аккаунта, «Angular») ──────────
  class AccountPage extends HTMLElement {
    static observedAttributes = ["user"];
    constructor() { super(); this.attachShadow({ mode: "open" }); }
    connectedCallback() { this.dataset.team = "account"; this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      const user = this.getAttribute("user");
      this.shadowRoot.innerHTML = `<style>${frame("account", "Angular")}</style>` + (user
        ? `<p style="margin:0 0 .5rem">Заказы пользователя <b>${user}</b>: «Дюна», «Солярис».</p>
           <a href="#/catalog?genre=sf">Ещё фантастики в каталоге →</a>`
        : `<p class="muted" style="margin:0">Войдите, чтобы увидеть свои заказы.</p>`);
    }
  }

  // ────────── МФ «Рекомендации» (команда Рекомендаций, «Svelte») — читатель чужих данных ──────────
  class PolkaRecs extends HTMLElement {
    constructor() {
      super(); this.attachShadow({ mode: "open" });
      this.count = null;                                    // null = «не знаю»: честнее, чем 0
      this.onChanged = (e) => { this.count = e.detail.count; this.render(); };
    }
    connectedCallback() {
      this.dataset.team = "recs";
      window.addEventListener("cart:changed", this.onChanged);
      this.render();
      // Опоздавший подписчик: всё, что было до монтирования, он пропустил. Просим снимок у владельца.
      if (modeOf(this) === "owned") window.dispatchEvent(new CustomEvent("cart:state-request"));
    }
    disconnectedCallback() { window.removeEventListener("cart:changed", this.onChanged); }
    render() {
      const text = this.count === null
        ? `<span class="muted">Сколько книг в корзине — не знаю: я пропустил все события до своего монтирования.</span>`
        : this.count === 0 ? "Корзина пуста — начните с «Дюны»."
        : `В корзине ${this.count} кн. Тем, кто это купил, понравился «Гиперион».`;
      this.shadowRoot.innerHTML = `<style>${frame("recs", "Svelte")}</style><div>${text}</div>`;
    }
  }

  // ────────── Shell (команда платформы): роутинг, авторизация, сборка страницы ──────────
  class PolkaApp extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.user = null;
      this.cartEnabled = true;
      this.recsEnabled = false;
      this.innerHTML = `
        <style>
          polka-app { display: block; border: 1.5px solid var(--shell); border-radius: 12px; padding: 1.6rem .9rem .9rem; position: relative; background: var(--bg); font-family: var(--sans); font-size: .82rem; }
          polka-app::before { content: "Shell · команда платформы"; position: absolute; top: -.6rem; left: .7rem; background: var(--shell); color: #fff; font-size: .62rem; font-weight: 600; padding: .1rem .45rem; border-radius: 999px; }
          polka-app header { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.2rem; }
          polka-app .brand { font-family: var(--serif); font-weight: 600; font-size: 1.1rem; }
          polka-app nav { display: flex; gap: .8rem; }
          polka-app nav a { color: var(--ink); text-decoration: none; border-bottom: 2px solid transparent; }
          polka-app nav a.on { border-color: var(--shell); }
          polka-app .spacer { flex: 1; }
          polka-app .slot-off { display: inline-block; border: 1.5px dashed var(--rule); border-radius: 10px; padding: .55rem .7rem; color: var(--ink-soft); }
          polka-app .recs-slot:not(:empty) { display: block; margin-top: 1.1rem; }
        </style>
        <header>
          <span class="brand">Полка</span>
          <nav><a href="#/catalog">Каталог</a><a href="#/account">Аккаунт</a></nav>
          <span class="spacer"></span>
          <span class="cart-slot"></span>
          <button class="login" type="button"></button>
        </header>
        <div class="outlet"></div>
        <div class="recs-slot"></div>`;
      this.querySelector(".login").onclick = () => this.setUser(this.user ? null : "Анна");
      this._onHash = () => this.route();
      window.addEventListener("hashchange", this._onHash);
      this.mountCart();
      this.renderLogin();
      this.route();
    }

    parse() {
      const [path, query = ""] = (location.hash.slice(1) || "/catalog").split("?");
      return { path, params: new URLSearchParams(query) };
    }

    route(force = false) {
      const { path, params } = this.parse();
      const outlet = this.querySelector(".outlet");
      const tag = path.startsWith("/account") ? "account-page" : "catalog-list";
      this.querySelectorAll("nav a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + (tag === "account-page" ? "/account" : "/catalog")));
      let mf = outlet.firstElementChild;
      if (force || !mf || mf.localName !== tag) {
        // Монтируем нужный МФ. Начальные атрибуты выставляем ДО вставки в DOM.
        mf = document.createElement(tag);
        if (this.user) mf.setAttribute("user", this.user);
        if (tag === "catalog-list") mf.setAttribute("genre", params.get("genre") || "all");
        outlet.replaceChildren(mf);
        this.logNote(`Shell смонтировал МФ <b>${tag}</b>`);
      } else if (tag === "catalog-list") {
        mf.setAttribute("genre", params.get("genre") || "all");   // ↓ данные из URL идут вниз атрибутом
      }
    }

    setUser(name) {
      this.user = name;
      this.renderLogin();
      // Авторизацией владеет Shell и раздаёт результат вниз — каждому, кому он нужен.
      this.querySelectorAll("catalog-list, account-page").forEach((mf) =>
        name ? mf.setAttribute("user", name) : mf.removeAttribute("user"));
    }

    renderLogin() { this.querySelector(".login").textContent = this.user ? `Выйти (${this.user})` : "Войти как Анна"; }

    mountCart() {
      const slot = this.querySelector(".cart-slot");
      slot.replaceChildren(this.cartEnabled ? document.createElement("cart-badge")
        : Object.assign(document.createElement("span"), { className: "slot-off", textContent: "МФ корзины не загрузился" }));
    }

    setCartEnabled(on) {
      this.cartEnabled = on;
      this.mountCart();
      this.logNote(on ? "Shell снова смонтировал <b>cart-badge</b>" : "<b>cart-badge</b> выгружен — команда Корзины «упала»");
    }

    setRecsEnabled(on) {
      this.recsEnabled = on;
      this.querySelector(".recs-slot").replaceChildren(...(on ? [document.createElement("polka-recs")] : []));
      this.logNote(on ? "Shell смонтировал МФ <b>polka-recs</b> (опоздавший подписчик)" : "<b>polka-recs</b> выгружен");
    }

    /** Переключить учебный режим: перемонтирует все МФ, как будто выкатили новые версии. */
    setMode(mode) {
      this.setAttribute("mode", mode);
      this.logNote(`Выкатили версию <b>${mode === "owned" ? "v2 · по правилам" : "v1 · наивная"}</b>, все МФ перемонтированы`);
      this.mountCart();
      this.route(true);
      if (this.recsEnabled) this.setRecsEnabled(true);
    }

    logNote(html) { document.querySelectorAll("mf-event-log").forEach((l) => l.note && l.note(html)); }
  }

  customElements.define("catalog-list", CatalogList);
  customElements.define("cart-badge", CartBadge);
  customElements.define("account-page", AccountPage);
  customElements.define("polka-recs", PolkaRecs);
  customElements.define("polka-app", PolkaApp);
})();
