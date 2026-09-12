(function () {
  'use strict';

  /**
   * Progressive enhancement for statically generated article pages.
   * Primary content / meta / JSON-LD are already in HTML.
   */
  var root = document.body;
  if (!root || !root.classList.contains('article-page')) return;

  var titleEl = document.querySelector('.article-hero__title');
  var articleTitle = titleEl ? titleEl.textContent.trim() : document.title;
  var shareUrl = encodeURIComponent(window.location.href);
  var shareTitle = encodeURIComponent(articleTitle);
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
        navigator.share({ title: articleTitle, url: window.location.href }).catch(function () {});
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

  var links = Array.prototype.slice.call(document.querySelectorAll('.article-toc__link'));
  if (!links.length) return;

  var sections = links.map(function (link) {
    var id = (link.getAttribute('href') || '').replace(/^#/, '');
    return id ? document.getElementById(id) : null;
  }).filter(Boolean);

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setActive(id) {
    links.forEach(function (link) {
      var on = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var visible = new Map();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
        else visible.delete(entry.target.id);
      });
      var best = null;
      var bestTop = Infinity;
      visible.forEach(function (top, id) {
        var abs = Math.abs(top);
        if (abs < bestTop) {
          bestTop = abs;
          best = id;
        }
      });
      if (best) setActive(best);
    }, { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] });
    sections.forEach(function (sec) { observer.observe(sec); });
    setActive(sections[0].id);
  } else {
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var current = sections[0];
        var y = window.scrollY + 140;
        sections.forEach(function (sec) {
          if (sec.offsetTop <= y) current = sec;
        });
        if (current) setActive(current.id);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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
})();
