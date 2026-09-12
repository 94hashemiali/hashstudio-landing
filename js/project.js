(function () {
  'use strict';

  function cleanSlug(value) {
    if (!value) return null;
    return String(value).replace(/^\/+|\/+$/g, '').trim() || null;
  }

  function readSlug() {
    var body = document.body;
    if (body && body.dataset.slug) return cleanSlug(body.dataset.slug);

    var path = (window.location.pathname || '').replace(/\\/g, '/');
    var match = path.match(/\/project\/([^/]+)\/?(?:index\.html)?$/i);
    if (match) return cleanSlug(decodeURIComponent(match[1]));

    try {
      var fromQuery = new URLSearchParams(window.location.search || '').get('slug');
      if (fromQuery) return cleanSlug(fromQuery);
    } catch (err) {}

    var hash = (window.location.hash || '').replace(/^#/, '');
    if (!hash) return null;
    if (hash.indexOf('slug=') === 0) return cleanSlug(decodeURIComponent(hash.slice(5)));
    if (hash.indexOf('=') !== -1) return null;
    return cleanSlug(decodeURIComponent(hash));
  }

  var slug = readSlug();
  var map = window.HASH_PROJECTS_BY_SLUG;
  var root = document.getElementById('project-root');

  if (!map) {
    if (root) {
      root.hidden = false;
      root.innerHTML = '<div class="container" style="padding:4rem 0;text-align:center"><p>داده پروژه‌ها بارگذاری نشد. فایل <code>js/projects-data.js</code> را چک کنید.</p><p><a class="btn btn--primary" href="/projects.html">بازگشت به پروژه‌ها</a></p></div>';
    }
    return;
  }

  var project = slug && map[slug];

  if (!project) {
    window.location.replace('/projects.html');
    return;
  }

  var next = map[project.nextSlug];

  function text(selector, value) {
    var el = root.querySelector(selector);
    if (el && value != null) el.textContent = value;
  }

  function html(containerSelector, markup) {
    var el = root.querySelector(containerSelector);
    if (el) el.innerHTML = markup;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.title = project.name + ' | استودیو هش';
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', project.lead);

  text('[data-field="name"]', project.name);
  text('[data-field="title"]', project.title);
  text('[data-field="lead"]', project.lead);
  text('[data-field="industry"]', project.industry);
  text('[data-field="services"]', project.services);
  text('[data-field="year"]', project.year);
  text('[data-field="duration"]', project.duration);
  text('[data-field="summary-badge"]', project.summary.badge);
  text('[data-field="summary-heading"]', project.summary.heading);
  text('[data-field="summary-body"]', project.summary.body);
  text('[data-field="challenge-heading"]', project.challenge.heading);
  text('[data-field="challenge-body"]', project.challenge.body);
  text('[data-field="research-heading"]', project.research.heading);
  text('[data-field="research-sub"]', project.research.sub);
  text('[data-field="ux-heading"]', project.ux.heading);
  text('[data-field="ds-heading"]', project.designSystem.heading);
  text('[data-field="ds-body"]', project.designSystem.body);
  text('[data-field="tech-heading"]', project.tech.heading);
  text('[data-field="tech-body"]', project.tech.body);
  text('[data-field="quote-text"]', project.quote.text);
  text('[data-field="quote-role"]', project.quote.role);
  text('[data-field="quote-org"]', project.quote.org);

  var live = root.querySelector('[data-field="live-link"]');
  if (live) {
    live.href = project.url;
    live.setAttribute('aria-label', 'مشاهده سایت ' + project.name);
  }

  var heroImg = root.querySelector('[data-field="hero-img"]');
  if (heroImg) {
    heroImg.src = project.images.hero;
    heroImg.alt = 'نمای اصلی ' + project.name;
  }

  var challengeImg = root.querySelector('[data-field="challenge-img"]');
  if (challengeImg) {
    challengeImg.src = project.images.challenge || project.images.pixel;
    challengeImg.alt = 'فضای محصول ' + project.name;
  }

  var researchImg = root.querySelector('[data-field="research-img"]');
  if (researchImg) {
    researchImg.src = project.images.research || project.images.skeleton;
    researchImg.alt = 'اسکچ رابط ' + project.name;
  }

  html('[data-list="earlyMetrics"]', project.earlyMetrics.map(function (item) {
    return '<li class="pd-early__item"><div class="pd-early__value">' + escapeHtml(item.value) +
      '</div><div class="pd-early__label">' + escapeHtml(item.label) + '</div></li>';
  }).join(''));

  html('[data-list="goals"]', project.challenge.goals.map(function (item) {
    return '<li>' + escapeHtml(item) + '</li>';
  }).join(''));

  html('[data-list="findings"]', project.research.findings.map(function (item) {
    return '<li>' + escapeHtml(item) + '</li>';
  }).join(''));

  html('[data-list="ux"]', project.ux.cards.map(function (card, index) {
    var src = card.image;
    if (!src) {
      var section = project.images.sections && project.images.sections[index + 1];
      src = (section && section.src) || (index === 0 ? project.images.pixel : project.images.hero);
    }
    return '<article class="pd-ux__card">' +
      '<img src="' + escapeHtml(src) + '" alt="" width="640" height="360" loading="lazy" onerror="this.onerror=null;this.src=\'' + escapeHtml(project.images.hero) + '\'">' +
      '<div class="pd-ux__body"><h3 class="pd-ux__title">' + escapeHtml(card.title) +
      '</h3><p class="pd-ux__text">' + escapeHtml(card.body) + '</p></div></article>';
  }).join(''));

  html('[data-list="colors"]', project.designSystem.colors.map(function (color) {
    return '<li><span class="pd-swatches__chip" style="background:' + escapeHtml(color.hex) +
      '"></span><span>' + escapeHtml(color.name) + '</span><span>' + escapeHtml(color.hex) + '</span></li>';
  }).join(''));

  html('[data-list="type"]', project.designSystem.type.map(function (item) {
    return '<li><span class="pd-type__name">' + escapeHtml(item.name) +
      '</span><span>' + escapeHtml(item.value) + '</span></li>';
  }).join(''));

  html('[data-list="spacing"]', project.designSystem.spacing.map(function (item) {
    return '<li><span class="pd-spacing__name">' + escapeHtml(item.name) +
      '</span><span>' + escapeHtml(item.value) + '</span></li>';
  }).join(''));

  var gallery = (project.images.sections && project.images.sections.length)
    ? project.images.sections
    : [
        { src: project.images.hero, alt: 'شات دسکتاپ ' + project.name },
        { src: project.images.pixel, alt: 'پیش‌نمایش پیکسلی ' + project.name },
        { src: project.images.skeleton, alt: 'اسکلت رابط ' + project.name },
        { src: project.images.hero, alt: 'نمای دیگر ' + project.name }
      ];
  html('[data-list="gallery"]', gallery.map(function (item) {
    return '<figure class="pd-gallery__item"><img src="' + escapeHtml(item.src) +
      '" alt="' + escapeHtml(item.alt) + '" width="1280" height="720" loading="lazy" onerror="this.onerror=null;this.src=\'' +
      escapeHtml(project.images.hero) + '\'"></figure>';
  }).join(''));

  html('[data-list="layers"]', project.tech.layers.map(function (item) {
    return '<li>' + escapeHtml(item) + '</li>';
  }).join(''));

  html('[data-list="stack"]', project.tech.stack.map(function (item) {
    return '<li>' + escapeHtml(item) + '</li>';
  }).join(''));

  html('[data-list="kpis"]', project.kpis.map(function (item) {
    return '<li><div class="pd-kpis__value">' + escapeHtml(item.value) +
      '</div><div class="pd-kpis__label">' + escapeHtml(item.label) + '</div></li>';
  }).join(''));

  if (next) {
    var nextLink = root.querySelector('[data-field="next-link"]');
    if (nextLink) nextLink.href = '/project/' + encodeURIComponent(next.slug) + '/';
    text('[data-field="next-industry"]', next.industry);
    text('[data-field="next-name"]', next.name);
    text('[data-field="next-lead"]', next.lead);
    var nextImg = root.querySelector('[data-field="next-img"]');
    if (nextImg) {
      nextImg.src = next.images.hero;
      nextImg.alt = next.name;
    }
  }

  root.hidden = false;
})();
