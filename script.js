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

// How It Works — scroll-scrubbed stacked/fanned cards. As the pinned section
// scrolls through view, each card animates from a scattered position into a
// neat overlapping fan, staggered one after another.
(function () {
  const track = document.getElementById('stackTrack');
  const cards = document.querySelectorAll('.stack-card');
  if (!track || !cards.length) return;
  if (window.matchMedia('(max-width: 860px)').matches) return; // static stack on mobile

  const scattered = [
    { x: -80, y: -40, rot: -11 },
    { x: 55, y: 25, rot: 8 },
    { x: -25, y: 70, rot: -5 }
  ];
  const settled = [
    { x: -20, y: -16, rot: -6 },
    { x: 0, y: 0, rot: 0 },
    { x: 20, y: 16, rot: 6 }
  ];

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  let ticking = false;

  function update() {
    ticking = false;
    const rect = track.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const progress = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
    const n = cards.length;

    cards.forEach((card, i) => {
      const start = i / n;
      const end = start + (1 / n) * 1.5;
      const local = clamp((progress - start) / (end - start), 0, 1);
      const eased = 1 - Math.pow(1 - local, 3);
      const from = scattered[i];
      const to = settled[i];
      const x = lerp(from.x, to.x, eased);
      const y = lerp(from.y, to.y, eased);
      const rot = lerp(from.rot, to.rot, eased);
      const opacity = clamp(local * 2.2, 0, 1);
      card.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(1) + 'deg)';
      card.style.opacity = String(opacity);
      card.style.zIndex = String(i + 1);
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
