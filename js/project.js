/**
 * Progressive enhancement for static project pages.
 * Content, SEO, and TOC markup are server-rendered; this file only enhances UX.
 */
(function () {
  'use strict';

  var root = document.getElementById('project-root');
  if (!root) return;

  function reduceMotionPref() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  var tocNav = root.querySelector('[data-list="toc"]') || document.querySelector('[data-list="toc"]');
  var tocWrap = document.querySelector('[data-pd-toc], .pd-toc');
  var tocLinks = tocNav
    ? Array.prototype.slice.call(tocNav.querySelectorAll('.pd-toc__link'))
    : [];

  if (tocNav && tocLinks.length) {
    tocNav.addEventListener('click', function (event) {
      var link = event.target.closest('a.pd-toc__link');
      if (!link) return;
      var hash = link.getAttribute('href');
      if (!hash) return;
      var id = hash.indexOf('#') >= 0 ? hash.slice(hash.indexOf('#') + 1) : '';
      if (!id) return;
      var target = document.getElementById(id) || root.querySelector('#' + id);
      if (!target) return;
      event.preventDefault();
      var behavior = reduceMotionPref() ? 'auto' : 'smooth';
      target.scrollIntoView({ behavior: behavior, block: 'start' });
      if (history && history.replaceState) {
        history.replaceState(null, '', '#' + id);
      }
    });
  } else if (tocWrap && (!tocLinks || !tocLinks.length)) {
    // Prefer HTML TOC; if empty and fewer than 3 visible sections, keep hidden.
    var visible = 0;
    root.querySelectorAll('[data-toc]').forEach(function (section) {
      if (!section.hidden) visible += 1;
    });
    if (visible < 3) tocWrap.hidden = true;
  }

  var progressEl = document.querySelector('[data-pd-progress]');
  function updateProgress() {
    if (!progressEl) return;
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop || 0;
    var height = Math.max(doc.scrollHeight - window.innerHeight, 1);
    var pct = Math.min(100, Math.max(0, (scrollTop / height) * 100));
    progressEl.style.width = pct + '%';
    progressEl.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  function updateTocActive() {
    if (!tocLinks.length) return;
    var marker = window.scrollY + Math.min(160, window.innerHeight * 0.25);
    var activeId = '';
    root.querySelectorAll('[data-toc]').forEach(function (section) {
      if (section.hidden || !section.id) return;
      if (section.offsetTop <= marker) activeId = section.id;
    });
    tocLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var hash = href.indexOf('#') >= 0 ? href.slice(href.indexOf('#')) : href;
      var on = hash === '#' + activeId;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function onScroll() {
    updateProgress();
    updateTocActive();
  }

  updateProgress();
  updateTocActive();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var reduceMotion = reduceMotionPref();
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var reveals = root.querySelectorAll(
      '.pd-reveal, .pd-hero__intro, .pd-hero__media, .pd-meta, .pd-section, .pd-related'
    );
    reveals.forEach(function (el) {
      el.classList.add('pd-reveal-ready');
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
    );
    reveals.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (inView) {
        el.classList.add('is-visible');
      } else {
        io.observe(el);
      }
    });
  } else {
    root.classList.add('pd-motion-off');
  }
})();
