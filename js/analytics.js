/**
 * Hash Studio analytics — provider-neutral, fail-silent.
 *
 * Connect later:
 *   window.HASH_ANALYTICS_PROVIDER = { track: function (event, props) {} };
 */
(function (global) {
  'use strict';

  if (global.HashAnalytics && global.HashAnalytics.__booted) return;

  var ATTR_KEY = 'hashstudio_attribution';
  var LEAD_KEY = 'hashstudio_lead_context';
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var SCROLL_MARKS = [25, 50, 75, 90];
  var PII_KEYS = {
    name: 1,
    email: 1,
    phone: 1,
    company: 1,
    message: 1,
    filename: 1,
    value: 1,
    goal: 1,
    budget: 1,
    timeline: 1
  };

  function safe(fn) {
    try {
      return fn();
    } catch (err) {
      return undefined;
    }
  }

  function pathOnly() {
    return String((global.location && location.pathname) || '/');
  }

  function readJson(key) {
    return safe(function () {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    }) || null;
  }

  function writeJson(key, value) {
    safe(function () {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  function readSession(key) {
    return safe(function () {
      var raw = sessionStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    }) || null;
  }

  function writeSession(key, value) {
    safe(function () {
      sessionStorage.setItem(key, JSON.stringify(value));
    });
  }

  function pageContext() {
    var path = pathOnly();
    var body = document.body;
    var slug = (body && body.getAttribute('data-slug')) || '';
    var type = 'other';

    if (body) {
      if (body.classList.contains('project-page') || /^\/project\//.test(path)) type = 'project';
      else if (body.classList.contains('sd-page') || /^\/service\//.test(path)) type = 'service';
      else if (body.classList.contains('article-page') || /^\/article\//.test(path)) type = 'article';
      else if (body.classList.contains('contact-page') || /contact\.html$/.test(path)) type = 'contact';
      else if (body.classList.contains('about-page') || /about\.html$/.test(path)) type = 'about';
      else if (/projects\.html$/.test(path)) type = 'projects';
      else if (/services\.html$/.test(path)) type = 'services';
      else if (/blog\.html$/.test(path)) type = 'blog';
      else if (path === '/' || /(?:^|\/)index\.html$/.test(path)) type = 'home';
    }

    if (!slug) {
      var m = path.match(/^\/(project|service|article)\/([^/]+)\/?/);
      if (m) slug = decodeURIComponent(m[2]);
    }

    var ctx = { page_type: type, page_path: path };
    if (type === 'project' && slug) ctx.project_slug = slug;
    if (type === 'service' && slug) ctx.service_slug = slug;
    if (type === 'article' && slug) ctx.article_slug = slug;
    return ctx;
  }

  function readQueryParam(key) {
    return safe(function () {
      if (typeof URLSearchParams !== 'undefined') {
        return new URLSearchParams(location.search || '').get(key);
      }
      var q = String(location.search || '').replace(/^\?/, '');
      var found = null;
      q.split('&').forEach(function (pair) {
        if (!pair) return;
        var parts = pair.split('=');
        var k = decodeURIComponent(parts[0] || '');
        if (k === key) found = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
      });
      return found;
    });
  }

  function captureAttribution() {
    var path = pathOnly();
    var referrer = '';
    safe(function () {
      referrer = document.referrer || '';
    });

    var existing = readJson(ATTR_KEY) || {};
    var lastPath = path;
    var next = {
      first_landing_path: existing.first_landing_path || path,
      first_referrer: existing.first_referrer || referrer || '',
      first_utm_source: existing.first_utm_source || '',
      first_utm_medium: existing.first_utm_medium || '',
      first_utm_campaign: existing.first_utm_campaign || '',
      first_utm_content: existing.first_utm_content || '',
      first_utm_term: existing.first_utm_term || '',
      // last_landing_path kept for backward compat (= last visited page path)
      last_landing_path: lastPath,
      last_page_path: lastPath,
      last_referrer: referrer || existing.last_referrer || '',
      last_utm_source: existing.last_utm_source || '',
      last_utm_medium: existing.last_utm_medium || '',
      last_utm_campaign: existing.last_utm_campaign || '',
      last_utm_content: existing.last_utm_content || '',
      last_utm_term: existing.last_utm_term || '',
      updated_at: Date.now()
    };

    UTM_KEYS.forEach(function (key) {
      var val = readQueryParam(key);
      if (!val) return;
      var short = key.replace('utm_', '');
      if (!next['first_utm_' + short]) next['first_utm_' + short] = val;
      next['last_utm_' + short] = val;
    });

    writeJson(ATTR_KEY, next);
    return next;
  }

  function getAttribution() {
    var attr = readJson(ATTR_KEY) || captureAttribution();
    if (attr && !attr.last_page_path && attr.last_landing_path) {
      attr.last_page_path = attr.last_landing_path;
    }
    return attr;
  }

  function parseSameOriginPath(url) {
    return safe(function () {
      var u = new URL(url, location.href);
      if (u.hostname !== location.hostname) return '';
      return u.pathname || '';
    }) || '';
  }

  function contextFromPath(path) {
    var m = String(path || '').match(/^\/(project|service|article)\/([^/]+)\/?/);
    if (!m) return null;
    var kind = m[1];
    var slug = decodeURIComponent(m[2]);
    var payload = {
      page_type: kind,
      page_path: '/' + kind + '/' + slug + '/',
      url: safe(function () {
        return location.origin + '/' + kind + '/' + slug + '/';
      }) || '',
      project_slug: '',
      service_slug: '',
      article_slug: '',
      saved_at: Date.now()
    };
    if (kind === 'project') payload.project_slug = slug;
    if (kind === 'service') payload.service_slug = slug;
    if (kind === 'article') payload.article_slug = slug;
    return payload;
  }

  function rememberLeadContext(extra) {
    var ctx = pageContext();
    // Never let contact/home overwrite a richer content context unless explicit slugs given
    if (ctx.page_type === 'contact' || ctx.page_type === 'home' || ctx.page_type === 'other') {
      var existing = readSession(LEAD_KEY);
      var hasExplicit =
        (extra && (extra.project_slug || extra.service_slug || extra.article_slug));
      if (existing && (existing.project_slug || existing.service_slug || existing.article_slug) && !hasExplicit) {
        return existing;
      }
    }

    var payload = {
      page_type: ctx.page_type,
      page_path: ctx.page_path,
      url: safe(function () {
        return location.origin + ctx.page_path;
      }) || '',
      project_slug: ctx.project_slug || (extra && extra.project_slug) || '',
      service_slug: ctx.service_slug || (extra && extra.service_slug) || '',
      article_slug: ctx.article_slug || (extra && extra.article_slug) || '',
      saved_at: Date.now()
    };

    if (!payload.project_slug && !payload.service_slug && !payload.article_slug) {
      if (ctx.page_type !== 'project' && ctx.page_type !== 'service' && ctx.page_type !== 'article') {
        return readSession(LEAD_KEY);
      }
    }

    writeSession(LEAD_KEY, payload);
    return payload;
  }

  function ensureLeadContext() {
    var existing = readSession(LEAD_KEY);
    if (existing && (existing.project_slug || existing.service_slug || existing.article_slug)) {
      return existing;
    }

    var ctx = pageContext();
    if (ctx.page_type === 'project' || ctx.page_type === 'service' || ctx.page_type === 'article') {
      return rememberLeadContext();
    }

    // Direct nav / same-origin referrer into contact (no CTA click)
    var refPath = '';
    safe(function () {
      refPath = parseSameOriginPath(document.referrer || '');
    });
    var inferred = contextFromPath(refPath);
    if (inferred) {
      writeSession(LEAD_KEY, inferred);
      return inferred;
    }
    return existing;
  }

  function getLeadContext() {
    return readSession(LEAD_KEY) || ensureLeadContext() || null;
  }

  function cleanDestination(href) {
    return safe(function () {
      var u = new URL(href, location.href);
      return u.origin + u.pathname;
    }) || String(href || '').split('?')[0].split('#')[0];
  }

  function sanitizeProps(props) {
    var out = {};
    if (!props || typeof props !== 'object') return out;
    Object.keys(props).forEach(function (key) {
      if (PII_KEYS[key]) return;
      var val = props[key];
      if (val == null) return;
      var t = typeof val;
      if (t === 'string' || t === 'number' || t === 'boolean') {
        out[key] = val;
        return;
      }
      // Drop nested objects/arrays — avoid accidental PII bags
    });
    return out;
  }

  function forward(eventName, props) {
    var provider = global.HASH_ANALYTICS_PROVIDER;
    if (!provider || typeof provider.track !== 'function') return;
    safe(function () {
      provider.track(eventName, props || {});
    });
  }

  function track(eventName, props) {
    if (!eventName) return;
    var payload = Object.assign({}, sanitizeProps(pageContext()), sanitizeProps(props || {}));
    payload.event = eventName;
    forward(eventName, payload);
    if (global.HASH_ANALYTICS_DEBUG) {
      safe(function () {
        console.info('[HashAnalytics]', eventName, payload);
      });
    }
  }

  function enrichCtaProps(el) {
    var props = {
      cta: el.getAttribute('data-cta') || '',
      location: el.getAttribute('data-cta-location') || 'page'
    };
    ['project-slug', 'service-slug', 'content-slug', 'article-slug'].forEach(function (attr) {
      var val = el.getAttribute('data-' + attr);
      if (!val) return;
      if (attr === 'content-slug' || attr === 'article-slug') props.article_slug = val;
      if (attr === 'project-slug') props.project_slug = val;
      if (attr === 'service-slug') props.service_slug = val;
    });
    return props;
  }

  function onCtaClick(el) {
    // Form submit is tracked by contact.js — do not treat as start-project CTA
    if (el.closest && el.closest('form#contact-form') && (el.type === 'submit' || el.getAttribute('type') === 'submit')) {
      return;
    }

    var props = enrichCtaProps(el);
    var cta = props.cta;
    if (!cta) return;

    track('cta_click', props);

    var ctx = pageContext();
    if (cta === 'start-project') {
      rememberLeadContext(props);
      if (ctx.page_type === 'project') track('start_project_from_project', props);
      else if (ctx.page_type === 'service') track('start_project_from_service', props);
      else if (ctx.page_type === 'article') track('start_project_from_article', props);
    }

    if (cta === 'external-project') {
      track('external_project_click', {
        project_slug: props.project_slug || ctx.project_slug || '',
        destination: cleanDestination(el.getAttribute('href') || '')
      });
    }

    if (cta === 'view-project') track('project_view_click', props);
    if (cta === 'view-service') track('service_view_click', props);
    if (cta === 'view-article') track('article_view_click', props);
  }

  function bindClicks() {
    document.addEventListener(
      'click',
      function (event) {
        var ctaEl = event.target && event.target.closest && event.target.closest('[data-cta]');
        if (ctaEl) {
          onCtaClick(ctaEl);
          return;
        }

        var a = event.target && event.target.closest && event.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href') || '';
        if (!/^https?:\/\//i.test(href)) return;
        if (a.hasAttribute('data-cta')) return;
        var host = '';
        safe(function () {
          host = new URL(href, location.href).hostname;
        });
        if (!host || host === location.hostname) return;
        track('outbound_click', {
          destination: cleanDestination(href),
          location: a.closest('footer, .home-footer') ? 'footer' : 'page'
        });
      },
      true
    );
  }

  function bindFaq() {
    document.addEventListener(
      'toggle',
      function (event) {
        var details = event.target;
        if (!details || details.tagName !== 'DETAILS') return;
        if (!details.open) return;
        if (!details.classList.contains('faq-item') && !details.closest('.faq-list, .ct-faq, .sd-faq')) {
          return;
        }
        var label = '';
        safe(function () {
          var q = details.querySelector('.faq-item__label, summary');
          label = (q && q.textContent ? q.textContent : '').trim().slice(0, 80);
        });
        track('faq_open', { faq_label: label || 'faq' });
      },
      true
    );
  }

  function bindScrollDepth() {
    var ctx = pageContext();
    if (ctx.page_type !== 'article' && ctx.page_type !== 'project') return;
    var fired = {};
    var armed = false;

    function measure() {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop || 0;
      var height = Math.max(doc.scrollHeight - window.innerHeight, 1);
      return Math.min(100, Math.max(0, (scrollTop / height) * 100));
    }

    function check() {
      if (!armed) return;
      var pct = measure();
      SCROLL_MARKS.forEach(function (mark) {
        if (pct < mark || fired[mark]) return;
        fired[mark] = true;
        var eventName = ctx.page_type === 'article' ? 'article_scroll_depth' : 'project_scroll_depth';
        track(eventName, { depth: mark });
      });
    }

    function arm() {
      if (armed) return;
      // Ignore tiny bounce / initial layout scroll
      if ((window.scrollY || 0) < 24) return;
      armed = true;
      check();
    }

    safe(function () {
      window.addEventListener('scroll', arm, { passive: true });
      window.addEventListener('scroll', check, { passive: true });
    });
  }

  function firePageViews() {
    var ctx = pageContext();
    if (ctx.page_type === 'project') {
      rememberLeadContext();
      track('project_view', { project_slug: ctx.project_slug || '' });
    } else if (ctx.page_type === 'service') {
      rememberLeadContext();
      track('service_view', { service_slug: ctx.service_slug || '' });
    } else if (ctx.page_type === 'article') {
      rememberLeadContext();
      track('article_view', { article_slug: ctx.article_slug || '' });
    } else if (ctx.page_type === 'contact') {
      ensureLeadContext();
    }
  }

  function init() {
    if (HashAnalytics.__booted) return;
    HashAnalytics.__booted = true;
    captureAttribution();
    bindClicks();
    bindFaq();
    bindScrollDepth();
    firePageViews();
  }

  var HashAnalytics = {
    __booted: false,
    track: track,
    pageContext: pageContext,
    getAttribution: getAttribution,
    captureAttribution: captureAttribution,
    rememberLeadContext: rememberLeadContext,
    ensureLeadContext: ensureLeadContext,
    getLeadContext: getLeadContext,
    init: init
  };

  global.HashAnalytics = HashAnalytics;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
