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
    track.style.transition = skipAnim ? "none" : "transform .7s ease";
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
if (typeof ResizeObserver !== "undefined") {
  const ro = new ResizeObserver(measure);
  ro.observe(viewport);
} else {
  window.addEventListener("resize", measure);
}

  // -------------------------
  // AUTOPLAY (soft + safe)
  // -------------------------
  let timer = null;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function startAutoplay() {
    if (prefersReduced) return;
    stopAutoplay();
    timer = setInterval(() => {
      // si on est à la fin, on repart au début (boucle)
      const nextIndex = (index >= slides.length - 1) ? 0 : index + 1;
      goTo(nextIndex);
    }, 5000); // 5s
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Pause sur interaction (pro)
  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("touchstart", stopAutoplay, { passive: true });
  slider.addEventListener("touchend", startAutoplay);

  // Reset timer après interaction utilisateur
  prevBtn?.addEventListener("click", () => { stopAutoplay(); startAutoplay(); });
  nextBtn?.addEventListener("click", () => { stopAutoplay(); startAutoplay(); });

  // init
  measure();
  startAutoplay();
});


window.addEventListener('load', () => {
  document.body.classList.add('is-loaded');
});
// Smooth FAQ <details> animation
document.querySelectorAll(".faq-item").forEach((details) => {
  const summary = details.querySelector("summary");
  const content = details.querySelector(".faq-answer");
  if (!summary || !content) return;

  summary.addEventListener("click", (e) => {
    e.preventDefault();

    const isOpen = details.hasAttribute("open");

    content.classList.add("is-animating");

    if (!isOpen) {
      // OPEN
      details.setAttribute("open", "");
      content.style.height = "0px";              // start closed
      requestAnimationFrame(() => {
        const h = content.scrollHeight;
        content.style.height = h + "px";         // animate to full height
      });

      const onEnd = (ev) => {
        if (ev.propertyName !== "height") return;
        content.style.height = "auto";           // let it grow naturally after
        content.classList.remove("is-animating");
        content.removeEventListener("transitionend", onEnd);
      };
      content.addEventListener("transitionend", onEnd);

    } else {
      // CLOSE
      content.style.height = content.scrollHeight + "px";  // set current height
      requestAnimationFrame(() => {
        content.style.height = "0px";                      // animate to 0
      });

      const onEnd = (ev) => {
        if (ev.propertyName !== "height") return;
        details.removeAttribute("open");
        content.classList.remove("is-animating");
        content.removeEventListener("transitionend", onEnd);
      };
      content.addEventListener("transitionend", onEnd);
    }
  });
});
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();
