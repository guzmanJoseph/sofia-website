(() => {
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.querySelector(".site-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const progressBar = document.querySelector(".scroll-progress span");
  const filterButtons = [...document.querySelectorAll(".filter-button")];
  const roleCards = [...document.querySelectorAll(".role-card")];

  // Reveal content as it enters view; keep the full page visible if motion APIs are unavailable.
  if (!reduceMotion && "IntersectionObserver" in window) {
    body.classList.add("js-motion");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });
    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
  }

  // A fine line at the top tracks reading progress.
  let ticking = false;
  const updateProgress = () => {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = range > 0 ? window.scrollY / range : 0;
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  // Small-screen navigation opens in place and closes after a selection.
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("is-open");
  };
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    nav.classList.toggle("is-open", !isOpen);
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 620) closeMenu();
  }, { passive: true });

  // Experience filters ease between newsroom, social, and teaching roles.
  let filterVersion = 0;
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const version = ++filterVersion;
      const selected = button.dataset.filter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      roleCards.forEach((card, index) => {
        const shouldShow = selected === "all" || card.dataset.category === selected;
        card.classList.remove("is-entering");
        if (!shouldShow) {
          if (!card.hidden) {
            card.classList.add("is-leaving");
            window.setTimeout(() => {
              if (version !== filterVersion) return;
              card.hidden = true;
              card.setAttribute("aria-hidden", "true");
              card.classList.remove("is-leaving");
            }, reduceMotion ? 0 : 180);
          }
          return;
        }

        const wasHidden = card.hidden;
        card.hidden = false;
        card.setAttribute("aria-hidden", "false");
        card.classList.remove("is-leaving");
        if (wasHidden && !reduceMotion) {
          window.setTimeout(() => {
            card.classList.add("is-entering");
            window.setTimeout(() => card.classList.remove("is-entering"), 420);
          }, index * 35);
        }
      });
    });
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
