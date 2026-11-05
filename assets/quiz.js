/*
 * Квиз с мгновенной обратной связью.
 * Разметка:
 *   <div class="quiz" data-quiz>
 *     <div class="quiz-q" data-answer="b">
 *       <p class="quiz-prompt">Вопрос</p>
 *       <button data-key="a">…</button> <button data-key="b">…</button> …
 *       <p class="quiz-explain">Почему верно именно так</p>
 *     </div>
 *     … <p class="quiz-score"></p>
 *   </div>
 * Первая попытка засчитывается в счёт; потом можно перепроверять себя.
 */
(function () {
  const css = `
  .quiz-q { border: 1px solid var(--rule); border-radius: 10px; padding: 1.1rem 1.2rem 1rem; margin: 0 0 1.25rem; background: var(--surface); }
  .quiz-q .quiz-prompt { margin: 0 0 .8rem; }
  .quiz-q .quiz-num { font-family: var(--sans); font-size: .72rem; font-weight: 600; color: var(--ink-soft); letter-spacing: .08em; text-transform: uppercase; display: block; margin-bottom: .25rem; }
  .quiz-q button { display: block; width: 100%; text-align: left; margin: 0 0 .45rem; font-size: .85rem; line-height: 1.4; padding: .6rem .8rem; }
  .quiz-q button.right { border-color: var(--ok); box-shadow: inset 3px 0 0 var(--ok); }
  .quiz-q button.wrong { border-color: var(--bad); box-shadow: inset 3px 0 0 var(--bad); opacity: .8; }
  .quiz-q .quiz-explain { display: none; font-size: .88rem; color: var(--ink-soft); margin: .6rem 0 0; padding-top: .6rem; border-top: 1px dashed var(--rule); }
  .quiz-q.done .quiz-explain { display: block; }
  .quiz-score { font-family: var(--sans); font-size: .9rem; font-weight: 600; }
  @media print { .quiz-q .quiz-explain { display: block; } }`;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  document.querySelectorAll("[data-quiz]").forEach((quiz) => {
    const qs = [...quiz.querySelectorAll(".quiz-q")];
    const score = quiz.querySelector(".quiz-score");
    let answered = 0, correct = 0;

    qs.forEach((q, i) => {
      const prompt = q.querySelector(".quiz-prompt");
      if (prompt && !prompt.querySelector(".quiz-num")) {
        const n = document.createElement("span");
        n.className = "quiz-num";
        n.textContent = `Вопрос ${i + 1} из ${qs.length}`;
        prompt.prepend(n);
      }
      q.querySelectorAll("button[data-key]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const ok = btn.dataset.key === q.dataset.answer;
          btn.classList.add(ok ? "right" : "wrong");
          if (!q.classList.contains("done")) {
            q.classList.add("done");
            answered++;
            if (ok) correct++;
            if (score) {
              score.textContent = answered === qs.length
                ? `Итог: ${correct} из ${qs.length} с первой попытки.` +
                  (correct === qs.length ? " Отлично — можно переходить дальше." : " Перечитайте пояснения к ошибкам и попробуйте пересказать их своими словами.")
                : `Отвечено ${answered} из ${qs.length}`;
            }
          }
          if (!ok) {
            const r = q.querySelector(`button[data-key="${q.dataset.answer}"]`);
            r && r.classList.add("right");
          }
        });
      });
    });
  });
})();
