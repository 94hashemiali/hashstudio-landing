(function () {
  'use strict';

  var tabButtons = document.querySelectorAll('[data-tech-tab]');
  var cards = document.querySelectorAll('[data-tech-categories]');
  if (!tabButtons.length || !cards.length) return;

  function activate(key) {
    tabButtons.forEach(function (item) {
      var isActive = item.getAttribute('data-tech-tab') === key;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));
    });

    var visible = 0;
    cards.forEach(function (card) {
      var cats = (card.getAttribute('data-tech-categories') || '').split(/\s+/);
      var show = cats.indexOf(key) !== -1;
      card.hidden = !show;
      if (show) visible += 1;
    });

    var empty = document.getElementById('tech-empty');
    if (empty) empty.hidden = visible > 0;
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activate(btn.getAttribute('data-tech-tab'));
    });
  });

  var initial = document.querySelector('[data-tech-tab].is-active');
  activate(initial ? initial.getAttribute('data-tech-tab') : 'frontend');
})();
