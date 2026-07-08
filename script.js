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

  const progressBars = document.querySelectorAll('#reelProgress span');
  let current = 0;
  let timer = null;

  function show(index) {
    current = index;
    tabs.forEach((t) => t.classList.toggle('active', Number(t.dataset.slide) === index));
    slides.forEach((s) => s.classList.toggle('active', Number(s.dataset.slide) === index));
    progressBars.forEach((bar, i) => {
      bar.classList.remove('active', 'done');
      if (i < index) bar.classList.add('done');
      if (i === index) bar.classList.add('active');
    });
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

// Phone 3D tilt + glare — mouse-reactive, inspired by the "Social Media Mockup"
// Framer component's tilt/glow/glare effect, built here in plain JS/CSS.
(function () {
  const wrap = document.querySelector('.hero-phone');
  const card = document.querySelector('.phone-frame');
  const glare = document.getElementById('phoneGlare');
  if (!wrap || !card) return;

  const MAX_TILT = 10; // degrees
  let rafId = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function apply() {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    card.style.transform =
      'perspective(1200px) translateY(-6px) rotateX(' + currentY.toFixed(2) + 'deg) rotateY(' + currentX.toFixed(2) + 'deg)';
    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      rafId = requestAnimationFrame(apply);
    } else {
      rafId = null;
    }
  }

  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(apply);
  }

  wrap.addEventListener('mousemove', (event) => {
    const rect = wrap.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width; // 0..1
    const py = (event.clientY - rect.top) / rect.height; // 0..1
    targetX = (px - 0.5) * MAX_TILT * 2;
    targetY = -(py - 0.5) * MAX_TILT * 2;
    if (glare) {
      glare.style.opacity = '1';
      glare.style.background =
        'radial-gradient(circle at ' + (px * 100).toFixed(0) + '% ' + (py * 100).toFixed(0) + '%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 55%)';
    }
    startLoop();
  });

  wrap.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
    if (glare) glare.style.opacity = '0';
    startLoop();
  });
})();
