/* MKS Storyworks — v4
   Two jobs: reveal-on-scroll, and a border on the nav once it lifts off the hero. */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- reveal on scroll ------------------------------------------------ */
  var items = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });

    /* Anything already in view on load reveals immediately — no blank hero. */
    requestAnimationFrame(function () {
      items.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      });
    });
  }

  /* --- hero video: the flip ---------------------------------------------
     Deliberately not relying on IntersectionObserver's initial callback —
     a plain visibility check on load and on scroll is deterministic.
     Tall screen: the video is already partly in view, so it lands just after
     the headline. Short screen or phone: it starts below the fold and lands
     as you scroll to it. */
  var tilt = document.querySelector('.vsl.tilt');
  if (tilt) {
    if (reduced) {
      tilt.classList.add('landed');
    } else {
      var done = false;
      var firstRun = true;

      var visibleEnough = function () {
        var r = tilt.getBoundingClientRect();
        if (!r.height) return false;
        var shown = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        return shown / r.height >= 0.3;
      };

      var check = function () {
        if (done) return;
        if (!visibleEnough()) { firstRun = false; return; }
        done = true;
        var delay = firstRun ? 620 : 0;   // in view at load -> let the headline land first
        window.setTimeout(function () { tilt.classList.add('landed'); }, delay);
        window.removeEventListener('scroll', check);
        window.removeEventListener('resize', check);
      };

      window.addEventListener('scroll', check, { passive: true });
      window.addEventListener('resize', check);
      requestAnimationFrame(check);
    }
  }

  /* --- gallery carousel: coverflow, looping -------------------------------
     Clones a handful of slides onto each end so there is always something
     either side, then snaps silently back into the real range at the seam.
     Video clones become their poster image — cheap, and identical while idle. */
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel-track');
    var view  = root.querySelector('.carousel-viewport');
    var prev  = root.querySelector('[data-prev]');
    var next  = root.querySelector('[data-next]');
    var dotBox = root.querySelector('[data-dots]');
    if (!track) return;

    var real = Array.prototype.slice.call(track.querySelectorAll('.slide'));
    var N = real.length;
    if (!N) return;

    var K = Math.min(5, N);          /* clones per side */

    var makeClone = function (src) {
      var c = src.cloneNode(true);          /* keep the post chrome */
      var vid = c.querySelector('video');
      if (vid) {                            /* but not a second video element */
        var img = document.createElement('img');
        img.src = vid.getAttribute('poster');
        img.alt = '';
        img.loading = 'lazy';
        vid.parentNode.replaceChild(img, vid);
        var b = c.querySelector('.slide-badge');
        if (b) b.remove();
      }
      c.setAttribute('aria-hidden', 'true');
      c.dataset.clone = '1';
      return c;
    };

    for (var i = 0; i < K; i++) {
      track.appendChild(makeClone(real[i % N]));                  /* tail */
      track.insertBefore(makeClone(real[(N - 1 - i) % N]), track.firstChild); /* head */
    }

    var slides = Array.prototype.slice.call(track.querySelectorAll('.slide'));
    slides.forEach(function (s, i) { s.dataset.i = i; });

    var FIRST = K;                   /* index of real slide 0 */
    var index = FIRST;

    var realIndexOf = function (i) { return ((i - FIRST) % N + N) % N; };

    var paint = function (dragPx, animate) {
      track.style.transition = animate === false ? 'none' : '';
      var s = slides[index];
      if (!s) return;
      var centre = view.getBoundingClientRect().width / 2;
      var x = centre - (s.offsetLeft + s.offsetWidth / 2) + (dragPx || 0);
      track.style.transform = 'translateX(' + x + 'px)';
      slides.forEach(function (el, i) {
        el.setAttribute('data-d', Math.min(3, Math.abs(i - index)));
      });
      var r = realIndexOf(index);
      dots.forEach(function (d, i) { d.classList.toggle('on', i === r); });
    };

    /* jump back into the real range without showing the move */
    var reseat = function () {
      if (index >= FIRST && index < FIRST + N) return;
      index = index < FIRST ? index + N : index - N;
      paint(0, false);
      void track.offsetWidth;        /* flush, so the next move animates */
      track.style.transition = '';
    };
    track.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'transform') reseat();
    });

    var go = function (i) {
      var cur = slides[index] && slides[index].querySelector('video');
      if (cur && !cur.paused) cur.pause();
      index = i;
      paint();
    };

    var dots = [];
    if (dotBox) {
      dotBox.innerHTML = '';
      real.forEach(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'c-dot';
        b.setAttribute('aria-label', 'Go to item ' + (i + 1));
        b.addEventListener('click', function () { go(FIRST + i); });
        dotBox.appendChild(b);
        dots.push(b);
      });
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    });

    var down = null, moved = 0;
    track.addEventListener('pointerdown', function (e) { down = e.clientX; moved = 0; });
    window.addEventListener('pointermove', function (e) {
      if (down === null) return;
      moved = e.clientX - down;
      paint(moved, false);
    });
    window.addEventListener('pointerup', function () {
      if (down === null) return;
      track.style.transition = '';
      var w = slides[index] ? slides[index].offsetWidth : 300;
      if (moved < -w * 0.18) go(index + 1);
      else if (moved > w * 0.18) go(index - 1);
      else paint();
      down = null;
    });

    slides.forEach(function (slide, i) {
      var vid = slide.querySelector('video');
      slide.addEventListener('click', function () {
        if (Math.abs(moved) > 6) return;
        if (i !== index) { go(i); return; }
        if (vid && vid.paused) { vid.controls = true; vid.play(); }
      });
      if (!vid) return;
      vid.addEventListener('play',  function () { slide.classList.add('playing'); });
      vid.addEventListener('pause', function () { slide.classList.remove('playing'); });
      vid.addEventListener('ended', function () {
        slide.classList.remove('playing');
        vid.controls = false;
        vid.load();
      });
    });

    paint(0, false);
    window.addEventListener('resize', function () { paint(0, false); });
    window.addEventListener('load',   function () { paint(0, false); });
  });

  /* --- the leak funnel fills on arrival ------------------------------------ */
  (function () {
    var f = document.querySelector('.funnel');
    if (!f) return;
    if (reduced || !('IntersectionObserver' in window)) { f.classList.add('go'); return; }
    var fio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { f.classList.add('go'); fio.unobserve(e.target); } });
    }, { threshold: 0.3 });
    fio.observe(f);
  })();

  /* --- the cone only animates while you can see it ------------------------ */
  (function () {
    var cone = document.querySelector('.conewrap');
    if (!cone) return;
    if (reduced) return;
    if (!('IntersectionObserver' in window)) { cone.classList.add('running'); return; }
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { cone.classList.toggle('running', e.isIntersecting); });
    }, { threshold: 0.15 });
    cio.observe(cone);
  })();

  /* --- ecosystem circuit: each node explains its handoff -------------------- */
  document.querySelectorAll('[data-eco-root]').forEach(function (root) {
    var cap  = root.querySelector('[data-eco-cap]');
    var base = cap ? cap.innerHTML : '';
    var copy = [
      'They see you — reels, posts, the story you actually have.',
      'They check you out — bio, highlights, and a link worth tapping.',
      'They verify you — hours, photos and reviews that match reality.',
      'They book — on your system, with the guest data staying yours.',
      'You reach them again — which is where the next visit starts.'
    ];
    root.querySelectorAll('.node').forEach(function (n, i) {
      var show = function () {
        if (cap) cap.innerHTML = '<b>0' + (i + 1) + '</b> &nbsp;' + copy[i];
      };
      var clear = function () { if (cap) cap.innerHTML = base; };
      n.addEventListener('mouseenter', show);
      n.addEventListener('focus', show);
      n.addEventListener('mouseleave', clear);
      n.addEventListener('blur', clear);
    });
  });

  /* --- donut: hover or focus a slice / legend row to isolate it ----------- */
  document.querySelectorAll('[data-donut]').forEach(function (root) {
    var segs = Array.prototype.slice.call(root.querySelectorAll('circle[data-seg]'));
    var rows = Array.prototype.slice.call(root.querySelectorAll('.dk'));
    var foot = root.querySelector('[data-donut-foot]');
    var base = foot ? foot.innerHTML : '';
    var pct  = ['85.9%', '10.5%', '3.6%'];

    var show = function (i) {
      segs.forEach(function (s, n) {
        s.classList.toggle('up',  n === i);
        s.classList.toggle('dim', i !== null && n !== i);
      });
      rows.forEach(function (r, n) { r.classList.toggle('on', n === i); });
      if (!foot) return;
      if (i === null) { foot.innerHTML = base; return; }
      var name = rows[i].querySelector('.n').textContent;
      var val  = rows[i].querySelector('.v').textContent;
      foot.innerHTML = '<b>' + val + '</b> ' + name.toLowerCase() + ' — ' + pct[i] + ' of everything they did.';
    };

    var bind = function (el, i) {
      el.addEventListener('mouseenter', function () { show(i); });
      el.addEventListener('focus',      function () { show(i); });
      el.addEventListener('mouseleave', function () { show(null); });
      el.addEventListener('blur',       function () { show(null); });
    };
    segs.forEach(bind);
    rows.forEach(bind);
  });

  /* --- services: list selects the visual ---------------------------------- */
  (function () {
    var tabs  = Array.prototype.slice.call(document.querySelectorAll('.svc-item'));
    var panes = Array.prototype.slice.call(document.querySelectorAll('.svc-pane'));
    if (!tabs.length) return;

    var select = function (i) {
      tabs.forEach(function (t, n) { t.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
      panes.forEach(function (p, n) { p.classList.toggle('on', n === i); });
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i); });
      tab.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          var n = (i + 1) % tabs.length; tabs[n].focus(); select(n);
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var p = (i - 1 + tabs.length) % tabs.length; tabs[p].focus(); select(p);
        }
      });
    });
  })();

  /* --- odometers ----------------------------------------------------------
     Count up once, when the number arrives on screen. */
  (function () {
    var odos = Array.prototype.slice.call(document.querySelectorAll('.odo'));
    if (!odos.length) return;

    var group = function (n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); };

    var run = function (el) {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      var target = parseFloat(el.dataset.to || '0');
      if (reduced || !target) { el.textContent = group(target); return; }

      var dur = 1500, t0 = null;
      var tick = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);          /* ease-out cubic */
        el.textContent = group(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = group(target);
      };
      el.textContent = '0';
      requestAnimationFrame(tick);
    };

    if (reduced || !('IntersectionObserver' in window)) {
      odos.forEach(run);
      return;
    }
    var oio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); oio.unobserve(entry.target); }
      });
    }, { threshold: 0.35 });
    odos.forEach(function (el) { oio.observe(el); });
  })();

  /* --- safety net --------------------------------------------------------
     If the browser never delivers a frame (background tab, throttled renderer,
     an observer that misbehaves), nothing should stay invisible. */
  window.setTimeout(function () {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      el.classList.add('in');
    });
    var v = document.querySelector('.vsl.tilt:not(.landed)');
    if (v) v.classList.add('landed');
    var fn = document.querySelector('.funnel:not(.go)');
    if (fn) fn.classList.add('go');
    document.querySelectorAll('.odo:not([data-done])').forEach(function (el) {
      el.dataset.done = '1';
      var n = parseFloat(el.dataset.to || '0');
      el.textContent = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    });
  }, 2600);

  /* --- nav border once scrolled ---------------------------------------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
