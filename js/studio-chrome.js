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
})();
