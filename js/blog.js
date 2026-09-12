(function () {
  'use strict';

  var PAGE_SIZE = 6;
  var FILTER_LABELS = {
    all: 'همه',
    product: 'طراحی محصول',
    uiux: 'UI/UX',
    dev: 'توسعه',
    startup: 'استارتاپ',
    ai: 'هوش مصنوعی',
    marketing: 'مارکتینگ'
  };

  var bySlug = window.HASH_ARTICLES_BY_SLUG || {};
  var POSTS = Object.keys(bySlug).map(function (slug) {
    var a = bySlug[slug];
    return {
      slug: a.slug,
      filter: a.tagFilter || 'all',
      tag: a.tag || '',
      title: a.title || '',
      excerpt: a.lead || '',
      date: a.date || '',
      read: a.read || '',
      image: a.hero || ''
    };
  });

  var grid = document.getElementById('blog-grid');
  var pagination = document.getElementById('blog-pagination');
  var searchForm = document.getElementById('blog-search-form');
  var searchInput = document.getElementById('blog-search-input');
  var filterHost = document.querySelector('.blog-filters') || document.querySelector('[data-blog-filters]');
  var state = { filter: 'all', query: '', page: 1 };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function normalizeFa(value) {
    return String(value || '')
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[\u064B-\u065F]/g, '')
      .replace(/[۰-۹]/g, function (d) {
        return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
      })
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function readUrlState() {
    try {
      var params = new URLSearchParams(window.location.search);
      var filter = params.get('filter') || 'all';
      if (!FILTER_LABELS[filter]) filter = 'all';
      state.filter = filter;
      state.query = params.get('q') || '';
      var page = parseInt(params.get('page') || '1', 10);
      state.page = page > 0 ? page : 1;
    } catch (err) {
      state.filter = 'all';
      state.query = '';
      state.page = 1;
    }
  }

  function writeUrlState() {
    try {
      var params = new URLSearchParams();
      if (state.filter && state.filter !== 'all') params.set('filter', state.filter);
      if (state.query) params.set('q', state.query);
      if (state.page > 1) params.set('page', String(state.page));
      var qs = params.toString();
      var next = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', next);
      }
    } catch (err) {}
  }

  function filteredPosts() {
    var q = normalizeFa(state.query);
    return POSTS.filter(function (post) {
      if (state.filter !== 'all' && post.filter !== state.filter) return false;
      if (!q) return true;
      var hay = normalizeFa(post.title + ' ' + post.excerpt + ' ' + post.tag);
      return hay.indexOf(q) !== -1;
    });
  }

  function syncFilterButtons() {
    document.querySelectorAll('[data-blog-filter]').forEach(function (btn) {
      var key = btn.getAttribute('data-blog-filter') || 'all';
      var on = key === state.filter;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  function renderCards(posts) {
    if (!grid) return;
    if (!posts.length) {
      grid.innerHTML =
        '<div class="blog-empty">' +
        '<p>مقاله‌ای با این عبارت یا فیلتر پیدا نشد.</p>' +
        '<div class="blog-empty__actions">' +
        '<button type="button" class="btn btn--outline" data-blog-reset>پاک کردن جستجو</button>' +
        '<a class="btn btn--primary" href="projects.html">مشاهده پروژه‌ها</a>' +
        '</div></div>';
      return;
    }
    grid.innerHTML = posts
      .map(function (post) {
        return (
          '<a class="blog-card" href="article.html?slug=' +
          encodeURIComponent(post.slug) +
          '" data-cta="view-article" data-cta-location="blog" data-content-slug="' +
          escapeHtml(post.slug) +
          '">' +
          '<div class="blog-card__media"><img src="' +
          escapeHtml(post.image) +
          '" alt="" width="392" height="220" loading="lazy"></div>' +
          '<div class="blog-card__body">' +
          '<span class="blog-card__tag">' +
          escapeHtml(post.tag) +
          '</span>' +
          '<h3 class="blog-card__title">' +
          escapeHtml(post.title) +
          '</h3>' +
          '<p class="blog-card__excerpt">' +
          escapeHtml(post.excerpt) +
          '</p>' +
          '<div class="blog-card__footer">' +
          '<time>' +
          escapeHtml(post.date) +
          '</time><span>زمان مطالعه: ' +
          escapeHtml(post.read) +
          '</span></div></div></a>'
        );
      })
      .join('');
  }

  function toFa(num) {
    return String(num).replace(/\d/g, function (d) {
      return '۰۱۲۳۴۵۶۷۸۹'[Number(d)];
    });
  }

  function renderPager(totalPages) {
    if (!pagination) return;
    if (totalPages <= 1) {
      pagination.hidden = true;
      pagination.innerHTML = '';
      return;
    }
    pagination.hidden = false;
    var html = '';
    html +=
      '<button type="button" class="blog-pagination__btn" data-blog-page="prev" aria-label="صفحه قبل"' +
      (state.page <= 1 ? ' disabled' : '') +
      '>قبلی</button>';
    for (var i = 1; i <= totalPages; i += 1) {
      html +=
        '<button type="button" class="blog-pagination__btn' +
        (i === state.page ? ' is-active' : '') +
        '" data-blog-page="' +
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
      '<button type="button" class="blog-pagination__btn" data-blog-page="next" aria-label="صفحه بعد"' +
      (state.page >= totalPages ? ' disabled' : '') +
      '>بعدی</button>';
    pagination.innerHTML = html;
  }

  function render() {
    var list = filteredPosts();
    var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * PAGE_SIZE;
    renderCards(list.slice(start, start + PAGE_SIZE));
    renderPager(totalPages);
    syncFilterButtons();
    if (searchInput && searchInput.value !== state.query) searchInput.value = state.query;
  }

  document.querySelectorAll('[data-blog-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.filter = btn.getAttribute('data-blog-filter') || 'all';
      state.page = 1;
      writeUrlState();
      render();
    });
  });

  if (grid) {
    grid.addEventListener('click', function (event) {
      var reset = event.target.closest('[data-blog-reset]');
      if (!reset) return;
      event.preventDefault();
      state.query = '';
      state.filter = 'all';
      state.page = 1;
      writeUrlState();
      render();
    });
  }

  if (pagination) {
    pagination.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-blog-page]');
      if (!btn || btn.disabled) return;
      var value = btn.getAttribute('data-blog-page');
      var totalPages = Math.max(1, Math.ceil(filteredPosts().length / PAGE_SIZE));
      if (value === 'prev') state.page = Math.max(1, state.page - 1);
      else if (value === 'next') state.page = Math.min(totalPages, state.page + 1);
      else state.page = parseInt(value, 10) || 1;
      writeUrlState();
      render();
      var listing = document.getElementById('listing') || document.getElementById('blog-grid');
      if (listing) {
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        listing.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      state.query = searchInput.value || '';
      state.page = 1;
      writeUrlState();
      render();
    });
    searchInput.addEventListener('input', function () {
      state.query = searchInput.value || '';
      state.page = 1;
      writeUrlState();
      render();
    });
  }

  window.addEventListener('popstate', function () {
    readUrlState();
    render();
  });

  if (!POSTS.length) {
    if (grid) grid.innerHTML = '<p class="blog-empty">داده مقالات بارگذاری نشد.</p>';
    return;
  }

  readUrlState();
  render();
})();
