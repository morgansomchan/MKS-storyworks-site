/* =========================================================================
   MKS Storyworks, V5
   Four small behaviours. Nothing here is required for the page to read.
   ========================================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------- nav -- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('stuck', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------- reveal -- */
  var reveals = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || reduce) {
    for (var i = 0; i < reveals.length; i++) reveals[i].classList.add('in');
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        revObs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    reveals.forEach(function (el, n) {
      /* Stagger only within a group of siblings, so a list cascades but
         two distant sections never wait on each other. */
      var sibs = el.parentNode ? el.parentNode.children : null;
      var idx = 0;
      if (sibs) for (var k = 0; k < sibs.length; k++) { if (sibs[k] === el) { idx = k; break; } }
      el.style.transitionDelay = Math.min(idx, 5) * 70 + 'ms';
      revObs.observe(el);
    });
  }

  /* -------------------------------------------------------- counters --
     Count up once, when the stat band first comes into view.            */
  var odos = document.querySelectorAll('.odo');

  var runOdo = function (el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(to)) return;

    var dur = 1500, t0 = null;
    var step = function (t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased).toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (odos.length) {
    if (!('IntersectionObserver' in window) || reduce) {
      /* leave the served markup in place: it already shows the number */
    } else {
      var odoObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          runOdo(e.target);
          odoObs.unobserve(e.target);
        });
      }, { threshold: 0.5 });
      odos.forEach(function (el) {
        el.textContent = '0' + (el.getAttribute('data-suffix') || '');
        odoObs.observe(el);
      });
    }
  }

  /* ------------------------------------------------------------- faq --
     One open at a time. Height is animated by CSS (0fr -> 1fr), so there
     is nothing to measure here.                                        */
  var qs = document.querySelectorAll('.qa .q');

  qs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var qa = btn.closest('.qa');
      var isOpen = qa.classList.contains('open');

      document.querySelectorAll('.qa.open').forEach(function (other) {
        other.classList.remove('open');
        var b = other.querySelector('.q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        qa.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ------------------------------------------------- gallery: tabs --
     Two rails behind one set of arrows. The arrows always drive
     whichever pane is showing.                                      */
  var tabs     = document.querySelectorAll('.tab');
  var tabsWrap = document.querySelector('.tabs');
  var panes    = document.querySelectorAll('.pane');
  var railBtns = document.querySelectorAll('.rail-btn');

  var activeRail = function () {
    var pane = document.querySelector('.pane.on');
    return pane ? pane.querySelector('[data-rail]') : null;
  };

  var syncBtns = function () {
    var rail = activeRail();
    if (!rail) return;
    var max = rail.scrollWidth - rail.clientWidth - 2;
    railBtns.forEach(function (b) {
      var dir = parseInt(b.getAttribute('data-dir'), 10);
      b.disabled = dir < 0 ? rail.scrollLeft <= 2 : rail.scrollLeft >= max;
    });
  };

  /* The Videos pane starts hidden, but a <video poster> still downloads its
     poster even inside display:none. Five reel posters is ~585KB of first
     paint for a tab nobody has opened yet, so the posters are held in
     data-poster and attached the first time the tab is shown. */
  var armPosters = function (pane) {
    if (!pane) return;
    pane.querySelectorAll('video[data-poster]').forEach(function (v) {
      v.poster = v.getAttribute('data-poster');
      v.removeAttribute('data-poster');
    });
  };

  var stopAllVideos = function () {
    document.querySelectorAll('.clip video').forEach(function (v) {
      v.pause();
      v.controls = false;
      if (v.parentNode) v.parentNode.classList.remove('playing');
    });
  };

  tabs.forEach(function (tab, idx) {
    tab.addEventListener('click', function () {
      if (tab.classList.contains('on')) return;
      stopAllVideos();

      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      if (tabsWrap) tabsWrap.setAttribute('data-active', idx);

      var want = 'pane-' + tab.getAttribute('data-pane');
      panes.forEach(function (pn) { pn.classList.toggle('on', pn.id === want); });
      armPosters(document.getElementById(want));

      var rail = activeRail();
      if (rail) rail.scrollLeft = 0;
      syncBtns();
    });
  });

  railBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var rail = activeRail();
      if (!rail) return;
      var dir  = parseInt(b.getAttribute('data-dir'), 10);
      var card = rail.querySelector('.shot, .clip');
      var step = card ? card.getBoundingClientRect().width + 14 : 260;
      /* a screenful at a time, but never less than one card */
      var page = Math.max(step, Math.floor(rail.clientWidth / step) * step);
      rail.scrollBy({ left: dir * page, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  armPosters(document.querySelector('.pane.on'));

  /* Any deferred poster outside a tabbed pane gets attached once it is
     close to the viewport, so a clip near the foot of a long page does
     not cost anything at first paint. */
  var loosePosters = document.querySelectorAll('video[data-poster]:not(.pane video)');
  if (loosePosters.length) {
    if (!('IntersectionObserver' in window)) {
      loosePosters.forEach(function (v) {
        v.poster = v.getAttribute('data-poster');
        v.removeAttribute('data-poster');
      });
    } else {
      var posterObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.poster = e.target.getAttribute('data-poster');
          e.target.removeAttribute('data-poster');
          posterObs.unobserve(e.target);
        });
      }, { rootMargin: '400px 0px' });
      loosePosters.forEach(function (v) { posterObs.observe(v); });
    }
  }

  document.querySelectorAll('[data-rail]').forEach(function (r) {
    r.addEventListener('scroll', syncBtns, { passive: true });
  });
  window.addEventListener('resize', syncBtns);
  syncBtns();

  /* ----------------------------------------------- gallery: reels --
     Poster until asked. One plays at a time, and the native controls
     only appear once there is something to control.                 */
  document.querySelectorAll('.clip-play').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var clip = btn.closest('.clip');
      var vid  = clip ? clip.querySelector('video') : null;
      if (!vid) return;

      stopAllVideos();
      clip.classList.add('playing');
      vid.controls = true;
      var p = vid.play();
      if (p && p.catch) p.catch(function () {
        /* autoplay policy or a missing file: hand the frame back */
        clip.classList.remove('playing');
        vid.controls = false;
      });
    });
  });

  document.querySelectorAll('.clip video').forEach(function (v) {
    v.addEventListener('ended', function () {
      v.controls = false;
      if (v.parentNode) v.parentNode.classList.remove('playing');
    });
  });

  /* --------------------------------------------------------- safety --
     If anything above threw, nothing should stay invisible.            */
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
    });
  }, 2600);
})();
