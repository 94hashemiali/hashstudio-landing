(function () {
  'use strict';

  var info = window.HASH_STUDIO;
  if (!info) return;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.querySelectorAll('[data-studio="address"]').forEach(function (el) {
    el.textContent = info.address;
  });

  document.querySelectorAll('[data-studio="address-short"]').forEach(function (el) {
    el.textContent = info.addressShort;
  });

  document.querySelectorAll('[data-studio="phones"]').forEach(function (el) {
    el.innerHTML = info.phones.map(function (phone) {
      return '<a href="' + escapeHtml(phone.href) + '">' + escapeHtml(phone.label) + '</a>';
    }).join('');
  });

  document.querySelectorAll('[data-studio="email"]').forEach(function (el) {
    var mail = info.email;
    if (el.tagName === 'A') {
      el.href = 'mailto:' + mail;
      el.textContent = mail;
    } else {
      el.innerHTML = '<a href="mailto:' + escapeHtml(mail) + '">' + escapeHtml(mail) + '</a>';
    }
  });

  document.querySelectorAll('[data-studio="social"]').forEach(function (el) {
    var linkClass = el.getAttribute('data-studio-social-class') || 'home-footer__social-link';
    el.innerHTML = info.socials.map(function (social) {
      return '<a href="' + escapeHtml(social.href) + '" class="' + escapeHtml(linkClass) +
        '" aria-label="' + escapeHtml(social.label) +
        '" target="_blank" rel="noopener noreferrer">' + escapeHtml(social.short) + '</a>';
    }).join('');
  });

  document.querySelectorAll('a.home-header__profile').forEach(function (el) {
    el.setAttribute('aria-label', 'تماس با ما');
  });

  var main = document.querySelector('main');
  var mainId = (main && main.id) ? main.id : 'main-content';
  if (main && !main.id) main.id = mainId;

  if (!document.querySelector('.skip-link')) {
    var skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#' + mainId;
    skip.textContent = 'رفتن به محتوای اصلی';
    document.body.insertBefore(skip, document.body.firstChild);
  }

  // Analytics-ready CTA markers (no third-party dependency)
  document.querySelectorAll('a[href*="contact.html"], a[href$="contact.html"]').forEach(function (link) {
    if (link.hasAttribute('data-cta')) return;
    var text = (link.textContent || '').trim();
    if (/شروع پروژه|ارسال درخواست|مشاوره|تماس/.test(text) || link.classList.contains('btn--primary') || link.classList.contains('top-bar__btn') || link.classList.contains('btn--header')) {
      link.setAttribute('data-cta', 'start-project');
    }
    if (!link.hasAttribute('data-cta-location')) {
      if (link.closest('.top-bar')) link.setAttribute('data-cta-location', 'topbar');
      else if (link.closest('.home-header, .site-header')) link.setAttribute('data-cta-location', 'nav');
      else if (link.closest('.home-hero, .about-hero, .sd-hero, .pd-hero, .proj-hero, .svc-hero, .ct-hero')) link.setAttribute('data-cta-location', 'hero');
      else if (link.closest('.home-final-cta, .about-finale, .pd-closing, .home-footer')) link.setAttribute('data-cta-location', 'footer-cta');
      else if (link.closest('[data-block="service-links"], .pd-service-links')) link.setAttribute('data-cta-location', 'project-service');
      else link.setAttribute('data-cta-location', 'page');
    }
  });

  document.querySelectorAll('a[href*="projects.html"]').forEach(function (link) {
    if (link.hasAttribute('data-cta')) return;
    if (/مشاهده پروژ|پروژه‌ها|کیس/.test((link.textContent || '').trim())) {
      link.setAttribute('data-cta', 'view-projects');
      if (!link.hasAttribute('data-cta-location')) link.setAttribute('data-cta-location', 'page');
    }
  });
})();
