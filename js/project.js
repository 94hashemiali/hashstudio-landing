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
  var list = window.HASH_PROJECTS || [];
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
  var prev = map[project.prevSlug];

  var SERVICE_CATALOG = {
    product: { name: 'طراحی محصول', href: '/service/product/' },
    'ui-ux': { name: 'طراحی UI/UX', href: '/service/ui-ux/' },
    web: { name: 'توسعه وب', href: '/service/web/' },
    mobile: { name: 'توسعه موبایل', href: '/service/mobile/' },
    mvp: { name: 'راه‌اندازی MVP', href: '/service/mvp/' },
    ai: { name: 'هوش مصنوعی', href: '/service/ai/' },
    seo: { name: 'سئو و رشد', href: '/service/seo/' },
    consulting: { name: 'مشاوره محصول', href: '/service/consulting/' }
  };

  function text(selector, value) {
    if (value == null) return;
    root.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
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
    if (!href) return;
    var el = document.querySelector('link[rel="' + rel + '"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  function hideIfEmpty(sectionSelector, condition) {
    var section = root.querySelector(sectionSelector);
    if (section && !condition) section.hidden = true;
  }

  function absoluteUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    var origin = 'https://hashstudio.ir';
    try {
      if (window.location && window.location.origin && window.location.origin.indexOf('http') === 0) {
        origin = window.location.origin;
      }
    } catch (err) {}
    return origin.replace(/\/$/, '') + '/' + String(path).replace(/^\//, '');
  }

  var pagePath = '/project/' + encodeURIComponent(project.slug) + '/';
  var canonical = 'https://hashstudio.ir' + pagePath;
  var pageTitle = project.name + ' | پروژه طراحی و توسعه | استودیو هش';
  var pageDesc = project.lead || (project.summary && project.summary.body) || '';
  var heroSrc = project.images && project.images.hero;
  var ogImage = absoluteUrl(heroSrc);

  document.title = pageTitle;
  setMeta('name', 'description', pageDesc);
  setMeta('property', 'og:type', 'article');
  setMeta('property', 'og:locale', 'fa_IR');
  setMeta('property', 'og:site_name', 'استودیو هش');
  setMeta('property', 'og:title', pageTitle);
  setMeta('property', 'og:description', pageDesc);
  setMeta('property', 'og:url', canonical);
  if (ogImage) setMeta('property', 'og:image', ogImage);
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', pageTitle);
  setMeta('name', 'twitter:description', pageDesc);
  if (ogImage) setMeta('name', 'twitter:image', ogImage);
  setLink('canonical', canonical);

  if (heroSrc) {
    var preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = heroSrc;
    document.head.appendChild(preload);
  }

  var existingLd = document.getElementById('project-jsonld');
  if (existingLd) existingLd.remove();
  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.id = 'project-jsonld';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    headline: project.title,
    description: pageDesc,
    url: canonical,
    image: ogImage || undefined,
    inLanguage: 'fa-IR',
    creator: {
      '@type': 'Organization',
      name: 'استودیو هش',
      url: 'https://hashstudio.ir/'
    },
    about: project.industry || undefined
  });
  document.head.appendChild(ld);

  text('[data-field="name"]', project.name);
  text('[data-field="brand"]', project.name);
  text('[data-field="title"]', project.title);
  text('[data-field="lead"]', project.lead);
  text('[data-field="industry"]', project.industry);
  text('[data-field="services"]', project.services);
  text('[data-field="year"]', project.year);
  text('[data-field="duration"]', project.duration);
  text('[data-field="client"]', project.client || project.name);
  text('[data-field="role"]', project.role || project.services);
  text('[data-field="platform"]', project.platform || '');
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

  if (project.outcome) {
    text('[data-field="outcome-badge"]', project.outcome.badge || 'نتیجه پروژه');
    text('[data-field="outcome-heading"]', project.outcome.heading || 'خروجی پروژه');
    text('[data-field="outcome-body"]', project.outcome.body || '');
  } else {
    text('[data-field="outcome-badge"]', 'نتایج پایانی');
    text('[data-field="outcome-heading"]', 'خروجی پروژه');
  }
  var outcomeBody = root.querySelector('[data-field="outcome-body"]');
  if (outcomeBody && !String(outcomeBody.textContent || '').trim()) {
    outcomeBody.hidden = true;
  }

  if (project.closing) {
    text('[data-field="closing-heading"]', project.closing.heading);
    text('[data-field="closing-body"]', project.closing.body);
  }

  var live = root.querySelector('[data-field="live-link"]');
  if (live) {
    if (project.url) {
      live.href = project.url;
      live.setAttribute('aria-label', 'مشاهده وب‌سایت ' + project.name);
      live.hidden = false;
    } else {
      live.hidden = true;
    }
  }

  var heroImg = root.querySelector('[data-field="hero-img"]');
  if (heroImg) {
    heroImg.src = heroSrc;
    heroImg.alt = 'نمای اصلی ' + project.name;
    heroImg.setAttribute('fetchpriority', 'high');
    heroImg.loading = 'eager';
    heroImg.decoding = 'async';
  }

  var challengeImg = root.querySelector('[data-field="challenge-img"]');
  if (challengeImg) {
    challengeImg.src = project.images.challenge || project.images.pixel;
    challengeImg.alt = 'فضای محصول ' + project.name;
    challengeImg.loading = 'lazy';
    challengeImg.decoding = 'async';
  }

  var researchImg = root.querySelector('[data-field="research-img"]');
  if (researchImg) {
    researchImg.src = project.images.research || project.images.skeleton;
    researchImg.alt = 'جزئیات تجربه ' + project.name;
    researchImg.loading = 'lazy';
    researchImg.decoding = 'async';
  }

  var featureImg = root.querySelector('[data-field="feature-img"]');
  if (featureImg) {
    var featureSrc = (project.images.sections && project.images.sections[1] && project.images.sections[1].src)
      || project.images.pixel
      || heroSrc;
    featureImg.src = featureSrc;
    featureImg.alt = (project.images.sections && project.images.sections[1] && project.images.sections[1].alt)
      || ('پیش‌نمایش محصول ' + project.name);
    featureImg.loading = 'lazy';
    featureImg.decoding = 'async';
  }

  html('[data-list="earlyMetrics"]', (project.earlyMetrics || []).map(function (item) {
    return '<li class="pd-early__item"><div class="pd-early__value">' + escapeHtml(item.value) +
      '</div><div class="pd-early__label">' + escapeHtml(item.label) + '</div></li>';
  }).join(''));

  html('[data-list="goals"]', (project.challenge.goals || []).map(function (item) {
    return '<li>' + escapeHtml(item) + '</li>';
  }).join(''));

  html('[data-list="findings"]', (project.research.findings || []).map(function (item) {
    return '<li>' + escapeHtml(item) + '</li>';
  }).join(''));

  html('[data-list="ux"]', (project.ux.cards || []).map(function (card, index) {
    var src = card.image;
    if (!src) {
      var section = project.images.sections && project.images.sections[index + 1];
      src = (section && section.src) || (index === 0 ? project.images.pixel : project.images.hero);
    }
    return '<article class="pd-ux__card pd-reveal">' +
      '<figure class="pd-ux__media"><img src="' + escapeHtml(src) + '" alt="' + escapeHtml(card.title || '') +
      '" width="960" height="540" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + escapeHtml(project.images.hero) + '\'"></figure>' +
      '<div class="pd-ux__body"><h3 class="pd-ux__title">' + escapeHtml(card.title) +
      '</h3><p class="pd-ux__text">' + escapeHtml(card.body) + '</p></div></article>';
  }).join(''));

  var colors = (project.designSystem && project.designSystem.colors) || [];
  var typeScale = (project.designSystem && project.designSystem.type) || [];
  var spacingScale = (project.designSystem && project.designSystem.spacing) || [];

  var dsParts = [];
  if (colors.length) {
    dsParts.push(
      '<div><h3 class="pd-ds__label">رنگ‌ها</h3><ul class="pd-swatches">' +
      colors.map(function (color) {
        return '<li><span class="pd-swatches__chip" style="background:' + escapeHtml(color.hex) +
          '"></span><span>' + escapeHtml(color.name) + '</span><span dir="ltr">' + escapeHtml(color.hex) + '</span></li>';
      }).join('') +
      '</ul></div>'
    );
  }
  if (typeScale.length) {
    dsParts.push(
      '<div><h3 class="pd-ds__label">تایپوگرافی</h3><ul class="pd-type">' +
      typeScale.map(function (item) {
        return '<li><span class="pd-type__name">' + escapeHtml(item.name) +
          '</span><span>' + escapeHtml(item.value) + '</span></li>';
      }).join('') +
      '</ul></div>'
    );
  }
  if (spacingScale.length) {
    dsParts.push(
      '<div><h3 class="pd-ds__label">فاصله‌گذاری</h3><ul class="pd-spacing">' +
      spacingScale.map(function (item) {
        return '<li><span class="pd-spacing__name">' + escapeHtml(item.name) +
          '</span><span>' + escapeHtml(item.value) + '</span></li>';
      }).join('') +
      '</ul></div>'
    );
  }
  html('.pd-ds', dsParts.join(''));
  hideIfEmpty('[data-block="ds"]', dsParts.length > 0);

  var gallery = (project.images.sections && project.images.sections.length)
    ? project.images.sections
    : [
        { src: project.images.hero, alt: 'شات دسکتاپ ' + project.name },
        { src: project.images.pixel, alt: 'پیش‌نمایش ' + project.name },
        { src: project.images.skeleton, alt: 'اسکلت رابط ' + project.name }
      ].filter(function (item) { return item.src; });

  html('[data-list="gallery"]', gallery.map(function (item, index) {
    var mod = 'pd-gallery__item--pair';
    if (index === 0 || index === 5 || index === 8) mod = 'pd-gallery__item--full';
    else if (index === 3 || index === 7) mod = 'pd-gallery__item--feature';
    return '<figure class="pd-gallery__item ' + mod + ' pd-reveal"><img src="' + escapeHtml(item.src) +
      '" alt="' + escapeHtml(item.alt) + '" width="1280" height="720" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' +
      escapeHtml(project.images.hero) + '\'"></figure>';
  }).join(''));

  html('[data-list="layers"]', (project.tech.layers || []).map(function (item) {
    return '<li>' + escapeHtml(item) + '</li>';
  }).join(''));

  html('[data-list="stack"]', (project.tech.stack || []).map(function (item) {
    return '<li><span dir="auto">' + escapeHtml(item) + '</span></li>';
  }).join(''));

  html('[data-list="kpis"]', (project.kpis || []).map(function (item) {
    return '<li class="pd-reveal"><div class="pd-kpis__value">' + escapeHtml(item.value) +
      '</div><div class="pd-kpis__label">' + escapeHtml(item.label) + '</div></li>';
  }).join(''));

  var metaItems = root.querySelectorAll('.pd-meta__item');
  metaItems.forEach(function (item) {
    var dd = item.querySelector('dd');
    if (dd && !String(dd.textContent || '').trim()) item.hidden = true;
  });

  hideIfEmpty('[data-block="early-metrics"]', (project.earlyMetrics || []).length > 0);
  hideIfEmpty('[data-block="quote"]', !!(project.quote && project.quote.text));
  hideIfEmpty('[data-block="closing"]', !!(project.closing && project.closing.body));

  if (next) {
    root.querySelectorAll('[data-field="next-link"]').forEach(function (nextLink) {
      nextLink.href = '/project/' + encodeURIComponent(next.slug) + '/';
    });
    text('[data-field="next-industry"]', next.industry);
    text('[data-field="next-name"]', next.name);
    text('[data-field="next-lead"]', next.lead);
    var nextImg = root.querySelector('[data-field="next-img"]');
    if (nextImg) {
      nextImg.src = next.images.hero;
      nextImg.alt = next.name;
      nextImg.loading = 'lazy';
      nextImg.decoding = 'async';
    }
  } else {
    hideIfEmpty('[data-block="next"]', false);
  }

  if (prev) {
    root.querySelectorAll('[data-field="prev-link"]').forEach(function (prevLink) {
      prevLink.href = '/project/' + encodeURIComponent(prev.slug) + '/';
      prevLink.hidden = false;
    });
    text('[data-field="prev-name"]', prev.name);
  } else {
    root.querySelectorAll('[data-field="prev-link"]').forEach(function (prevLink) {
      prevLink.hidden = true;
    });
  }

  var serviceSlugs = project.serviceSlugs || [];
  html('[data-list="service-links"]', serviceSlugs.map(function (slug) {
    var svc = SERVICE_CATALOG[slug];
    if (!svc) return '';
    return '<a class="pd-service-link" href="' + escapeHtml(svc.href) + '">' +
      escapeHtml(svc.name) + '</a>';
  }).join(''));
  hideIfEmpty('[data-block="service-links"]', serviceSlugs.length > 0);

  var related = list.filter(function (item) {
    return item.slug !== project.slug;
  });
  related.sort(function (a, b) {
    var aScore = a.industry === project.industry ? 1 : 0;
    var bScore = b.industry === project.industry ? 1 : 0;
    return bScore - aScore;
  });
  related = related.slice(0, 3);

  html('[data-list="related"]', related.map(function (item) {
    var href = '/project/' + encodeURIComponent(item.slug) + '/';
    var img = (item.images && item.images.hero) || '';
    return '<a class="pd-related__card pd-reveal" href="' + href + '">' +
      '<figure class="pd-related__media"><img src="' + escapeHtml(img) + '" alt="' + escapeHtml(item.name) +
      '" width="640" height="400" loading="lazy" decoding="async"></figure>' +
      '<div class="pd-related__body">' +
      '<span class="pd-related__industry">' + escapeHtml(item.industry || '') + '</span>' +
      '<h3 class="pd-related__title">' + escapeHtml(item.name) + '</h3>' +
      '<p class="pd-related__lead">' + escapeHtml(item.lead || '') + '</p>' +
      '</div></a>';
  }).join(''));

  hideIfEmpty('[data-block="related"]', related.length > 0);

  root.hidden = false;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var reveals = root.querySelectorAll('.pd-reveal, .pd-hero__intro, .pd-hero__media, .pd-meta, .pd-section, .pd-related');
    reveals.forEach(function (el) {
      el.classList.add('pd-reveal-ready');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (inView) {
        el.classList.add('is-visible');
      } else {
        io.observe(el);
      }
    });
  } else {
    root.classList.add('pd-motion-off');
  }
})();
