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
// Also covers .fan-reveal (How It Works cards), which fades opacity only so
// it doesn't fight the rotated transform those cards already have.
(function () {
  const targets = document.querySelectorAll('.reveal, .fan-reveal');
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

// Work Showcase phone mockup — vertical swipe-up transitions, like native
// Reels/TikTok. Advances via tab clicks, auto-advance, or a real swipe/drag
// on the phone screen itself. Videos autoplay from the moment the page loads
// (autoplay/muted/playsinline on the <video> tags) — swiping just changes
// which one is on top.
(function () {
  const tabs = document.querySelectorAll('.showcase-tab');
  const slides = document.querySelectorAll('.phone-slide');
  const screen = document.getElementById('phoneScreen');
  if (!slides.length) return;

  const progressBars = document.querySelectorAll('#reelProgress span');
  let current = 0;
  let timer = null;

  function show(index) {
    const total = slides.length;
    current = ((index % total) + total) % total;

    tabs.forEach((t) => t.classList.toggle('active', Number(t.dataset.slide) === current));

    slides.forEach((s) => {
      const i = Number(s.dataset.slide);
      s.classList.remove('active', 'prev');
      if (i === current) {
        s.classList.add('active');
      } else if (i < current) {
        s.classList.add('prev');
      }
    });

    progressBars.forEach((bar, i) => {
      bar.classList.remove('active', 'done');
      if (i < current) bar.classList.add('done');
      if (i === current) bar.classList.add('active');
    });
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  function restartAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, 5000);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      show(Number(tab.dataset.slide));
      restartAutoplay();
    });
  });

  // Swipe up = next reel, swipe down = previous reel (touch + mouse drag).
  if (screen) {
    let startY = null;

    screen.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
    screen.addEventListener('touchend', (e) => {
      if (startY === null) return;
      const deltaY = e.changedTouches[0].clientY - startY;
      if (Math.abs(deltaY) > 40) {
        deltaY < 0 ? next() : prev();
        restartAutoplay();
      }
      startY = null;
    });

    let dragStartY = null;
    screen.addEventListener('mousedown', (e) => { dragStartY = e.clientY; });
    window.addEventListener('mouseup', (e) => {
      if (dragStartY === null) return;
      const deltaY = e.clientY - dragStartY;
      if (Math.abs(deltaY) > 40) {
        deltaY < 0 ? next() : prev();
        restartAutoplay();
      }
      dragStartY = null;
    });
  }

  show(0);
  restartAutoplay();
})();

// How It Works cards use the same .reveal fade-up-on-scroll system as the
// rest of the site (see the IntersectionObserver block above) — their fanned
// rotation and overlap is handled entirely in CSS.
