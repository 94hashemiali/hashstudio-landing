(function () {
  'use strict';

  var PAGE_SIZE = 6;
  var VISUALS = ['#2E1C40', '#0E2938', '#4E3629', '#1F3B2B', '#323B44', '#17252B'];

  var META = {
    zarafe: {
      category: 'Fintech',
      filters: ['web', 'product'],
      tags: ['قیمت لحظه‌ای', 'توسعه وب', 'طراحی محصول']
    },
    khosravani: {
      category: 'Automotive',
      filters: ['web'],
      tags: ['نمایندگی خودرو', 'توسعه وب', 'UI/UX']
    },
    moniaz: {
      category: 'Education',
      filters: ['web', 'product'],
      tags: ['نشر آنلاین', 'تحلیل ویدئویی', 'کنکور']
    },
    shogir: {
      category: 'Travel',
      filters: ['web', 'mobile', 'product', 'mvp'],
      tags: ['گردشگری', 'قشم', 'PWA']
    },
    vanilly: {
      category: 'E-Commerce',
      filters: ['web'],
      tags: ['آرایشی', 'فروشگاه آنلاین', 'UI/UX']
    },
    pandoraland: {
      category: 'Social Commerce',
      filters: ['web', 'product'],
      tags: ['سوشال‌کامرس', 'فروشگاه', 'طراحی محصول']
    },
    madanicamp: {
      category: 'E-Commerce',
      filters: ['web'],
      tags: ['outdoor', 'فروشگاه', 'UI/UX']
    },
    zivanplus: {
      category: 'E-Commerce',
      filters: ['web'],
      tags: ['پت‌شاپ', 'فروشگاه', 'UI/UX']
    },
    golding: {
      category: 'Fintech',
      filters: ['web', 'product'],
      tags: ['پس‌انداز طلا', 'فین‌تک', 'وب']
    },
    zeissqom: {
      category: 'Healthcare',
      filters: ['web'],
      tags: ['اپتیک', 'وب تخصصی', 'UI']
    },
    tfec: {
      category: 'Fintech',
      filters: ['web', 'product'],
      tags: ['رمزارز', 'صرافی', 'فین‌تک']
    },
    azinpart: {
      category: 'E-Commerce',
      filters: ['web'],
      tags: ['قطعات خودرو', 'B2B', 'فروشگاه']
    },
    abryadak: {
      category: 'E-Commerce',
      filters: ['web'],
      tags: ['لوازم خودرو', 'فروشگاه', 'وب']
    },
    shefaei: {
      category: 'Enterprise',
      filters: ['web', 'product'],
      tags: ['پرتال سازمانی', 'عضویت', 'توسعه']
    },
    visionsam: {
      category: 'Agency',
      filters: ['web'],
      tags: ['آژانس', 'سایت معرفی', 'UI']
    },
    dgservice: {
      category: 'Mobile',
      filters: ['web', 'mobile', 'product', 'mvp'],
      tags: ['معاوضه موبایل', 'وب', 'محصول']
    },
    crafty: {
      category: 'AI SaaS',
      filters: ['web', 'ai', 'product'],
      tags: ['هوش مصنوعی', 'سه‌بعدی', 'استودیو وب']
    }
  };

  var projects = window.HASH_PROJECTS || [];
  var grid = document.getElementById('proj-grid');
  var pager = document.getElementById('proj-pagination');
  var filterBtns = document.querySelectorAll('[data-proj-filter]');
  var state = { filter: 'all', page: 1 };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function enriched() {
    return projects.map(function (project, index) {
      var meta = META[project.slug] || {
        category: 'Project',
        filters: ['web'],
        tags: (project.services || '').split(/\s*\+\s*/).filter(Boolean)
      };
      return {
        project: project,
        meta: meta,
        visual: VISUALS[index % VISUALS.length]
      };
    });
  }

  function filtered() {
    var list = enriched();
    if (state.filter === 'all') return list;
    return list.filter(function (item) {
      return item.meta.filters.indexOf(state.filter) !== -1;
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
        '<p class="proj-empty">پروژه‌ای با این فیلتر پیدا نشد.</p>';
      renderPager(0);
      return;
    }

    grid.innerHTML = pageItems
      .map(function (item) {
        var p = item.project;
        var m = item.meta;
        var tags = (m.tags || [])
          .slice(0, 3)
          .map(function (tag) {
            return '<span class="proj-card__tag">' + escapeHtml(tag) + '</span>';
          })
          .join('');
        return (
          '<a href="/project/' +
          encodeURIComponent(p.slug) +
          '/" class="proj-card">' +
          '<div class="proj-card__visual" style="background:' +
          item.visual +
          '">' +
          '<div class="site-preview">' +
          '<div class="site-preview__pixel" aria-hidden="true">' +
          '<img src="assets/images/home/projects/' +
          escapeHtml(p.slug) +
          '-pixel.webp" alt="' +
          escapeHtml(p.name) +
          '" width="1280" height="720" loading="lazy">' +
          '</div>' +
          '<img class="site-preview__shot" src="assets/images/home/projects/' +
          escapeHtml(p.slug) +
          '-shot.webp" alt="" width="1280" height="720" loading="lazy" aria-hidden="true">' +
          '</div>' +
          '</div>' +
          '<div class="proj-card__body">' +
          '<div class="proj-card__meta">' +
          '<span class="proj-card__category">' +
          escapeHtml(m.category) +
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
          '<span class="proj-card__cta">مشاهده کیس استادی</span>' +
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

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.filter = btn.getAttribute('data-proj-filter') || 'all';
      state.page = 1;
      filterBtns.forEach(function (item) {
        var on = item === btn;
        item.classList.toggle('is-active', on);
        item.setAttribute('aria-pressed', String(on));
      });
      renderCards();
    });
  });

  if (pager) {
    pager.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-page]');
      if (!btn || btn.disabled) return;
      var value = btn.getAttribute('data-page');
      var totalPages = Math.max(1, Math.ceil(filtered().length / PAGE_SIZE));
      if (value === 'prev') state.page = Math.max(1, state.page - 1);
      else if (value === 'next') state.page = Math.min(totalPages, state.page + 1);
      else state.page = Number(value) || 1;
      renderCards();
      var listing = document.getElementById('listing');
      if (listing) listing.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (!projects.length) {
    if (grid) {
      grid.innerHTML =
        '<p class="proj-empty">داده پروژه‌ها بارگذاری نشد.</p>';
    }
    return;
  }

  renderCards();
})();
