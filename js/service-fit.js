/**
 * Homepage Service Fit — one question → one primary recommendation.
 * Progressive enhancement; no deps. Uses HASH_PROJECTS + HASH_CONTENT_GRAPH labels.
 */
(function (global) {
  'use strict';

  var SERVICE_LABELS = (global.HASH_CONTENT_GRAPH && global.HASH_CONTENT_GRAPH.serviceLabels) || {
    product: 'طراحی محصول',
    'ui-ux': 'طراحی UI/UX',
    web: 'توسعه وب',
    mobile: 'توسعه موبایل',
    mvp: 'راه‌اندازی MVP',
    ai: 'هوش مصنوعی',
    seo: 'سئو و رشد',
    consulting: 'مشاوره محصول'
  };

  // Deterministic intent → primary service + optional support + proof project
  var FIT_MAP = {
    'new-product': {
      service: 'product',
      secondary: 'mvp',
      project: 'zarafe',
      reason:
        'اگر هنوز دامنه محصول، تجربه کاربر یا مسیر ساخت کاملاً روشن نیست، از طراحی محصول شروع کنید — نه از فهرست فیچر.'
    },
    'existing-product': {
      service: 'ui-ux',
      secondary: 'product',
      project: 'moniaz',
      reason:
        'وقتی محصول هست ولی تجربه گیر دارد یا تبدیل پایین است، اول جریان و رابط را درست می‌کنیم؛ در صورت نیاز مسیر محصول را هم بازمی‌کنیم.'
    },
    website: {
      service: 'web',
      secondary: 'seo',
      project: 'khosravani',
      reason:
        'برای سایت جدید، فروشگاه یا بازطراحی حضور آنلاین، توسعه وب نقطه شروع روشن است؛ رشد ارگانیک را در صورت نیاز با سئو همراه می‌کنیم.'
    },
    technical: {
      service: 'web',
      secondary: 'mobile',
      project: 'shogir',
      reason:
        'اگر طرح یا دامنه مشخص است و نیاز اصلی پیاده‌سازی است، توسعه وب / PWA نزدیک‌ترین مسیر مهندسی است؛ اپ موبایل در صورت نیاز در کنار آن.'
    },
    unknown: {
      service: 'consulting',
      secondary: 'product',
      project: 'shefaei',
      reason:
        'وقتی مشکل هست ولی خدمت دقیق روشن نیست، اول مسئله را با مشاوره محصول شفاف می‌کنیم — بعد مسیر ساخت.'
    }
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function findProject(slug) {
    var list = global.HASH_PROJECTS || [];
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

  function track(eventName, props) {
    var analytics = global.HashAnalytics;
    if (!analytics || typeof analytics.track !== 'function') return;
    analytics.track(eventName, props || {});
  }

  function rememberFit(intent, map) {
    var analytics = global.HashAnalytics;
    if (!analytics || typeof analytics.rememberLeadContext !== 'function') return;
    analytics.rememberLeadContext({
      intent: intent,
      service_slug: map.service,
      recommended_service: map.service
    });
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
    var primaryLabel = SERVICE_LABELS[map.service] || map.service;
    var secondaryLabel = map.secondary ? SERVICE_LABELS[map.secondary] || map.secondary : '';
    var href = '/project/' + encodeURIComponent(map.project) + '/';
    var serviceHref = '/service/' + encodeURIComponent(map.service) + '/';
    var secondaryHref = map.secondary ? '/service/' + encodeURIComponent(map.secondary) + '/' : '';
    var contactHref =
      'contact.html?service=' +
      encodeURIComponent(map.service) +
      '&intent=' +
      encodeURIComponent(intent);

    var secondaryHtml = secondaryLabel
      ? '<p class="home-fit__secondary">خدمت پشتیبان: <a href="' +
        escapeHtml(secondaryHref) +
        '" data-cta="service-fit-service" data-cta-location="home-fit" data-fit-intent="' +
        escapeHtml(intent) +
        '" data-service-slug="' +
        escapeHtml(map.secondary) +
        '" data-recommended-service="' +
        escapeHtml(map.service) +
        '">' +
        escapeHtml(secondaryLabel) +
        '</a></p>'
      : '';

    host.hidden = false;
    host.innerHTML =
      '<article class="home-fit__card-result">' +
      '<p class="home-fit__eyebrow">احتمالاً این مسیر برای شما مناسب‌تر است</p>' +
      '<h3 class="home-fit__rec-title">' +
      escapeHtml(primaryLabel) +
      '</h3>' +
      '<p class="home-fit__rec-reason">' +
      escapeHtml(map.reason) +
      '</p>' +
      secondaryHtml +
      '<div class="home-fit__proof">' +
      '<p class="home-fit__proof-label">نمونه نزدیک به مسئله شما</p>' +
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
      (proof ? '<span class="home-fit__proof-stat">' + escapeHtml(proof) + '</span>' : '') +
      '<span class="home-fit__proof-cta">مطالعه تجربه ›</span></a></div>' +
      '<div class="home-fit__actions">' +
      '<a class="btn btn--primary" href="' +
      escapeHtml(contactHref) +
      '" data-cta="service-fit-contact" data-cta-location="home-fit" data-fit-intent="' +
      escapeHtml(intent) +
      '" data-service-slug="' +
      escapeHtml(map.service) +
      '" data-recommended-service="' +
      escapeHtml(map.service) +
      '" data-project-slug="' +
      escapeHtml(map.project) +
      '">شروع گفتگو درباره این مسیر</a>' +
      '<a class="btn btn--outline" href="' +
      escapeHtml(serviceHref) +
      '" data-cta="service-fit-service" data-cta-location="home-fit" data-fit-intent="' +
      escapeHtml(intent) +
      '" data-service-slug="' +
      escapeHtml(map.service) +
      '" data-recommended-service="' +
      escapeHtml(map.service) +
      '" data-project-slug="' +
      escapeHtml(map.project) +
      '">دیدن این خدمت</a></div></article>';

    track('service_fit_recommendation_viewed', {
      intent: intent,
      service_slug: map.service,
      project_slug: map.project,
      location: 'homepage'
    });
    rememberFit(intent, map);
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
      track('service_fit_started', { location: 'homepage' });
    }

    if ('IntersectionObserver' in global) {
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
            reduce = global.matchMedia('(prefers-reduced-motion: reduce)').matches;
          } catch (err) {}
          try {
            result.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
          } catch (err2) {}
        }
      });
    });
  }

  global.HASH_SERVICE_FIT = {
    map: FIT_MAP,
    init: initServiceFit
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceFit);
  } else {
    initServiceFit();
  }
})(typeof window !== 'undefined' ? window : this);
