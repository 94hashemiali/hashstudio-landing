(function () {
  'use strict';

  var PAGE_SIZE = 6;

  // DOM order for RTL grid: first item = top-right
  var POSTS = [
    {
      slug: 'nextjs-scale-seo',
      filter: 'dev',
      tag: 'توسعه',
      title: 'توسعه فرانت‌اند با فریمورک Next.js: راهنمای عملی پایداری و سئو در مقیاس بزرگ',
      excerpt: 'مروری جامع بر تکنیک‌های رندرینگ سمت سرور، بهینه‌سازی تصاویر و مدیریت حرفه‌ای استیت‌ها در پروژه‌های پیچیده تجاری.',
      date: '۱۵ فروردین ۱۴۰۵',
      read: '۱۰ دقیقه',
      image: 'assets/images/blog/post-next.webp'
    },
    {
      slug: 'product-validation',
      filter: 'product',
      tag: 'طراحی محصول',
      title: 'چگونه قبل از کدنویسی بیهوده، فرضیات اصلی محصول را اعتبارسنجی کنیم؟',
      excerpt: 'روش‌های کاربردی و ارزان برای ارزیابی بازار و بررسی همپوشانی محصول با نیاز واقعی کاربران پیش از سرمایه‌گذاری سنگین توسعه فنی.',
      date: '۲۹ فروردین ۱۴۰۵',
      read: '۵ دقیقه',
      image: 'assets/images/blog/post-product.webp'
    },
    {
      slug: 'modern-ui-2026',
      filter: 'uiux',
      tag: 'UI/UX',
      title: 'اصول طراحی رابط‌های کاربری مدرن در سال ۲۰۲۶ و چالش‌های تعاملی جدید',
      excerpt: 'بررسی نقش کلیدی المان‌های پویا، افکت‌های واقع‌گرایانه متریال و نحوه بهینه‌سازی سفرهای کاربری طولانی در وب‌اپلیکیشن‌ها.',
      date: '۱۴ اردیبهشت ۱۴۰۵',
      read: '۸ دقیقه',
      image: 'assets/images/blog/post-uiux.webp'
    },
    {
      slug: 'technical-seo-js',
      filter: 'marketing',
      tag: 'مارکتینگ',
      title: 'اصول سئوی تکنیکال برای پلتفرم‌های مدرن جاوا اسکریپت در سال جدید',
      excerpt: 'چگونه مطمئن شویم ربات‌های گوگل کدهای React و Next.js ما را به درستی و بدون ایجاد تاخیر در ایندکس خزش می‌کنند؟',
      date: '۲ اسفند ۱۴۰۴',
      read: '۷ دقیقه',
      image: 'assets/images/blog/post-seo.webp'
    },
    {
      slug: 'enterprise-ai',
      filter: 'ai',
      tag: 'هوش مصنوعی',
      title: 'یکپارچه‌سازی ابزارهای هوش مصنوعی و مدل‌های زبانی در سیستم‌های سازمانی',
      excerpt: 'چالش‌های امنیتی و کارایی در اعمال مدل‌های هوش مصنوعی بزرگ روی داده‌های مشتریان و نحوه پیاده‌سازی بهینه معماری ابری.',
      date: '۱۲ اسفند ۱۴۰۴',
      read: '۹ دقیقه',
      image: 'assets/images/blog/post-ai.webp'
    },
    {
      slug: 'design-eng-sync',
      filter: 'startup',
      tag: 'استارتاپ',
      title: 'مدیریت چابک تیم‌های توزیع‌شده: هماهنگی کامل دیزاین و مهندسی در پروژه‌ها',
      excerpt: 'چگونه در استودیو هش توانستیم هماهنگی کامل بین طراحان رابط کاربری و توسعه‌دهندگان فرانت‌اند را بدون کاهش سرعت تیم رقم بزنیم؟',
      date: '۲۸ بهمن ۱۴۰۴',
      read: '۶ دقیقه',
      image: 'assets/images/blog/post-startup.webp'
    },
    // page 2 extras — same catalog feel for pagination
    {
      slug: 'mvp-scope',
      filter: 'startup',
      tag: 'استارتاپ',
      title: 'دامنه MVP را چطور ببندیم تا لانچ اول هم ارزش بسازد هم قابل‌ساخت بماند؟',
      excerpt: 'مرز بین ایدهٔ کامل و محصول کمینه اغلب محل سوختن بودجه است. چارچوبی برای اولویت‌بندی فرضیه‌ها و بریدن فیچرهای زودرس.',
      date: '۱۰ بهمن ۱۴۰۴',
      read: '۷ دقیقه',
      image: 'assets/images/article/mvp-scope-hero.webp'
    },
    {
      slug: 'design-system-scale',
      filter: 'uiux',
      tag: 'UI/UX',
      title: 'سیستم طراحی وقتی تیم بزرگ می‌شود: از توکن تا مسئولیت کامپوننت',
      excerpt: 'چطور توکن‌ها، مستند و گیت را طوری بچینیم که دیزاین و فرانت هم‌زبان بمانند و بدهی بصری جمع نشود.',
      date: '۲۲ دی ۱۴۰۴',
      read: '۸ دقیقه',
      image: 'assets/images/article/design-system-scale-hero.webp'
    },
    {
      slug: 'product-metrics',
      filter: 'product',
      tag: 'طراحی محصول',
      title: 'از ونیته‌متریک تا سیگنال تصمیم: کدام عدد محصول را جلو می‌برد؟',
      excerpt: 'نگاهی به شاخص‌هایی که واقعاً مسیر محصول را عوض می‌کنند — و آن‌هایی که فقط داشبورد را زیبا می‌کنند.',
      date: '۵ دی ۱۴۰۴',
      read: '۶ دقیقه',
      image: 'assets/images/article/product-metrics-hero.webp'
    },
    {
      slug: 'edge-caching',
      filter: 'dev',
      tag: 'توسعه',
      title: 'کش لبه و رندر ترکیبی: سرعت واقعی برای کاربر ایرانی',
      excerpt: 'الگوهای عملی برای CDN، ISR و مدیریت کش وقتی تأخیر شبکه و محدودیت دسترسی بخشی از مسئله است.',
      date: '۱۸ آذر ۱۴۰۴',
      read: '۹ دقیقه',
      image: 'assets/images/article/edge-caching-hero.webp'
    },
    {
      slug: 'ai-ux-guardrails',
      filter: 'ai',
      tag: 'هوش مصنوعی',
      title: 'گاردریل تجربه کاربری برای قابلیت‌های هوش مصنوعی در محصول',
      excerpt: 'وقتی مدل اشتباه می‌کند، UI باید چطور اعتماد را نگه دارد؟ الگوهای شفافیت، کنترل کاربر و بازیابی خطا.',
      date: '۲ آذر ۱۴۰۴',
      read: '۷ دقیقه',
      image: 'assets/images/article/ai-ux-guardrails-hero.webp'
    },
    {
      slug: 'content-seo-funnel',
      filter: 'marketing',
      tag: 'مارکتینگ',
      title: 'محتوای تخصصی چگونه قیف جذب محصول B2B را گرم می‌کند؟',
      excerpt: 'از مقاله اتاق فکر تا لید واجد شرایط: نقش وبلاگ در سفر خریدار فنی و تصمیم‌گیر بیزینس.',
      date: '۱۵ آبان ۱۴۰۴',
      read: '۵ دقیقه',
      image: 'assets/images/article/content-seo-funnel-hero.webp'
    }
  ];

  var state = {
    filter: 'all',
    page: 1,
    query: ''
  };

  var grid = document.getElementById('blog-grid');
  var pagination = document.getElementById('blog-pagination');
  var searchForm = document.getElementById('blog-search-form');
  var searchInput = document.getElementById('blog-search-input');
  var newsletterForm = document.getElementById('blog-newsletter-form');

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function filteredPosts() {
    var q = state.query.trim().toLowerCase();
    return POSTS.filter(function (post) {
      if (state.filter !== 'all' && post.filter !== state.filter) return false;
      if (!q) return true;
      var hay = (post.title + ' ' + post.excerpt + ' ' + post.tag).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function renderCards(posts) {
    if (!grid) return;
    if (!posts.length) {
      grid.innerHTML = '<p class="blog-empty">مقاله‌ای با این فیلتر یا جستجو پیدا نشد.</p>';
      return;
    }
    grid.innerHTML = posts.map(function (post) {
      return '<a class="blog-card" href="article.html?slug=' + encodeURIComponent(post.slug) + '">' +
        '<div class="blog-card__media"><img src="' + escapeHtml(post.image) + '" alt="" width="392" height="220" loading="lazy"></div>' +
        '<div class="blog-card__body">' +
        '<span class="blog-card__tag">' + escapeHtml(post.tag) + '</span>' +
        '<h3 class="blog-card__title">' + escapeHtml(post.title) + '</h3>' +
        '<p class="blog-card__excerpt">' + escapeHtml(post.excerpt) + '</p>' +
        '<div class="blog-card__footer">' +
        '<time>' + escapeHtml(post.date) + '</time>' +
        '<span>زمان مطالعه: ' + escapeHtml(post.read) + '</span>' +
        '</div></div></a>';
    }).join('');
  }

  function renderPagination(totalPages) {
    if (!pagination) return;
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    var html = '';
    html += '<button type="button" class="blog-pagination__btn" data-blog-page="prev" aria-label="صفحه قبل"' +
      (state.page <= 1 ? ' disabled' : '') + '>‹</button>';

    for (var i = 1; i <= totalPages; i++) {
      html += '<button type="button" class="blog-pagination__btn' + (i === state.page ? ' is-active' : '') +
        '" data-blog-page="' + i + '" aria-label="صفحه ' + i + '"' +
        (i === state.page ? ' aria-current="page"' : '') + '>' + toPersianDigits(i) + '</button>';
    }

    html += '<button type="button" class="blog-pagination__btn" data-blog-page="next" aria-label="صفحه بعد"' +
      (state.page >= totalPages ? ' disabled' : '') + '>›</button>';

    pagination.innerHTML = html;
  }

  function toPersianDigits(num) {
    return String(num).replace(/\d/g, function (d) {
      return '۰۱۲۳۴۵۶۷۸۹'[d];
    });
  }

  function render() {
    var list = filteredPosts();
    var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * PAGE_SIZE;
    renderCards(list.slice(start, start + PAGE_SIZE));
    renderPagination(list.length > PAGE_SIZE ? totalPages : 0);
  }

  document.querySelectorAll('[data-blog-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.filter = btn.getAttribute('data-blog-filter') || 'all';
      state.page = 1;
      document.querySelectorAll('[data-blog-filter]').forEach(function (el) {
        var on = el === btn;
        el.classList.toggle('is-active', on);
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      render();
    });
  });

  if (pagination) {
    pagination.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-blog-page]');
      if (!btn || btn.disabled) return;
      var value = btn.getAttribute('data-blog-page');
      var list = filteredPosts();
      var totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
      if (value === 'prev') state.page = Math.max(1, state.page - 1);
      else if (value === 'next') state.page = Math.min(totalPages, state.page + 1);
      else state.page = parseInt(value, 10) || 1;
      render();
      var listing = document.getElementById('listing');
      if (listing) listing.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      state.query = searchInput.value || '';
      state.page = 1;
      render();
    });
    searchInput.addEventListener('input', function () {
      state.query = searchInput.value || '';
      state.page = 1;
      render();
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = document.getElementById('blog-newsletter-email');
      if (input) input.value = '';
      newsletterForm.reset();
    });
  }

  render();
})();
