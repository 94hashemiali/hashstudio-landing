(function (global) {
  'use strict';

  /**
   * Lightweight content relationship graph.
   * Only semantic links — empty arrays mean hide the section.
   */
  var ARTICLES = {
    'digital-product-guide': {
      projects: ['zarafe', 'golding'],
      services: ['product'],
      ctaTitle: 'مسیر طراحی محصولتان را مشخص کنیم',
      ctaBody: 'اگر در آغاز ساخت یا بازطراحی محصول هستید، می‌توانیم از کشف مسئله تا نقشه دامنه کنار شما باشیم.'
    },
    'logistics-product-thinking': {
      projects: [],
      services: ['product', 'consulting'],
      ctaTitle: 'مدل وضعیت محصولتان را با هم شفاف کنیم',
      ctaBody: 'اگر محصولتان با موجودی، وضعیت یا عملیات پیچیده درگیر است، جلسه کشف کوتاه کمک می‌کند مرز سیستم روشن شود.'
    },
    'product-validation': {
      projects: ['golding', 'crafty'],
      services: ['product', 'mvp'],
      ctaTitle: 'فرضیات محصول را قبل از توسعه بسنجیم',
      ctaBody: 'اگر هنوز در مرحله اعتبارسنجی ایده هستید، می‌توانیم این مرحله را قبل از کدنویسی با شما پیش ببریم.'
    },
    'mvp-scope': {
      projects: ['golding', 'crafty'],
      services: ['mvp', 'product'],
      ctaTitle: 'دامنه MVP را با هم ببندیم',
      ctaBody: 'ایده MVP دارید؟ درباره اولویت فرضیه‌ها و مرز لانچ اول حرف بزنیم.'
    },
    'product-metrics': {
      projects: ['zarafe', 'tfec'],
      services: ['product'],
      ctaTitle: 'سیگنال تصمیم محصولتان را تعریف کنیم',
      ctaBody: 'اگر داشبورد دارید اما مسیر محصول مبهم است، روی شاخص‌های قابل‌اقدام تمرکز می‌کنیم.'
    },
    'modern-ui-2026': {
      projects: ['vanilly', 'pandoraland'],
      services: ['ui-ux'],
      ctaTitle: 'تجربه رابط محصولتان را بازطراحی کنیم',
      ctaBody: 'اگر سفر کاربری طولانی یا تعامل پیچیده دارید، از UI/UX تا سیستم طراحی کنار شما هستیم.'
    },
    'design-system-scale': {
      projects: ['vanilly', 'shogir'],
      services: ['ui-ux'],
      ctaTitle: 'سیستم طراحی مقیاس‌پذیر بسازیم',
      ctaBody: 'وقتی تیم بزرگ می‌شود، توکن و کامپوننت مشترک جلوی بدهی بصری را می‌گیرد.'
    },
    'design-eng-sync': {
      projects: [],
      services: ['consulting', 'ui-ux'],
      ctaTitle: 'هماهنگی دیزاین و مهندسی را بهبود دهیم',
      ctaBody: 'اگر تحویل بین تیم‌ها کند شده، می‌توانیم فرآیند و مرز مسئولیت را شفاف کنیم.'
    },
    'nextjs-scale-seo': {
      projects: ['khosravani', 'moniaz'],
      services: ['web', 'seo'],
      ctaTitle: 'وب مقیاس‌پذیر و قابل‌کشف بسازیم',
      ctaBody: 'برای ساخت یا بازطراحی محصول وب با سئو و عملکرد جدی صحبت کنیم.'
    },
    'edge-caching': {
      projects: ['shogir'],
      services: ['web'],
      ctaTitle: 'عملکرد لبه‌ای محصولتان را بررسی کنیم',
      ctaBody: 'اگر کاربران روی شبکه ضعیف‌اند، معماری کش و تحویل محتوا مسیر درستی است.'
    },
    'technical-seo-js': {
      projects: ['zeissqom', 'visionsam'],
      services: ['seo', 'web'],
      ctaTitle: 'سئوی تکنیکال پلتفرم JS را درست کنیم',
      ctaBody: 'اگر ایندکس و رندر برای موتورهای جستجو دردسر شده، معماری کشف را با هم می‌چینیم.'
    },
    'content-seo-funnel': {
      projects: ['visionsam', 'shefaei'],
      services: ['seo', 'consulting'],
      ctaTitle: 'قیف محتوا و لید را هم‌راستا کنیم',
      ctaBody: 'محتوا باید به خدمت و تماس برسد — نه فقط ترافیک. مسیر را مشخص می‌کنیم.'
    },
    'enterprise-ai': {
      projects: ['crafty', 'tfec'],
      services: ['ai'],
      ctaTitle: 'قابلیت AI محصولتان را بررسی کنیم',
      ctaBody: 'یکپارچه‌سازی مدل زبانی وقتی معنا دارد که مسئله، داده و مرز ریسک روشن باشد.'
    },
    'ai-ux-guardrails': {
      projects: ['crafty'],
      services: ['ai', 'ui-ux'],
      ctaTitle: 'تجربه AI قابل‌اعتماد طراحی کنیم',
      ctaBody: 'اگر خروجی مدل باید برای کاربر قابل‌فهم و قابل‌کنترل باشد، از گاردریل UX شروع می‌کنیم.'
    }
  };

  var PROJECTS = {
    zarafe: { articles: ['digital-product-guide', 'product-metrics'] },
    golding: { articles: ['mvp-scope', 'product-validation', 'digital-product-guide'] },
    crafty: { articles: ['enterprise-ai', 'ai-ux-guardrails', 'mvp-scope'] },
    vanilly: { articles: ['modern-ui-2026', 'design-system-scale'] },
    pandoraland: { articles: ['modern-ui-2026'] },
    shogir: { articles: ['edge-caching', 'design-system-scale'] },
    khosravani: { articles: ['nextjs-scale-seo'] },
    moniaz: { articles: ['nextjs-scale-seo', 'digital-product-guide'] },
    zeissqom: { articles: ['technical-seo-js'] },
    visionsam: { articles: ['content-seo-funnel', 'technical-seo-js'] },
    shefaei: { articles: ['content-seo-funnel'] },
    tfec: { articles: ['product-metrics', 'enterprise-ai'] }
  };

  var SERVICES = {
    product: {
      articles: ['digital-product-guide', 'product-validation', 'mvp-scope', 'product-metrics']
    },
    'ui-ux': {
      articles: ['modern-ui-2026', 'design-system-scale', 'ai-ux-guardrails']
    },
    web: {
      articles: ['nextjs-scale-seo', 'edge-caching', 'technical-seo-js']
    },
    mobile: {
      articles: ['modern-ui-2026', 'edge-caching']
    },
    mvp: {
      articles: ['mvp-scope', 'product-validation']
    },
    ai: {
      articles: ['enterprise-ai', 'ai-ux-guardrails']
    },
    seo: {
      articles: ['technical-seo-js', 'content-seo-funnel', 'nextjs-scale-seo']
    },
    consulting: {
      articles: ['design-eng-sync', 'content-seo-funnel', 'logistics-product-thinking']
    }
  };

  var SERVICE_LABELS = {
    product: 'طراحی محصول',
    'ui-ux': 'طراحی UI/UX',
    web: 'توسعه وب',
    mobile: 'توسعه موبایل',
    mvp: 'راه‌اندازی MVP',
    ai: 'هوش مصنوعی',
    seo: 'سئو و رشد',
    consulting: 'مشاوره محصول'
  };

  function articleRel(slug) {
    return ARTICLES[slug] || { projects: [], services: [], ctaTitle: '', ctaBody: '' };
  }

  function projectRel(slug) {
    return PROJECTS[slug] || { articles: [] };
  }

  function serviceRel(slug) {
    return SERVICES[slug] || { articles: [] };
  }

  global.HASH_CONTENT_GRAPH = {
    articles: ARTICLES,
    projects: PROJECTS,
    services: SERVICES,
    serviceLabels: SERVICE_LABELS,
    articleRel: articleRel,
    projectRel: projectRel,
    serviceRel: serviceRel
  };
})(typeof window !== 'undefined' ? window : this);
