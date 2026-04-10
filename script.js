/* ── THEME TOGGLE ─────────────────────────────────────── */
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root   = document.documentElement;

  // Initialise from system preference on first visit
  let currentTheme = root.getAttribute('data-theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', currentTheme);
  updateIcon(currentTheme);

  if (toggle) {
    toggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', currentTheme);
      updateIcon(currentTheme);
    });
  }

  function updateIcon(theme) {
    if (!toggle) return;
    if (theme === 'dark') {
      // Show sun (we're in dark mode — offer to switch to light)
      toggle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>`;
      toggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      // Show moon (we're in light mode — offer to switch to dark)
      toggle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>`;
      toggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  }
})();

/* ── STICKY HEADER ────────────────────────────────────── */
(function () {
  const header = document.getElementById('top')?.closest('header') ||
                 document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── SCROLL REVEAL ────────────────────────────────────── */
(function () {
  const elements = document.querySelectorAll(
    '.skill-card, .timeline-item, .extras-card, .contact-link, .section-header, .hero-meta, .hero-title, .hero-role, .hero-summary, .hero-location, .hero-cta'
  );

  elements.forEach((el) => el.classList.add('fade-up'));

  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
})();

/* ── ACTIVE NAV LINK ──────────────────────────────────── */
(function () {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = document.querySelectorAll('.nav a');

  if (!sections.length || !navLinks.length) return;

  function setActive(id) {
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === '#' + id) {
        link.style.color = 'var(--color-text)';
        link.style.fontWeight = '700';
      } else {
        link.style.color = '';
        link.style.fontWeight = '';
      }
    });
  }

  function onScroll() {
    const scrollY = window.scrollY + 120; // offset for sticky header

    // Find the last section whose top is above the scroll position
    let current = sections[0].id;
    for (const section of sections) {
      if (section.offsetTop <= scrollY) {
        current = section.id;
      }
    }
    setActive(current);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
