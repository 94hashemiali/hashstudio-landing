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
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: pageDesc,
    url: canonical,
    image: ogImage,
    inLanguage: 'fa-IR',
    author: article.author && article.author.name
      ? { '@type': 'Person', name: article.author.name }
      : { '@type': 'Organization', name: 'استودیو هش' },
    publisher: {
      '@type': 'Organization',
      name: 'استودیو هش',
      url: 'https://hashstudio.ir/',
      logo: 'https://hashstudio.ir/assets/images/home/logo.png'
    }
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
    crumbTag.href = 'blog.html';
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
  if (more && more.tagName === 'A') more.href = article.author.moreHref;

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
  if (firstSection) {
    var quote = document.createElement('blockquote');
    quote.className = 'article-quote';
    quote.innerHTML = '<p class="article-quote__text">' + escapeHtml(article.quote.text) +
      '</p><cite class="article-quote__cite">— ' + escapeHtml(article.quote.cite) + '</cite>';
    firstSection.after(quote);
  }

  html('[data-list="related"]', (article.related || []).map(function (post) {
    return '<a class="article-related__card" href="article.html?slug=' + encodeURIComponent(post.slug) + '">' +
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

  function setActive() {
    var current = sections[0];
    var y = window.scrollY + 140;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= y) current = sec;
    });
    links.forEach(function (link) {
      var on = current && link.getAttribute('href') === '#' + current.id;
      link.classList.toggle('is-active', !!on);
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
