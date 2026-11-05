/*
 * Размытый ответ: <span class="reveal">…</span> или <p class="reveal">…</p>.
 * Ученик сначала делает ставку, потом кликает (или Enter) и видит ответ. При печати ответы видны.
 */
(function () {
  const style = document.createElement("style");
  style.textContent = `
    .reveal { filter: blur(5px); cursor: pointer; transition: filter .2s; }
    .reveal.on { filter: none; cursor: auto; }
    @media print { .reveal { filter: none; } }`;
  document.head.appendChild(style);
  document.querySelectorAll(".reveal").forEach((r) => {
    if (!r.hasAttribute("tabindex")) r.tabIndex = 0;
    r.title = "Кликните, чтобы открыть ответ";
    const on = () => r.classList.add("on");
    r.addEventListener("click", on);
    r.addEventListener("keydown", (e) => e.key === "Enter" && on());
  });
})();
