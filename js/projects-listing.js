(function () {
  'use strict';

  var PAGE_SIZE = 6;
  var VISUALS = ['#2E1C40', '#0E2938', '#4E3629', '#1F3B2B', '#323B44', '#17252B'];
  var FILTER_LABELS = {
    all: 'همه',
    web: 'وب',
    mobile: 'موبایل',
    product: 'طراحی محصول',
    mvp: 'MVP',
    ai: 'هوش مصنوعی'
  };

  var projects = window.HASH_PROJECTS || [];
  var grid = document.getElementById('proj-grid');
  var pager = document.getElementById('proj-pagination');
  var filterHost = document.querySelector('.proj-filters');
  var state = { filter: 'all', page: 1 };

  function readUrlState() {
    try {
      var params = new URLSearchParams(window.location.search);
      var filter = params.get('filter') || 'all';
      if (!FILTER_LABELS[filter]) filter = 'all';
      if (filter !== 'all' && availableFilters().indexOf(filter) === -1) filter = 'all';
      state.filter = filter;
      var page = parseInt(params.get('page') || '1', 10);
      state.page = page > 0 ? page : 1;
    } catch (err) {
      state.filter = 'all';
      state.page = 1;
    }
  }

  function writeUrlState() {
    try {
      var params = new URLSearchParams();
      if (state.filter && state.filter !== 'all') params.set('filter', state.filter);
      if (state.page > 1) params.set('page', String(state.page));
      var qs = params.toString();
      var next = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', next);
      }
    } catch (err) {}
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function availableFilters() {
    var counts = {};
    projects.forEach(function (project) {
      (project.filters || []).forEach(function (key) {
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return Object.keys(FILTER_LABELS).filter(function (key) {
      return key === 'all' || counts[key] > 0;
    });
  }

  function renderFilters() {
    if (!filterHost) return;
    var keys = availableFilters();
    filterHost.innerHTML = keys
      .map(function (key) {
        var active = key === state.filter;
        return (
          '<button type="button" class="proj-filters__btn' +
          (active ? ' is-active' : '') +
          '" data-proj-filter="' +
          escapeHtml(key) +
          '" aria-pressed="' +
          String(active) +
          '">' +
          escapeHtml(FILTER_LABELS[key]) +
          '</button>'
        );
      })
      .join('');
  }

  function filtered() {
    if (state.filter === 'all') return projects.slice();
    return projects.filter(function (project) {
      return (project.filters || []).indexOf(state.filter) !== -1;
    });
  }

  function renderCards() {
    if (!grid) return;
    var list = filtered();
    var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * PAGE_SIZE;
    var pageItems = list.slice(start, start + PAGE_SIZE);

    if (!pageItems.length) {
      grid.innerHTML =
        '<div class="proj-empty">' +
        '<p>پروژه‌ای با این فیلتر پیدا نشد.</p>' +
        '<button type="button" class="btn btn--outline" data-proj-filter-reset>نمایش همه پروژه‌ها</button>' +
        '</div>';
      renderPager(0);
      return;
    }

    grid.innerHTML = pageItems
      .map(function (p, index) {
        var tags = (p.tags || [])
          .slice(0, 3)
          .map(function (tag) {
            return '<span class="proj-card__tag">' + escapeHtml(tag) + '</span>';
          })
          .join('');
        var visual = VISUALS[(p.order != null ? p.order : index) % VISUALS.length];
        var href = p.href || '/project/' + encodeURIComponent(p.slug) + '/';
        var pixel = (p.images && p.images.pixel) || '';
        var shot = (p.images && p.images.hero) || '';
        return (
          '<a href="' +
          escapeHtml(href) +
          '" class="proj-card">' +
          '<div class="proj-card__visual" style="background:' +
          visual +
          '">' +
          '<div class="site-preview">' +
          '<div class="site-preview__pixel" aria-hidden="true">' +
          '<img src="' +
          escapeHtml(pixel) +
          '" alt="' +
          escapeHtml(p.name) +
          '" width="1280" height="720" loading="lazy">' +
          '</div>' +
          '<img class="site-preview__shot" src="' +
          escapeHtml(shot) +
          '" alt="" width="1280" height="720" loading="lazy" aria-hidden="true">' +
          '</div>' +
          '</div>' +
          '<div class="proj-card__body">' +
          '<div class="proj-card__meta">' +
          '<span class="proj-card__category">' +
          escapeHtml(p.industry || '') +
          '</span>' +
          '<span class="proj-card__year">' +
          escapeHtml(p.year || '') +
          '</span>' +
          '</div>' +
          '<h3 class="proj-card__title">' +
          escapeHtml(p.name) +
          '</h3>' +
          '<p class="proj-card__role">' +
          escapeHtml(p.role || p.services || '') +
          '</p>' +
          '<p class="proj-card__desc">' +
          escapeHtml(p.lead || '') +
          '</p>' +
          '<span class="proj-card__cta">مطالعه پروژه</span>' +
          '<div class="proj-card__tags">' +
          tags +
          '</div>' +
          '</div>' +
          '</a>'
        );
      })
      .join('');

    renderPager(totalPages);
  }

  function renderPager(totalPages) {
    if (!pager) return;
    if (totalPages <= 1) {
      pager.hidden = true;
      pager.innerHTML = '';
      return;
    }
    pager.hidden = false;

    var html = '';
    html +=
      '<button type="button" class="proj-pagination__btn" data-page="prev" aria-label="صفحه قبل"' +
      (state.page <= 1 ? ' disabled' : '') +
      '>' +
      '<svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true"><path d="M1.5 1.5L6 6L1.5 10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>';

    for (var i = 1; i <= totalPages; i += 1) {
      html +=
        '<button type="button" class="proj-pagination__btn' +
        (i === state.page ? ' is-active' : '') +
        '" data-page="' +
        i +
        '" aria-label="صفحه ' +
        i +
        '"' +
        (i === state.page ? ' aria-current="page"' : '') +
        '>' +
        toFa(i) +
        '</button>';
    }

    html +=
      '<button type="button" class="proj-pagination__btn" data-page="next" aria-label="صفحه بعد"' +
      (state.page >= totalPages ? ' disabled' : '') +
      '>' +
      '<svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true"><path d="M6.5 1.5L2 6L6.5 10.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>';

    pager.innerHTML = html;
  }

  function toFa(num) {
    return String(num).replace(/\d/g, function (d) {
      return '۰۱۲۳۴۵۶۷۸۹'[Number(d)];
    });
  }

  if (filterHost) {
    filterHost.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-proj-filter]');
      if (!btn) return;
      state.filter = btn.getAttribute('data-proj-filter') || 'all';
      state.page = 1;
      filterHost.querySelectorAll('[data-proj-filter]').forEach(function (item) {
        var on = item === btn;
        item.classList.toggle('is-active', on);
        item.setAttribute('aria-pressed', String(on));
      });
      writeUrlState();
      renderCards();
    });
  }

  if (grid) {
    grid.addEventListener('click', function (event) {
      var reset = event.target.closest('[data-proj-filter-reset]');
      if (!reset) return;
      event.preventDefault();
      state.filter = 'all';
      state.page = 1;
      writeUrlState();
      renderFilters();
      renderCards();
    });
  }

  if (pager) {
    pager.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-page]');
      if (!btn || btn.disabled) return;
      var value = btn.getAttribute('data-page');
      var totalPages = Math.max(1, Math.ceil(filtered().length / PAGE_SIZE));
      if (value === 'prev') state.page = Math.max(1, state.page - 1);
      else if (value === 'next') state.page = Math.min(totalPages, state.page + 1);
      else state.page = Number(value) || 1;
      writeUrlState();
      renderCards();
      var listing = document.getElementById('listing');
      if (listing) {
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        listing.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  window.addEventListener('popstate', function () {
    readUrlState();
    renderFilters();
    renderCards();
  });

  if (!projects.length) {
    if (grid) {
      grid.innerHTML = '<p class="proj-empty">داده پروژه‌ها بارگذاری نشد.</p>';
    }
    return;
  }

  readUrlState();
  renderFilters();
  renderCards();
})();
