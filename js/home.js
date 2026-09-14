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
        '" class="portfolio-featured" data-cta="view-project" data-cta-location="home-featured" data-project-slug="' +
        escapeHtml(featured.slug) +
        '">' +
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
            '" class="project-card" data-cta="view-project" data-cta-location="home-portfolio" data-project-slug="' +
            escapeHtml(p.slug) +
            '">' +
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
  renderBlogPreview();

  function renderBlogPreview() {
    var host = document.getElementById('home-blog-preview');
    if (!host) return;
    var bySlug = window.HASH_ARTICLES_BY_SLUG || {};
    var preferred = ['product-validation', 'modern-ui-2026', 'nextjs-scale-seo', 'mvp-scope', 'enterprise-ai'];
    var picks = preferred.map(function (slug) { return bySlug[slug]; }).filter(Boolean).slice(0, 3);
    if (picks.length < 3) {
      Object.keys(bySlug).forEach(function (slug) {
        if (picks.length >= 3) return;
        if (preferred.indexOf(slug) !== -1) return;
        picks.push(bySlug[slug]);
      });
    }
    if (!picks.length) return;

    var featured = picks[0];
    var rest = picks.slice(1);
    var featuredHtml =
      '<a class="blog-card blog-card--featured" href="/article/' + encodeURIComponent(featured.slug) +
      '/" data-cta="view-article" data-cta-location="home-blog" data-content-slug="' + escapeHtml(featured.slug) + '">' +
      '<div class="blog-card__media"><img src="' + escapeHtml(featured.hero) + '" alt="" width="694" height="271" loading="lazy"></div>' +
      '<div class="blog-card__body">' +
      '<span class="blog-card__badge">' + escapeHtml(featured.tag) + '</span>' +
      '<h3 class="blog-card__title">' + escapeHtml(featured.title) + '</h3>' +
      '<p class="blog-card__desc">' + escapeHtml((featured.lead || '').slice(0, 140)) + '</p>' +
      '<div class="blog-card__meta"><span>' + escapeHtml(featured.date || '') + '</span><span>· ' +
      escapeHtml(featured.read || '') + '</span></div></div></a>';

    var stack = rest.map(function (a) {
      return '<a class="blog-card blog-card--compact" href="/article/' + encodeURIComponent(a.slug) +
        '/" data-cta="view-article" data-cta-location="home-blog" data-content-slug="' + escapeHtml(a.slug) + '">' +
        '<div class="blog-card__body">' +
        '<span class="blog-card__badge">' + escapeHtml(a.tag) + '</span>' +
        '<h3 class="blog-card__title">' + escapeHtml(a.title) + '</h3>' +
        '<p class="blog-card__desc">' + escapeHtml((a.lead || '').slice(0, 100)) + '</p>' +
        '<div class="blog-card__meta"><span>' + escapeHtml(a.date || '') + '</span><span>· ' +
        escapeHtml(a.read || '') + '</span></div></div>' +
        '<div class="blog-card__media"><img src="' + escapeHtml(a.hero) + '" alt="" width="200" height="224" loading="lazy"></div></a>';
    }).join('');

    host.innerHTML =
      '<div class="blog-preview-grid">' + featuredHtml +
      (stack ? '<div class="blog-preview-stack">' + stack + '</div>' : '') +
      '</div>';
  }

  /* ---- Project fit (one question → one recommendation) ---- */
  var FIT_MAP = {
    idea: {
      service: 'product',
      serviceName: 'طراحی محصول',
      reason: 'اگر هنوز مسئله، بازار یا محدوده MVP کاملاً مشخص نیست، از طراحی محصول شروع کنید — نه از فهرست فیچر.',
      project: 'zarafe',
      secondary: 'mvp'
    },
    existing: {
      service: 'ui-ux',
      serviceName: 'طراحی UI/UX',
      reason: 'وقتی محصول هست ولی تجربه گیر دارد یا تبدیل پایین است، اول جریان و رابط را درست می‌کنیم.',
      project: 'moniaz',
      secondary: 'product'
    },
    website: {
      service: 'web',
      serviceName: 'توسعه وب',
      reason: 'برای سایت جدید، بازطراحی یا فروشگاه، مسیر طراحی و مهندسی وب نقطه شروع روشن است.',
      project: 'khosravani',
      secondary: 'ui-ux'
    },
    technical: {
      service: 'web',
      serviceName: 'توسعه وب',
      reason: 'اگر طرح یا دامنه مشخص است و نیاز اصلی پیاده‌سازی است، توسعه وب / PWA نزدیک‌ترین مسیر مهندسی است.',
      project: 'shogir',
      secondary: 'mobile'
    },
    unknown: {
      service: 'consulting',
      serviceName: 'مشاوره محصول',
      reason: 'وقتی مشکل هست ولی خدمت دقیق روشن نیست، اول مسئله را با هم شفاف می‌کنیم — بعد مسیر ساخت.',
      project: 'shefaei',
      secondary: 'product'
    }
  };

  function findProject(slug) {
    var list = window.HASH_PROJECTS || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].slug === slug) return list[i];
    }
    return null;
  }

  function proofLine(project) {
    if (!project) return '';
    var metrics = project.earlyMetrics || [];
    if (metrics.length) {
      return metrics
        .slice(0, 2)
        .map(function (m) {
          return (m.value || '') + ' — ' + (m.label || '');
        })
        .join(' · ');
    }
    return (project.industry || '') + (project.services ? ' · ' + project.services : '');
  }

  function renderFitResult(intent) {
    var map = FIT_MAP[intent];
    var host = document.getElementById('service-fit-result');
    if (!map || !host) return;

    var project = findProject(map.project);
    var name = (project && project.name) || map.project;
    var industry = (project && project.industry) || '';
    var services = (project && project.services) || '';
    var proof = proofLine(project);
    var href = '/project/' + encodeURIComponent(map.project) + '/';
    var serviceHref = '/service/' + encodeURIComponent(map.service) + '/';
    var contactHref =
      'contact.html?service=' +
      encodeURIComponent(map.service) +
      '&intent=' +
      encodeURIComponent(intent);

    host.hidden = false;
    host.innerHTML =
      '<article class="home-fit__card-result">' +
      '<p class="home-fit__eyebrow">پیشنهاد برای شما</p>' +
      '<h3 class="home-fit__rec-title">' +
      escapeHtml(map.serviceName) +
      '</h3>' +
      '<p class="home-fit__rec-reason">' +
      escapeHtml(map.reason) +
      '</p>' +
      '<div class="home-fit__proof">' +
      '<p class="home-fit__proof-label">چرا این پیشنهاد؟ یک نمونه واقعی</p>' +
      '<a class="home-fit__proof-link" href="' +
      escapeHtml(href) +
      '" data-cta="service-fit-recommendation" data-cta-location="home-fit" data-fit-intent="' +
      escapeHtml(intent) +
      '" data-service-slug="' +
      escapeHtml(map.service) +
      '" data-recommended-service="' +
      escapeHtml(map.service) +
      '" data-project-slug="' +
      escapeHtml(map.project) +
      '">' +
      '<span class="home-fit__proof-name">' +
      escapeHtml(name) +
      '</span>' +
      '<span class="home-fit__proof-meta">' +
      escapeHtml(industry + (services ? ' · ' + services : '')) +
      '</span>' +
      (proof
        ? '<span class="home-fit__proof-stat">' + escapeHtml(proof) + '</span>'
        : '') +
      '<span class="home-fit__proof-cta">مطالعه تجربه ›</span></a></div>' +
      '<div class="home-fit__actions">' +
      '<a class="btn btn--primary" href="' +
      escapeHtml(serviceHref) +
      '" data-cta="service-fit-service" data-cta-location="home-fit" data-fit-intent="' +
      escapeHtml(intent) +
      '" data-service-slug="' +
      escapeHtml(map.service) +
      '" data-recommended-service="' +
      escapeHtml(map.service) +
      '" data-project-slug="' +
      escapeHtml(map.project) +
      '">دیدن این خدمت</a>' +
      '<a class="btn btn--outline" href="' +
      escapeHtml(contactHref) +
      '" data-cta="service-fit-contact" data-cta-location="home-fit" data-fit-intent="' +
      escapeHtml(intent) +
      '" data-service-slug="' +
      escapeHtml(map.service) +
      '" data-recommended-service="' +
      escapeHtml(map.service) +
      '" data-project-slug="' +
      escapeHtml(map.project) +
      '">صحبت درباره پروژه</a></div></article>';

    var analytics = window.HashAnalytics;
    if (analytics && typeof analytics.track === 'function') {
      analytics.track('service_fit_recommendation_viewed', {
        intent: intent,
        recommended_service: map.service,
        project_slug: map.project
      });
      if (typeof analytics.rememberLeadContext === 'function') {
        analytics.rememberLeadContext({
          intent: intent,
          service_slug: map.service,
          recommended_service: map.service
        });
      }
    }
  }

  function initServiceFit() {
    var root = document.querySelector('[data-service-fit]');
    if (!root) return;
    var buttons = root.querySelectorAll('.home-fit__option[data-fit-intent]');
    if (!buttons.length) return;

    var started = false;
    function markStarted() {
      if (started) return;
      started = true;
      var analytics = window.HashAnalytics;
      if (analytics && typeof analytics.track === 'function') {
        analytics.track('service_fit_started', { location: 'home-fit' });
      }
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              markStarted();
              io.disconnect();
            }
          });
        },
        { threshold: 0.35 }
      );
      io.observe(root);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        markStarted();
        var intent = btn.getAttribute('data-fit-intent');
        if (!intent || !FIT_MAP[intent]) return;
        buttons.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          b.classList.toggle('is-selected', b === btn);
        });
        renderFitResult(intent);
        var result = document.getElementById('service-fit-result');
        if (result) {
          var reduce = false;
          try {
            reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          } catch (err) {}
          try {
            result.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
          } catch (err2) {}
        }
      });
    });
  }

  initServiceFit();
})();
