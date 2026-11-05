/*
 * <mf-event-log> — журнал сообщений между микрофронтендами.
 * Ничего не требует от наблюдаемого кода: он сам слушает настоящие каналы связи.
 *
 *   <mf-event-log
 *     listen="catalog:add-to-cart cart:changed"   — имена CustomEvent, ловятся на window
 *     watch="#demo"                               — корень, в котором следить за атрибутами
 *     attrs="user genre"                          — какие атрибуты логировать
 *     url                                         — логировать смену адреса (hashchange)
 *     broadcast="polka-cart">                     — подслушивать BroadcastChannel (сообщения между вкладками)
 *   </mf-event-log>
 *
 * Команда элемента берётся из его data-team. Команда события — из префикса имени.
 */
(function () {
  const TEAM_NAMES = { shell: "Shell", catalog: "Каталог", cart: "Корзина", account: "Аккаунт", recs: "Рекомендации" };
  const CHANNELS = {
    attr: { label: "атрибут ↓", hint: "контейнер передаёт данные вниз" },
    event: { label: "событие ↑", hint: "МФ сообщает о факте, не зная получателей" },
    url: { label: "URL ⇄", hint: "намерение пользователя в адресной строке" },
    tab: { label: "вкладка ⇆", hint: "BroadcastChannel: сообщение между вкладками одного origin" },
    note: { label: "заметка", hint: "" },
  };

  class MfEventLog extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `
        <style>
          :host { display: block; font-family: var(--sans); font-size: .76rem; }
          .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: .4rem; color: var(--ink-soft); }
          .head b { font-weight: 600; letter-spacing: .08em; text-transform: uppercase; font-size: .68rem; }
          button { font: inherit; font-size: .7rem; border: 1px solid var(--rule); background: var(--surface); color: var(--ink-soft); border-radius: 5px; padding: .2rem .5rem; cursor: pointer; }
          ol { list-style: none; margin: 0; padding: 0; max-height: 15rem; overflow-y: auto; border: 1px solid var(--rule); border-radius: 8px; background: var(--surface); }
          li { display: grid; grid-template-columns: 5.6rem 1fr; gap: .2rem .6rem; padding: .45rem .6rem; border-bottom: 1px solid var(--rule); animation: in .35s ease; }
          li:last-child { border-bottom: 0; }
          .empty { color: var(--ink-soft); display: block; padding: .8rem; }
          .ch { font-weight: 600; border-radius: 4px; padding: .05rem .35rem; align-self: start; text-align: center; white-space: nowrap; }
          .ch.attr { background: color-mix(in srgb, var(--shell) 22%, transparent); }
          .ch.event { background: color-mix(in srgb, var(--accent) 22%, transparent); }
          .ch.url { background: color-mix(in srgb, var(--account) 25%, transparent); }
          .ch.note { background: var(--code-bg); }
          .ch.tab { background: color-mix(in srgb, var(--recs) 25%, transparent); }
          .route { color: var(--ink); }
          .route .t { font-weight: 600; }
          code { font-family: var(--mono); font-size: .72rem; color: var(--ink-soft); grid-column: 2; word-break: break-all; }
          @keyframes in { from { background: var(--accent-soft); } to { background: transparent; } }
        </style>
        <div class="head"><b>Журнал сообщений</b><button type="button">очистить</button></div>
        <ol><li class="empty">Пока тихо. Покликайте по приложению выше.</li></ol>`;
      this._list = root.querySelector("ol");
      root.querySelector("button").onclick = () => this.clear();

      (this.getAttribute("listen") || "").split(/\s+/).filter(Boolean).forEach((name) => {
        window.addEventListener(name, (e) => {
          const team = name.split(":")[0];
          this.add("event", `<span class="t">${TEAM_NAMES[team] || team}</span> → кому интересно`, `${name} ${JSON.stringify(e.detail ?? null)}`);
        });
      });

      if (this.hasAttribute("url")) {
        window.addEventListener("hashchange", () => {
          this.add("url", `адресная строка → <span class="t">Shell</span> (роутер)`, location.hash || "#/");
        });
      }

      const bcName = this.getAttribute("broadcast");
      if (bcName) {
        try {
          // Отдельный объект канала: он слышит и свою вкладку (MDN: не получает только тот объект, что отправил).
          this._bc = new BroadcastChannel(bcName);
          this._bc.onmessage = (m) => {
            const mine = m.data && m.data.tab === document.documentElement.dataset.tab;
            this.add("tab", mine ? `<span class="t">эта вкладка</span> → другие вкладки` : `<span class="t">другая вкладка</span> → эта вкладка`,
              `${bcName} ${JSON.stringify(m.data && m.data.items ? { count: m.data.items.length } : m.data)}`);
          };
        } catch { /* нет BroadcastChannel */ }
      }

      const watchRoot = document.querySelector(this.getAttribute("watch") || "body");
      const attrs = (this.getAttribute("attrs") || "").split(/\s+/).filter(Boolean);
      if (watchRoot && attrs.length) {
        new MutationObserver((muts) => {
          muts.forEach((m) => {
            if (m.type !== "attributes" || !m.target.isConnected) return;
            const v = m.target.getAttribute(m.attributeName);
            if (v === m.oldValue) return;
            const to = TEAM_NAMES[m.target.dataset.team] || m.target.localName;
            this.add("attr", `<span class="t">Shell</span> → <span class="t">${to}</span>`,
              `<${m.target.localName} ${m.attributeName}=${v === null ? "(удалён)" : JSON.stringify(v)}>`);
          });
        }).observe(watchRoot, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: attrs });
      }
    }

    /** Ручная запись — для событий жизненного цикла (МФ загружен/выгружен). */
    note(text) { this.add("note", text, ""); }

    add(kind, route, payload) {
      const empty = this._list.querySelector(".empty");
      if (empty) empty.remove();
      const li = document.createElement("li");
      const ch = CHANNELS[kind];
      li.innerHTML = `<span class="ch ${kind}" title="${ch.hint}">${ch.label}</span><span class="route">${route}</span>` +
        (payload ? `<code></code>` : "");
      if (payload) li.querySelector("code").textContent = payload;
      this._list.prepend(li);
    }

    clear() { this._list.innerHTML = `<li class="empty">Журнал очищен.</li>`; }
  }

  customElements.define("mf-event-log", MfEventLog);
})();
