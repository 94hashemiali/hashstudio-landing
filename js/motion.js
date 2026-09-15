/**
 * Phase 17 — shared IntersectionObserver reveal for homepage (and cheap reuse).
 * Marks [data-hs-reveal] / [data-hs-stagger] children → .hs-reveal-ready → .is-visible.
 * Honors prefers-reduced-motion; forces visible if no IO / JS partial failure.
 */
(function (global) {
  'use strict';

  var STAGGER_CHILD =
    '.home-audience__card, .home-fit__option, .project-card, .process-step, .home-stats__item, .why-us-item, .service-featured, .service-mini, .home-team-card, .faq-item, .testimonial-card, [data-hs-stagger-item]';

  function reduceMotionPref() {
    try {
      return global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (err) {
      return false;
    }
  }

  function forceVisible(root) {
    if (!root) return;
    root.classList.add('hs-motion-off');
    root.querySelectorAll('[data-hs-reveal], [data-hs-stagger]').forEach(function (el) {
      el.classList.add('is-visible');
      el.classList.remove('hs-reveal-ready');
    });
    root.querySelectorAll('.hs-reveal-ready').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  function markReady(el) {
    if (!el || el.classList.contains('hs-reveal-ready') || el.classList.contains('is-visible')) {
      return;
    }
    el.classList.add('hs-reveal-ready');
  }

  function revealNow(el) {
    if (!el) return;
    el.classList.add('is-visible');
    if (el.hasAttribute('data-hs-stagger')) {
      /* Delay child .is-visible so CSS stagger delays can run, then clear lag on hover */
      global.setTimeout(function () {
        el.querySelectorAll('.hs-reveal-ready').forEach(function (child) {
          child.classList.add('is-visible');
        });
      }, 420);
    }
  }

  function setupParallax(root) {
    if (reduceMotionPref()) return;
    if (global.matchMedia && !global.matchMedia('(min-width: 901px)').matches) return;

    var visual = root.querySelector('.home-hero__visual[data-hs-parallax]');
    if (!visual) return;
    var img = visual.querySelector('img');
    if (!img) return;

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      global.requestAnimationFrame(function () {
        ticking = false;
        var rect = visual.getBoundingClientRect();
        var mid = rect.top + rect.height / 2;
        var viewMid = global.innerHeight / 2;
        var delta = Math.max(-24, Math.min(24, (mid - viewMid) * 0.06));
        img.style.transform = 'translate3d(0, ' + delta.toFixed(2) + 'px, 0)';
      });
    }

    global.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initMotion(root) {
    root = root || document.body;
    if (!root || root.getAttribute('data-hs-motion') === 'done') return;
    root.setAttribute('data-hs-motion', 'done');

    if (reduceMotionPref() || !('IntersectionObserver' in global)) {
      forceVisible(root);
      return;
    }

    var targets = [];

    root.querySelectorAll('[data-hs-reveal]').forEach(function (el) {
      markReady(el);
      targets.push(el);
    });

    root.querySelectorAll('[data-hs-stagger]').forEach(function (group) {
      markReady(group);
      group.querySelectorAll(STAGGER_CHILD).forEach(function (child) {
        markReady(child);
      });
      if (targets.indexOf(group) === -1) targets.push(group);
    });

    if (!targets.length) {
      forceVisible(root);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            revealNow(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );

    targets.forEach(function (el) {
      /* Hero entrance is load-time, not scroll (mobile stacks visual above copy). */
      if (el.closest && el.closest('.home-hero')) {
        global.requestAnimationFrame(function () {
          revealNow(el);
        });
        return;
      }
      var rect = el.getBoundingClientRect();
      var inView = rect.top < global.innerHeight * 0.92 && rect.bottom > 0;
      if (inView) {
        revealNow(el);
      } else {
        io.observe(el);
      }
    });

    /* Safety: reveal in-viewport leftovers (IO rootMargin miss); keep below-fold for scroll */
    global.setTimeout(function () {
      root
        .querySelectorAll(
          '[data-hs-reveal].hs-reveal-ready:not(.is-visible), [data-hs-stagger].hs-reveal-ready:not(.is-visible)'
        )
        .forEach(function (el) {
          var rect = el.getBoundingClientRect();
          if (rect.top < global.innerHeight * 0.98 && rect.bottom > 0) {
            revealNow(el);
          }
        });
    }, 1200);

    setupParallax(root);
  }

  global.HASH_MOTION = {
    init: initMotion,
    forceVisible: forceVisible
  };

  function boot() {
    initMotion(document.body);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(typeof window !== 'undefined' ? window : this);
