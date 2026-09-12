(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getSlug() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('slug');
    if (q) return q.replace(/\/+$/, '');
    var hash = (window.location.hash || '').replace(/^#/, '');
    return hash || 'digital-product-guide';
  }

  function text(sel, value) {
    var el = document.querySelector(sel);
    if (el) el.textContent = value;
  }

  function html(sel, value) {
    var el = document.querySelector(sel);
    if (el) el.innerHTML = value;
  }

  var slug = getSlug();
  var article = (window.HASH_ARTICLES_BY_SLUG && window.HASH_ARTICLES_BY_SLUG[slug]) ||
    window.HASH_ARTICLE_DEFAULT;
  if (!article) return;

  document.title = article.title + ' | استودیو هش';
  var pageDesc = (article.lead || '').slice(0, 160);
  var canonical = 'https://hashstudio.ir/article.html?slug=' + encodeURIComponent(article.slug || slug);
  var ogImage = article.hero
    ? ('https://hashstudio.ir/' + String(article.hero).replace(/^\//, ''))
    : 'https://hashstudio.ir/assets/images/home/logo.png';

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

  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', pageDesc);
  setMeta('property', 'og:type', 'article');
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

  var existingLd = document.getElementById('article-jsonld');
  if (existingLd) existingLd.remove();
  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.id = 'article-jsonld';
  var graph = window.HASH_CONTENT_GRAPH;
  var rel = (graph && graph.articleRel(article.slug || slug)) || { projects: [], services: [] };
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: article.title,
        description: pageDesc,
        url: canonical,
        image: ogImage,
        inLanguage: 'fa-IR',
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        author: article.author && article.author.name
          ? { '@type': 'Person', name: article.author.name }
          : { '@type': 'Organization', name: 'استودیو هش' },
        publisher: {
          '@type': 'Organization',
          name: 'استودیو هش',
          url: 'https://hashstudio.ir/',
          logo: {
            '@type': 'ImageObject',
            url: 'https://hashstudio.ir/assets/images/home/logo.png'
          }
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'خانه', item: 'https://hashstudio.ir/' },
          { '@type': 'ListItem', position: 2, name: 'بلاگ', item: 'https://hashstudio.ir/blog.html' },
          { '@type': 'ListItem', position: 3, name: article.tag || 'مقاله', item: 'https://hashstudio.ir/blog.html?filter=' + encodeURIComponent(article.tagFilter || 'all') },
          { '@type': 'ListItem', position: 4, name: article.title, item: canonical }
        ]
      }
    ]
  });
  document.head.appendChild(ld);

  text('[data-field="tag"]', article.tag);
  text('[data-field="title"]', article.title);
  text('[data-field="author-name"]', article.author.name);
  text('[data-field="author-role"]', article.author.role);
  text('[data-field="date"]', article.date);
  text('[data-field="read"]', 'زمان مطالعه: ' + article.read);
  text('[data-field="lead"]', article.lead);
  text('[data-field="author-about"]', article.author.aboutTitle);
  text('[data-field="author-bio"]', article.author.bio);
  text('[data-field="author-more"]', article.author.moreLabel);

  var crumbTag = document.querySelector('[data-field="crumb-tag"]');
  if (crumbTag) {
    crumbTag.textContent = article.tag;
    crumbTag.href = 'blog.html?filter=' + encodeURIComponent(article.tagFilter || 'all');
  }

  var hero = document.querySelector('[data-field="hero"]');
  if (hero) {
    hero.src = article.hero;
    hero.alt = '';
  }

  var avatar = document.querySelector('[data-field="avatar"]');
  if (avatar) avatar.src = article.author.avatar;

  var avatarBig = document.querySelector('[data-field="avatar-big"]');
  if (avatarBig) avatarBig.src = article.author.avatar;

  var more = document.querySelector('[data-field="author-more"]');
  if (more && more.tagName === 'A') {
    more.href = 'blog.html?filter=' + encodeURIComponent(article.tagFilter || 'all');
  }

  var tocSections = article.sections || [];
  var toc = tocSections.map(function (item, index) {
    return '<li><a class="article-toc__link' + (index === 0 ? ' is-active' : '') +
      '" href="#' + escapeHtml(item.id) + '">' + escapeHtml(item.label) + '</a></li>';
  }).join('');
  html('[data-list="toc"]', toc);

  var bodyHtml = '';
  article.blocks.forEach(function (block) {
    bodyHtml += '<section class="article-section" id="' + escapeHtml(block.id) + '">';
    bodyHtml += '<h2 class="article-section__heading">' + escapeHtml(block.heading) + '</h2>';
    (block.paragraphs || []).forEach(function (p) {
      bodyHtml += '<p class="article-section__p">' + escapeHtml(p) + '</p>';
    });
    if (block.listTitle) {
      bodyHtml += '<h3 class="article-section__sub">' + escapeHtml(block.listTitle) + '</h3>';
    }
    if (block.list && block.list.length) {
      bodyHtml += '<ul class="article-list">' + block.list.map(function (item) {
        return '<li>' + escapeHtml(item) + '</li>';
      }).join('') + '</ul>';
    }
    if (block.showInline) {
      bodyHtml += '<figure class="article-figure">' +
        '<img src="' + escapeHtml(article.inline) + '" alt="" width="759" height="379" loading="lazy">' +
        '<figcaption>' + escapeHtml(article.inlineCaption) + '</figcaption>' +
        '</figure>';
    }
    if (block.showTip) {
      bodyHtml += '<aside class="article-tip">' +
        '<div class="article-tip__head">' +
        '<img src="assets/icons/article/info.svg" alt="" width="18" height="18">' +
        '<strong>' + escapeHtml(article.tip.title) + '</strong></div>' +
        '<p>' + escapeHtml(article.tip.body) + '</p></aside>';
    }
    bodyHtml += '</section>';
  });
  bodyHtml += '<p class="article-section__p article-section__p--closing">' +
    escapeHtml(article.closing) + '</p>';
  html('[data-list="body"]', bodyHtml);

  // Quote after first section
  var bodyRoot = document.querySelector('[data-list="body"]');
  var firstSection = bodyRoot && bodyRoot.querySelector('.article-section');
  if (firstSection && article.quote && article.quote.text) {
    var quote = document.createElement('blockquote');
    quote.className = 'article-quote';
    quote.innerHTML = '<p class="article-quote__text">' + escapeHtml(article.quote.text) +
      '</p><cite class="article-quote__cite">— ' + escapeHtml(article.quote.cite) + '</cite>';
    firstSection.after(quote);
  }

  var projectsBySlug = window.HASH_PROJECTS_BY_SLUG || {};
  var serviceLabels = (graph && graph.serviceLabels) || {};
  var projectCards = (rel.projects || []).map(function (projectSlug) {
    var p = projectsBySlug[projectSlug];
    if (!p) return '';
    var svcLabel = (p.serviceSlugs || []).map(function (s) {
      return serviceLabels[s];
    }).filter(Boolean).slice(0, 1).join('') || (p.services || '');
    var img = (p.images && p.images.hero) || '';
    return '<a class="article-proof__card" href="/project/' + encodeURIComponent(p.slug) +
      '/" data-cta="view-project" data-cta-location="article" data-content-slug="' +
      escapeHtml(article.slug) + '" data-project-slug="' + escapeHtml(p.slug) + '">' +
      '<figure class="article-proof__media"><img src="' + escapeHtml(img) + '" alt="' +
      escapeHtml(p.name) + '" width="640" height="400" loading="lazy" decoding="async"></figure>' +
      '<div class="article-proof__body">' +
      '<span class="article-proof__industry">' + escapeHtml(p.industry || '') + '</span>' +
      '<h3 class="article-proof__title">' + escapeHtml(p.name) + '</h3>' +
      '<p class="article-proof__meta">' + escapeHtml(svcLabel) + '</p>' +
      '<p class="article-proof__lead">' + escapeHtml(p.lead || '') + '</p>' +
      '<span class="article-proof__cta">مطالعه کیس‌استادی</span></div></a>';
  }).join('');

  var proofSection = document.querySelector('[data-block="article-projects"]');
  if (proofSection) {
    if (projectCards) {
      html('[data-list="article-projects"]', projectCards);
      proofSection.hidden = false;
    } else {
      proofSection.hidden = true;
    }
  }

  var serviceCards = (rel.services || []).map(function (serviceSlug) {
    var label = serviceLabels[serviceSlug] || serviceSlug;
    return '<a class="article-service-link" href="/service/' + encodeURIComponent(serviceSlug) +
      '/" data-cta="view-service" data-cta-location="article" data-content-slug="' +
      escapeHtml(article.slug) + '" data-service-slug="' + escapeHtml(serviceSlug) + '">' +
      escapeHtml(label) + '</a>';
  }).join('');

  var serviceSection = document.querySelector('[data-block="article-services"]');
  if (serviceSection) {
    if (serviceCards) {
      html('[data-list="article-services"]', serviceCards);
      if (rel.ctaBody) text('[data-field="service-context"]', rel.ctaBody);
      serviceSection.hidden = false;
    } else {
      serviceSection.hidden = true;
    }
  }

  var ctaTitle = rel.ctaTitle || 'درباره پروژه بعدی‌تان حرف بزنیم';
  var ctaBody = rel.ctaBody || 'اگر این مقاله به مسئله محصول شما نزدیک بود، مسیر همکاری را کوتاه می‌کنیم.';
  text('[data-field="article-cta-title"]', ctaTitle);
  text('[data-field="article-cta-body"]', ctaBody);
  document.querySelectorAll('[data-article-cta]').forEach(function (el) {
    el.setAttribute('data-cta', 'start-project');
    el.setAttribute('data-cta-location', 'article');
    el.setAttribute('data-content-slug', article.slug || slug);
  });

  html('[data-list="related"]', (article.related || []).map(function (post) {
    return '<a class="article-related__card" href="article.html?slug=' + encodeURIComponent(post.slug) +
      '" data-cta="view-article" data-cta-location="article-related" data-content-slug="' +
      escapeHtml(post.slug) + '">' +
      '<div class="article-related__media"><img src="' + escapeHtml(post.image) +
      '" alt="" width="384" height="240" loading="lazy"></div>' +
      '<div class="article-related__body">' +
      '<span class="article-related__tag">' + escapeHtml(post.tag) + '</span>' +
      '<h3 class="article-related__title">' + escapeHtml(post.title) + '</h3>' +
      '<div class="article-related__meta"><time>' + escapeHtml(post.date) +
      '</time><span>زمان مطالعه: ' + escapeHtml(post.read) + '</span></div>' +
      '</div></a>';
  }).join(''));

  // TOC active on scroll
  var links = Array.prototype.slice.call(document.querySelectorAll('.article-toc__link'));
  var sections = links.map(function (link) {
    return document.querySelector(link.getAttribute('href'));
  }).filter(Boolean);
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setActive() {
    var current = sections[0];
    var y = window.scrollY + 140;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= y) current = sec;
    });
    links.forEach(function (link) {
      var on = current && link.getAttribute('href') === '#' + current.id;
      link.classList.toggle('is-active', !!on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  var tocNav = document.querySelector('.article-toc__list');
  if (tocNav) {
    tocNav.addEventListener('click', function (event) {
      var link = event.target.closest('a.article-toc__link');
      if (!link) return;
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  // Share intents for current article URL (not studio social profiles)
  var shareUrl = encodeURIComponent(window.location.href);
  var shareTitle = encodeURIComponent(article.title);
  var shareMap = {
    'لینکدین': 'https://www.linkedin.com/sharing/share-offsite/?url=' + shareUrl,
    'توییتر': 'https://twitter.com/intent/tweet?url=' + shareUrl + '&text=' + shareTitle,
    'وب': window.location.href
  };
  document.querySelectorAll('.article-share__btn').forEach(function (btn) {
    var label = btn.getAttribute('aria-label') || '';
    if (label === 'اشتراک' && navigator.share) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        navigator.share({ title: article.title, url: window.location.href }).catch(function () {});
      });
      return;
    }
    if (shareMap[label]) {
      btn.href = shareMap[label];
      if (label !== 'وب') {
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
      }
    }
  });

  var authorLi = document.querySelector('.article-author__social-li');
  var authorX = document.querySelector('.article-author__social-x');
  if (authorLi) {
    authorLi.href = shareMap['لینکدین'];
    authorLi.target = '_blank';
    authorLi.rel = 'noopener noreferrer';
  }
  if (authorX) {
    authorX.href = shareMap['توییتر'];
    authorX.target = '_blank';
    authorX.rel = 'noopener noreferrer';
  }
})();
