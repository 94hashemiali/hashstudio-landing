(function () {
  'use strict';

  var TONE_CLASS = {
    navy: 'project-card__visual--navy',
    blue: 'project-card__visual--blue',
    teal: 'project-card__visual--teal',
    brown: 'project-card__visual--brown',
    gold: 'project-card__visual--navy'
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderPortfolio() {
    var featuredHost = document.getElementById('home-portfolio-featured');
    var gridHost = document.getElementById('home-portfolio-grid');
    if (!featuredHost && !gridHost) return;

    var projects = window.HASH_PROJECTS || [];
    if (!projects.length) return;

    var featured =
      projects.filter(function (p) {
        return p.featured;
      })[0] ||
      projects
        .filter(function (p) {
          return typeof p.homeOrder === 'number';
        })
        .sort(function (a, b) {
          return a.homeOrder - b.homeOrder;
        })[0];

    var supporting = projects
      .filter(function (p) {
        return typeof p.homeOrder === 'number' && (!featured || p.slug !== featured.slug);
      })
      .sort(function (a, b) {
        return a.homeOrder - b.homeOrder;
      })
      .slice(0, 4);

    if (featuredHost && featured) {
      var metrics = (featured.earlyMetrics || []).slice(0, 3);
      var stats = metrics
        .map(function (item) {
          return (
            '<div class="portfolio-featured__stat">' +
            '<div class="portfolio-featured__stat-value">' +
            escapeHtml(item.value) +
            '</div>' +
            '<div class="portfolio-featured__stat-label">' +
            escapeHtml(item.label) +
            '</div>' +
            '</div>'
          );
        })
        .join('');
      var href = featured.href || '/project/' + encodeURIComponent(featured.slug) + '/';
      var pixel = (featured.images && featured.images.pixel) || '';
      var shot = (featured.images && featured.images.hero) || '';
      featuredHost.innerHTML =
        '<a href="' +
        escapeHtml(href) +
        '" class="portfolio-featured">' +
        '<div class="portfolio-featured__visual">' +
        '<div class="site-preview">' +
        '<div class="site-preview__pixel" aria-hidden="true">' +
        '<img src="' +
        escapeHtml(pixel) +
        '" alt="پیش‌نمایش ' +
        escapeHtml(featured.name) +
        '" width="1280" height="720" loading="lazy"></div>' +
        '<img class="site-preview__shot" src="' +
        escapeHtml(shot) +
        '" alt="" width="1280" height="720" loading="lazy" aria-hidden="true">' +
        '</div></div>' +
        '<div class="portfolio-featured__content">' +
        '<span class="portfolio-featured__label">' +
        escapeHtml((featured.industry || '') + (featured.services ? ' · ' + featured.services : '')) +
        '</span>' +
        '<h3 class="portfolio-featured__title">' +
        escapeHtml(featured.name) +
        '</h3>' +
        '<p class="portfolio-featured__desc">' +
        escapeHtml(featured.lead || featured.title || '') +
        '</p>' +
        (stats ? '<div class="portfolio-featured__stats">' + stats + '</div>' : '') +
        '<span class="portfolio-featured__link">مطالعه پروژه ›</span>' +
        '</div></a>';
    }

    if (gridHost) {
      gridHost.innerHTML = supporting
        .map(function (p) {
          var tone = TONE_CLASS[p.cardTone] || 'project-card__visual--navy';
          var href = p.href || '/project/' + encodeURIComponent(p.slug) + '/';
          var pixel = (p.images && p.images.pixel) || '';
          var shot = (p.images && p.images.hero) || '';
          var tags = (p.tags || [])
            .slice(0, 3)
            .map(function (tag) {
              return '<span class="project-card__tag">' + escapeHtml(tag) + '</span>';
            })
            .join('');
          return (
            '<a href="' +
            escapeHtml(href) +
            '" class="project-card">' +
            '<div class="project-card__visual ' +
            tone +
            '">' +
            '<div class="site-preview">' +
            '<div class="site-preview__pixel" aria-hidden="true">' +
            '<img src="' +
            escapeHtml(pixel) +
            '" alt="' +
            escapeHtml(p.name) +
            '" width="1280" height="720" loading="lazy"></div>' +
            '<img class="site-preview__shot" src="' +
            escapeHtml(shot) +
            '" alt="" width="1280" height="720" loading="lazy" aria-hidden="true">' +
            '</div></div>' +
            '<div class="project-card__body">' +
            '<div class="project-card__meta">' +
            '<span class="project-card__category">' +
            escapeHtml(p.industry || '') +
            '</span></div>' +
            '<h3 class="project-card__title">' +
            escapeHtml(p.name) +
            '</h3>' +
            '<p class="project-card__role">' +
            escapeHtml(p.role || p.services || '') +
            '</p>' +
            '<p class="project-card__lead">' +
            escapeHtml(p.lead || '') +
            '</p>' +
            '<div class="project-card__tags">' +
            tags +
            '</div>' +
            '<span class="project-card__link">مطالعه پروژه ›</span>' +
            '</div></a>'
          );
        })
        .join('');
    }
  }

  function initTechTabs() {
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
  }

  renderPortfolio();
  initTechTabs();
})();
