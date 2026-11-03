// Portfolio revamp prototype — the one interactive piece: the photo viewer.
// In the real app this becomes components/portfolio/lightbox.tsx (already
// built in Story 1.6, same behaviour): dialog, focus trap + restore, Esc,
// ←/→, swipe, counter, caption.

(function () {
  const tiles = Array.from(document.querySelectorAll("[data-photo]"));
  const box = document.getElementById("lightbox");
  if (!box || tiles.length === 0) return;

  const img = box.querySelector("img");
  const caption = box.querySelector(".lightbox__caption");
  const counter = box.querySelector("[data-counter]");
  const prev = box.querySelector(".lightbox__prev");
  const next = box.querySelector(".lightbox__next");
  const close = box.querySelector(".lightbox__close");
  let index = -1;
  let opener = null;

  function show(i) {
    index = i;
    const t = tiles[i];
    img.src = t.dataset.photo;
    img.alt = t.querySelector("img").alt;
    caption.innerHTML = t.dataset.caption || "";
    counter.textContent = `${i + 1} / ${tiles.length}`;
    prev.disabled = i === 0;
    next.disabled = i === tiles.length - 1;
  }

  function open(i) {
    opener = tiles[i];
    show(i);
    box.hidden = false;
    document.body.style.overflow = "hidden";
    close.focus();
  }

  function shut() {
    box.hidden = true;
    document.body.style.overflow = "";
    (tiles[index] || opener)?.focus();
  }

  tiles.forEach((t, i) => t.addEventListener("click", () => open(i)));
  prev.addEventListener("click", () => index > 0 && show(index - 1));
  next.addEventListener("click", () => index < tiles.length - 1 && show(index + 1));
  close.addEventListener("click", shut);
  box.addEventListener("click", (e) => { if (e.target.classList.contains("lightbox__stage")) shut(); });

  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") shut();
    else if (e.key === "ArrowLeft" && index > 0) show(index - 1);
    else if (e.key === "ArrowRight" && index < tiles.length - 1) show(index + 1);
    else if (e.key === "Tab") {
      const f = [close, prev, next].filter((b) => !b.disabled);
      const at = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  let x0 = null;
  box.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (dx > 50 && index > 0) show(index - 1);
    if (dx < -50 && index < tiles.length - 1) show(index + 1);
  });
})();

// Prototype-only: hide/show the yellow annotation notes.
(function () {
  const b = document.createElement("button");
  b.className = "proto-toggle";
  b.type = "button";
  b.textContent = "Hide notes";
  b.onclick = () => {
    document.body.classList.toggle("hide-notes");
    b.textContent = document.body.classList.contains("hide-notes") ? "Show notes" : "Hide notes";
  };
  document.body.appendChild(b);
})();
