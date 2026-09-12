(function () {
  'use strict';

  var tabButtons = document.querySelectorAll('[data-tech-tab]');

  if (!tabButtons.length) {
    return;
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      tabButtons.forEach(function (item) {
        var isActive = item === btn;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });
    });
  });
})();
