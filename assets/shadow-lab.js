/*
 * <shadow-lab> — стенд «что проходит через границу Shadow DOM».
 * Две одинаковые кнопки: слева в обычном DOM, справа внутри shadow root.
 * Переключатели добавляют на страницу правила «чужой команды», таблица показывает вычисленные стили.
 * Все правила ограничены .sl-arena, чтобы не задеть саму страницу урока.
 */
(function () {
  const RULES = {
    selector: { label: "Чужое правило по селектору: .sl-arena button { background: crimson }", css: ".sl-arena button { background: crimson; color: #fff; }" },
    inherit: { label: "Наследуемые свойства на контейнере: color и font-style", css: ".sl-arena { color: rebeccapurple; font-style: italic; }" },
    token: { label: "CSS-переменная на контейнере: --brand: darkorange", css: ".sl-arena { --brand: darkorange; }" },
  };

  class ShadowLab extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.innerHTML = `
        <style>
          shadow-lab { display: block; font-family: var(--sans); font-size: .82rem; margin: 1.5rem 0; }
          shadow-lab label { display: flex; gap: .5rem; align-items: baseline; margin-bottom: .35rem; cursor: pointer; }
          shadow-lab .sl-arena { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; margin: .9rem 0; }
          shadow-lab .sl-box { border: 1.5px dashed var(--rule); border-radius: 10px; padding: 1.1rem .8rem .8rem; position: relative; text-align: center; }
          shadow-lab .sl-box > span { position: absolute; top: -.6rem; left: .6rem; background: var(--bg); padding: 0 .3rem; font-size: .68rem; font-weight: 600; color: var(--ink-soft); }
          /* :where() обнуляет специфичность базы, чтобы «чужое» правило могло её перебить */
          :where(shadow-lab .sl-arena) button { font: inherit; padding: .4rem .9rem; border-radius: 6px; border: 2px solid var(--brand, gray); background: var(--surface); color: inherit; }
          shadow-lab table { font-size: .76rem; }
          shadow-lab td:not(:first-child), shadow-lab th:not(:first-child) { font-family: var(--mono); font-size: .7rem; }
          shadow-lab .same { color: var(--ok); } shadow-lab .diff { color: var(--bad); font-weight: 600; }
        </style>
        <style class="sl-rules"></style>
        <div class="sl-controls">${Object.entries(RULES).map(([k, r]) =>
          `<label><input type="checkbox" data-rule="${k}"> <span>${r.label}</span></label>`).join("")}</div>
        <div class="sl-arena">
          <div class="sl-box"><span>Обычный DOM</span><button type="button" class="sl-light">Кнопка</button></div>
          <div class="sl-box"><span>Внутри Shadow DOM</span><div class="sl-host"></div></div>
        </div>
        <table><thead><tr><th>Свойство</th><th>Обычный DOM</th><th>Shadow DOM</th></tr></thead><tbody></tbody></table>`;

      const host = this.querySelector(".sl-host");
      const root = host.attachShadow({ mode: "open" });
      // Внутренние стили МФ: та же база, что и у левой кнопки, — чтобы сравнение было честным.
      root.innerHTML = `<style>button { font: inherit; padding: .4rem .9rem; border-radius: 6px; border: 2px solid var(--brand, gray); background: var(--surface); color: inherit; }</style><button type="button">Кнопка</button>`;
      this._light = this.querySelector(".sl-light");
      this._shadow = root.querySelector("button");
      this._rules = this.querySelector(".sl-rules");
      this.querySelectorAll("input[data-rule]").forEach((i) => i.addEventListener("change", () => this.update()));
      this.update();
    }

    update() {
      this._rules.textContent = [...this.querySelectorAll("input[data-rule]:checked")].map((i) => RULES[i.dataset.rule].css).join("\n");
      const props = [["background-color", "фон"], ["color", "цвет текста"], ["font-style", "начертание"], ["border-top-color", "рамка (var(--brand))"]];
      const a = getComputedStyle(this._light), b = getComputedStyle(this._shadow);
      this.querySelector("tbody").innerHTML = props.map(([p, name]) => {
        const same = a.getPropertyValue(p) === b.getPropertyValue(p);
        return `<tr><td>${name}</td><td>${a.getPropertyValue(p)}</td><td class="${same ? "same" : "diff"}">${b.getPropertyValue(p)}</td></tr>`;
      }).join("");
    }

    /** Для автотестов: вычисленные стили обеих кнопок. */
    snapshot() {
      const pick = (el) => { const s = getComputedStyle(el); return { bg: s.backgroundColor, color: s.color, font: s.fontStyle, border: s.borderTopColor }; };
      return { light: pick(this._light), shadow: pick(this._shadow) };
    }
  }

  customElements.define("shadow-lab", ShadowLab);
})();
