(function () {
  const btn = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  function closeMenu() {
    menu.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();
// =========================
// Milestone slider (PIXEL-PERFECT, RESPONSIVE)
// =========================
document.querySelectorAll("[data-slider]").forEach((slider) => {
  const viewport = slider.querySelector(".ms-viewport");
  const track = slider.querySelector(".ms-track");
  const slides = Array.from(slider.querySelectorAll(".ms-slide"));
  const prevBtn = slider.querySelector(".ms-prev");
  const nextBtn = slider.querySelector(".ms-next");
  const dotsWrap = slider.querySelector(".ms-dots");

  if (!viewport || !track || slides.length === 0) return;

  let index = 0;
  let slideW = 0;

  // Build dots (safe)
  let dots = [];
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ms-dot";
      b.setAttribute("aria-label", `Go to milestone ${i + 1}`);
      b.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(b);
      return b;
    });
  }

  function clamp(i) {
    return Math.max(0, Math.min(slides.length - 1, i));
  }

  function measure() {
    // largeur réelle visible (corrige mobile/desktop)
    slideW = viewport.clientWidth;

    // Fix anti-arrondis: force des tailles en px
    track.style.width = `${slideW * slides.length}px`;
    slides.forEach((s) => {
      s.style.width = `${slideW}px`;
      s.style.flex = `0 0 ${slideW}px`;
      s.style.minWidth = `${slideW}px`;
      s.style.boxSizing = "border-box";
    });

    // snap sans animation après resize
    render(true);
  }

  function render(skipAnim = false) {
  track.style.transition = skipAnim ? "none" : "transform .35s ease";
  track.style.transform = `translate3d(${-index * slideW}px, 0, 0)`;

  slides.forEach((s, i) => {
    s.classList.toggle("is-active", i === index);
  });

  dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) nextBtn.disabled = index === slides.length - 1;

  if (skipAnim) {
    requestAnimationFrame(() => {
      track.style.transition = "transform .35s ease";
    });
  }
}
  function goTo(i) {
    index = clamp(i);
    render(false);
  }

  prevBtn?.addEventListener("click", () => goTo(index - 1));
  nextBtn?.addEventListener("click", () => goTo(index + 1));

  // Keyboard support
  slider.tabIndex = 0;
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  });

  // Swipe (mobile) – attach to viewport (more accurate)
  let startX = 0;
  let isDown = false;

  viewport.addEventListener("touchstart", (e) => {
    isDown = true;
    startX = e.touches[0].clientX;
  }, { passive: true });

  viewport.addEventListener("touchend", (e) => {
    if (!isDown) return;
    isDown = false;
    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goTo(index + 1);
      else goTo(index - 1);
    }
  }, { passive: true });

  // Auto-resize
  const ro = new ResizeObserver(measure);
  ro.observe(viewport);

  // init
  measure();
});
window.addEventListener('load', () => {
  document.body.classList.add('is-loaded');
});
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return;

  const track = slider.querySelector(".ms-track");
  const slides = Array.from(slider.querySelectorAll(".ms-slide"));
  const prevBtn = slider.querySelector(".ms-prev");
  const nextBtn = slider.querySelector(".ms-next");
  const dots = Array.from(slider.querySelectorAll(".ms-dots .ms-dot"));

  if (!track || slides.length === 0) return;

  let index = 0;
  let timer = null;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setActiveClasses() {
    slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(${-index * 100}%)`;
    setActiveClasses();
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  // Hook buttons (keep your UI working)
  if (nextBtn) nextBtn.addEventListener("click", (e) => { e.preventDefault(); stop(); next(); start(); });
  if (prevBtn) prevBtn.addEventListener("click", (e) => { e.preventDefault(); stop(); prev(); start(); });

  // Hook dots (if present)
  if (dots.length) {
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => { stop(); goTo(i); start(); });
    });
  }

  function start() {
    if (prefersReduced) return;
    stop();
    timer = setInterval(next, 5000); // 5s par slide (change si tu veux)
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Pause on hover / touch (pro)
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  slider.addEventListener("touchstart", stop, { passive: true });
  slider.addEventListener("touchend", start);

  // Init
  goTo(0);
  start();
});
