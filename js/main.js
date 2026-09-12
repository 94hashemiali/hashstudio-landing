(function () {
  'use strict';

  (function loadFonts() {
    if (document.getElementById('hash-font-vazirmatn')) return;
    var pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    var pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';
    var font = document.createElement('link');
    font.id = 'hash-font-vazirmatn';
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800&display=swap';
    var head = document.head;
    head.appendChild(pre1);
    head.appendChild(pre2);
    head.appendChild(font);
  })();

  const header = document.querySelector('.site-header, .home-header');
  const toggle = document.querySelector('.site-header__toggle, .home-header__toggle');
  const nav = document.querySelector('.site-header__nav, .home-header__nav');

  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  function setNavOpen(isOpen) {
    if (!toggle || !nav) return;
    nav.classList.toggle('is-open', isOpen);
    toggle.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'بستن منو' : 'باز کردن منو');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNavOpen(!nav.classList.contains('is-open'));
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      setNavOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setNavOpen(false);
      }
    });

    nav.querySelectorAll('.site-header__link, .home-header__link').forEach(function (link) {
      link.addEventListener('click', function () {
        setNavOpen(false);
      });
    });

    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 64.01rem)').matches) {
        setNavOpen(false);
      }
    });
  }
})();
