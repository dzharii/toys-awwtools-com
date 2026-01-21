(() => {
  const body = document.body;
  const navList = document.getElementById("nav-list");
  const navToggle = document.querySelector(".nav-toggle");
  const themeToggle = document.querySelector(".theme-toggle");
  const toast = document.querySelector(".toast");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const themeKey = "c99-theme";

  const themeIcons = {
    auto: "◐",
    dark: "☾",
    light: "☀"
  };

  function getStoredTheme() {
    try {
      return localStorage.getItem(themeKey);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(value) {
    try {
      localStorage.setItem(themeKey, value);
    } catch (e) {
      // Storage might be unavailable; fail silently.
    }
  }

  function applyTheme(mode) {
    const next = mode || "auto";
    body.setAttribute("data-theme", next);
    const icon = themeIcons[next] || themeIcons.auto;
    const label = next === "auto" ? "Follow system theme" : `Switch to ${next} mode`;
    themeToggle.querySelector(".theme-icon").textContent = icon;
    themeToggle.setAttribute("aria-label", label);
  }

  function cycleTheme() {
    const current = body.getAttribute("data-theme") || "auto";
    const order = ["auto", "dark", "light"];
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    storeTheme(next);
    applyTheme(next);
  }

  function initTheme() {
    const stored = getStoredTheme();
    applyTheme(stored || "auto");
    themeToggle.addEventListener("click", cycleTheme);
  }

  function initNavToggle() {
    if (!navToggle || !navList) return;
    navToggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navList.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navList.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initScrollSpy() {
    const sections = document.querySelectorAll("main section[id]");
    const navAnchors = new Map();
    document.querySelectorAll(".nav-list a").forEach((a) => {
      const hash = a.getAttribute("href");
      if (hash && hash.startsWith("#")) {
        navAnchors.set(hash.slice(1), a);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = navAnchors.get(id);
          if (!link) return;
          if (entry.isIntersecting) {
            document.querySelectorAll(".nav-list a.active").forEach((el) => el.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0.1 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", (evt) => {
        const targetId = link.getAttribute("href")?.slice(1);
        if (!targetId) return;
        const target = document.getElementById(targetId);
        if (!target) return;
        evt.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });
        history.pushState(null, "", `#${targetId}`);
      });
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 1800);
  }

  function initCopyButtons() {
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const code = btn.parentElement?.querySelector("pre code");
        if (!code) return;
        const text = code.textContent || "";
        try {
          await navigator.clipboard.writeText(text);
          showToast("Copied to clipboard");
        } catch (err) {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "absolute";
          textarea.style.left = "-9999px";
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand("copy");
            showToast("Copied to clipboard");
          } catch (e) {
            showToast("Press Ctrl+C to copy");
          } finally {
            textarea.remove();
          }
        }
      });
    });
  }

  function initReveal() {
    if (prefersReducedMotion) return;
    const revealTargets = Array.from(document.querySelectorAll(".panel, .card, .feature-row, .code-card, .tile, .faq-item"));
    revealTargets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }

  initTheme();
  initNavToggle();
  initScrollSpy();
  initSmoothScroll();
  initCopyButtons();
  initReveal();
})();
