(function () {
  'use strict';

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
