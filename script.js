// Contact form -> Google Apps Script -> Google Sheet
// The form posts to a hidden iframe so the page never navigates away,
// and there's no CORS issue because it's a real form submission, not a fetch() call.

(function () {
  const form = document.getElementById('contactForm');
  const iframe = document.getElementById('hidden_iframe');
  const success = document.getElementById('formSuccess');
  let submitted = false;

  if (!form) return;

  form.addEventListener('submit', function (event) {
    // Basic guard: don't let this fire until a real script URL is configured.
    if (form.action.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {
      event.preventDefault();
      alert('Form is not connected yet — paste your Google Apps Script Web App URL into the form\'s "action" attribute in index.html.');
      return false;
    }
    submitted = true;
  });

  iframe.addEventListener('load', function () {
    if (!submitted) return; // ignore the initial blank load on page load
    form.style.display = 'none';
    success.classList.add('visible');
    submitted = false;
  });
})();

// Scroll-reveal: fade/slide elements up into view once, then leave them alone.
(function () {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
})();

// Count-up animation for the case-study stats.
(function () {
  const numbers = document.querySelectorAll('[data-count-to]');
  if (!numbers.length) return;

  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count-to'));
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = target * eased;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  if (!('IntersectionObserver' in window)) {
    numbers.forEach(animateCount);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  numbers.forEach((el) => observer.observe(el));
})();

// Work Showcase phone mockup — tab-controlled slides, auto-advance between clicks.
(function () {
  const tabs = document.querySelectorAll('.showcase-tab');
  const slides = document.querySelectorAll('.phone-slide');
  if (!tabs.length || !slides.length) return;

  let current = 0;
  let timer = null;

  function show(index) {
    current = index;
    tabs.forEach((t) => t.classList.toggle('active', Number(t.dataset.slide) === index));
    slides.forEach((s) => s.classList.toggle('active', Number(s.dataset.slide) === index));
  }

  function next() {
    show((current + 1) % slides.length);
  }

  function restartAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, 4000);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      show(Number(tab.dataset.slide));
      restartAutoplay();
    });
  });

  restartAutoplay();
})();
