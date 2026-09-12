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
    var match = path.match(/\/service\/([^/]+)\/?(?:index\.html)?$/i);
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
  var map = window.HASH_SERVICES_BY_SLUG;
  var root = document.getElementById('service-root');
  var page = document.querySelector('.sd-page');

  if (!map) {
    if (root) {
      root.hidden = false;
      root.innerHTML = '<div class="container" style="padding:4rem 0;text-align:center"><p>داده خدمات بارگذاری نشد. فایل <code>js/services-data.js</code> را چک کنید.</p><p><a class="btn btn--primary" href="/services.html">بازگشت به خدمات</a></p></div>';
    }
    return;
  }

  var svc = slug && map[slug];

  if (!svc) {
    window.location.replace('/services.html');
    return;
  }

  function text(selector, value) {
    var el = root.querySelector(selector);
    if (el && value != null) el.textContent = value;
  }

  function html(selector, markup) {
    var el = root.querySelector(selector);
    if (el) el.innerHTML = markup;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.title = svc.name + ' | خدمات | استودیو هش';
  var pageDesc = svc.lead || '';
  var canonical = 'https://hashstudio.ir/service/' + encodeURIComponent(svc.slug) + '/';
  var ogImage = 'https://hashstudio.ir/' + String(svc.heroImage || 'assets/images/home/logo.png').replace(/^\//, '');

  function setMeta(attr, key, value) {
    if (!value) return;
    var el = document.querySelector('meta[' + attr + '="' + key + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  }

  function setLink(rel, href) {
    var el = document.querySelector('link[rel="' + rel + '"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', pageDesc);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:locale', 'fa_IR');
  setMeta('property', 'og:site_name', 'استودیو هش');
  setMeta('property', 'og:title', document.title);
  setMeta('property', 'og:description', pageDesc);
  setMeta('property', 'og:url', canonical);
  setMeta('property', 'og:image', ogImage);
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', document.title);
  setMeta('name', 'twitter:description', pageDesc);
  setLink('canonical', canonical);

  var existingLd = document.getElementById('service-jsonld');
  if (existingLd) existingLd.remove();
  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.id = 'service-jsonld';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: svc.name,
        description: pageDesc,
        url: canonical,
        provider: {
          '@type': 'Organization',
          name: 'استودیو هش',
          url: 'https://hashstudio.ir/'
        },
        areaServed: 'IR',
        inLanguage: 'fa-IR'
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'خانه', item: 'https://hashstudio.ir/' },
          { '@type': 'ListItem', position: 2, name: 'خدمات', item: 'https://hashstudio.ir/services.html' },
          { '@type': 'ListItem', position: 3, name: svc.name, item: canonical }
        ]
      }
    ]
  });
  document.head.appendChild(ld);

  page.dataset.theme = svc.theme || 'product';
  page.classList.toggle('is-hero-flip', !!svc.heroFlip);
  page.classList.toggle('is-stats-row', svc.statsLayout === 'row');
  page.classList.toggle('is-pains-stack', svc.painsLayout === 'stack');
  page.classList.toggle('is-steps-stack', svc.stepsLayout === 'stack');
  page.classList.toggle('is-split-flip', !!svc.splitFlip);
  page.classList.toggle('is-tools-4', (svc.tools || []).length === 4);
  page.classList.toggle('is-tools-6', (svc.tools || []).length >= 6);

  text('[data-field="name"]', svc.name);
  text('[data-field="title-lead"]', svc.titleLead);
  text('[data-field="title-accent"]', svc.titleAccent);
  text('[data-field="lead"]', svc.lead);
  text('[data-field="cta-primary"]', svc.ctaPrimary);
  text('[data-field="overview-title"]', svc.overviewTitle);
  text('[data-field="overview-body"]', svc.overviewBody);
  text('[data-field="pain-badge"]', svc.painBadge);
  text('[data-field="pain-title"]', svc.painTitle);
  text('[data-field="del-title"]', svc.deliverablesTitle);
  text('[data-field="del-sub"]', svc.deliverablesSub);
  text('[data-field="cap-title"]', svc.capabilitiesTitle);
  text('[data-field="cap-sub"]', svc.capabilitiesSub);
  text('[data-field="process-badge"]', svc.processBadge);
  text('[data-field="process-title"]', svc.processTitle);
  text('[data-field="tools-badge"]', svc.toolsBadge);
  text('[data-field="tools-title"]', svc.toolsTitle);
  text('[data-field="cases-badge"]', svc.casesBadge);
  text('[data-field="cases-title"]', svc.casesTitle);
  text('[data-field="faq-title"]', svc.faqTitle);
  text('[data-field="cta-title"]', svc.ctaTitle);
  text('[data-field="cta-body"]', svc.ctaBody);

  var heroImg = root.querySelector('[data-field="hero-img"]');
  var media = root.querySelector('[data-hero-media]');
  if (heroImg) {
    heroImg.src = svc.heroImage;
    heroImg.alt = svc.name;
  }
  if (media) {
    media.classList.toggle('sd-hero__media--contain', svc.heroKind === 'illustration');
    if (svc.heroKind === 'preview' && svc.heroPixel) {
      media.innerHTML =
        '<div class="site-preview">' +
        '<div class="site-preview__pixel" aria-hidden="true"><img src="' + escapeHtml(svc.heroPixel) + '" alt="" width="1280" height="720"></div>' +
        '<img class="site-preview__shot" src="' + escapeHtml(svc.heroImage) + '" alt="' + escapeHtml(svc.name) + '" width="1280" height="720">' +
        '</div>';
    }
  }

  html('[data-list="stats"]', svc.stats.map(function (item) {
    return '<li><div class="sd-stats__value">' + escapeHtml(item.value) +
      '</div><div class="sd-stats__label">' + escapeHtml(item.label) + '</div></li>';
  }).join(''));

  html('[data-list="pains"]', svc.pains.map(function (item, i) {
    var n = ['۰۱', '۰۲', '۰۳', '۰۴'][i] || String(i + 1);
    return '<li class="sd-pain"><span class="sd-pain__icon">' + n +
      '</span><h3 class="sd-pain__title">' + escapeHtml(item.title) +
      '</h3><p class="sd-pain__body">' + escapeHtml(item.body) + '</p></li>';
  }).join(''));

  html('[data-list="deliverables"]', svc.deliverables.map(function (item) {
    return '<li>' + escapeHtml(item) + '</li>';
  }).join(''));

  html('[data-list="capabilities"]', svc.capabilities.map(function (item) {
    return '<li><span class="sd-caps__badge">' + escapeHtml(item.badge) +
      '</span><span>' + escapeHtml(item.text) + '</span></li>';
  }).join(''));

  html('[data-list="steps"]', svc.steps.map(function (item) {
    return '<li class="sd-step"><div class="sd-step__num">' + escapeHtml(item.num) +
      '</div><h3 class="sd-step__title">' + escapeHtml(item.title) +
      '</h3><p class="sd-step__desc">' + escapeHtml(item.desc) + '</p></li>';
  }).join(''));

  html('[data-list="tools"]', svc.tools.map(function (item) {
    return '<li class="sd-tool"><div class="sd-tool__name">' + escapeHtml(item.name) +
      '</div><p class="sd-tool__hint">' + escapeHtml(item.hint) + '</p></li>';
  }).join(''));

  html('[data-list="cases"]', resolveCases(svc).map(function (item) {
    var base = 'assets/images/home/projects/' + item.slug;
    var tags = (item.tags || []).map(function (t) {
      return '<span class="sd-case__tag">' + escapeHtml(t) + '</span>';
    }).join('');
    return '<a class="sd-case" href="/project/' + encodeURIComponent(item.slug) + '/">' +
      '<div class="sd-case__media"><div class="site-preview">' +
      '<div class="site-preview__pixel" aria-hidden="true"><img src="' + base + '-pixel.webp" alt="' + escapeHtml(item.title) + '" width="1280" height="720" loading="lazy"></div>' +
      '<img class="site-preview__shot" src="' + base + '-shot.webp" alt="" width="1280" height="720" loading="lazy" aria-hidden="true">' +
      '</div></div><div class="sd-case__body">' +
      '<div class="sd-case__meta">' + escapeHtml(item.meta) + '</div>' +
      '<h3 class="sd-case__title">' + escapeHtml(item.title) + '</h3>' +
      '<div class="sd-case__tags">' + tags + '</div></div></a>';
  }).join(''));

  function resolveCases(service) {
    var bySlug = window.HASH_PROJECTS_BY_SLUG || {};
    var curated = (service.cases || []).map(function (item) {
      var live = bySlug[item.slug];
      if (!live) return item;
      return {
        slug: item.slug,
        meta: item.meta || [live.year, live.industry].filter(Boolean).join(' • '),
        title: item.title || live.name,
        tags: item.tags || (live.tags || []).slice(0, 3)
      };
    }).filter(function (item) { return item && item.slug; });
    if (curated.length) return curated.slice(0, 2);

    return (window.HASH_PROJECTS || [])
      .filter(function (project) {
        return (project.serviceSlugs || []).indexOf(service.slug) !== -1;
      })
      .slice(0, 2)
      .map(function (project) {
        return {
          slug: project.slug,
          meta: [project.year, project.industry].filter(Boolean).join(' • '),
          title: project.name + (project.lead ? ' — ' + project.lead.split('،')[0] : ''),
          tags: (project.tags || []).slice(0, 3)
        };
      });
  }

  var articlesBySlug = window.HASH_ARTICLES_BY_SLUG || {};
  var serviceArticles = (window.HASH_CONTENT_GRAPH && window.HASH_CONTENT_GRAPH.serviceRel(svc.slug).articles) || [];
  var articleCards = serviceArticles.map(function (articleSlug) {
    var a = articlesBySlug[articleSlug];
    if (!a) return '';
    return '<a class="sd-article" href="article.html?slug=' + encodeURIComponent(a.slug) +
      '" data-cta="view-article" data-cta-location="service" data-content-slug="' + escapeHtml(a.slug) +
      '" data-service-slug="' + escapeHtml(svc.slug) + '">' +
      '<span class="sd-article__tag">' + escapeHtml(a.tag || '') + '</span>' +
      '<h3 class="sd-article__title">' + escapeHtml(a.title) + '</h3>' +
      '<p class="sd-article__lead">' + escapeHtml((a.lead || '').slice(0, 120)) + '</p>' +
      '<span class="sd-article__cta">خواندن مقاله</span></a>';
  }).join('');
  var articlesBlock = root.querySelector('[data-block="service-articles"]');
  if (articlesBlock) {
    if (articleCards) {
      html('[data-list="service-articles"]', articleCards);
      articlesBlock.hidden = false;
    } else {
      articlesBlock.hidden = true;
    }
  }

  html('[data-list="faqs"]', svc.faqs.map(function (item, i) {
    return '<details class="faq-item"' + (i === 0 ? ' open' : '') + '>' +
      '<summary class="faq-item__question"><span class="faq-item__label">' + escapeHtml(item.q) +
      '</span><span class="faq-item__icon" aria-hidden="true"></span></summary>' +
      '<p class="faq-item__answer">' + escapeHtml(item.a) + '</p></details>';
  }).join(''));

  root.hidden = false;
})();
