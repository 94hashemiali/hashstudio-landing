(function (global) {
  'use strict';

  /**
   * Lightweight content relationship graph.
   * Only semantic links — empty arrays mean hide the section.
   * Topics are an internal cluster layer (no /topics/ URLs).
   */
  var ARTICLES = {
    'digital-product-guide': {
      projects: ['zarafe', 'golding'],
      services: ['product'],
      solutions: ['fintech-product', 'mvp-launch'],
      ctaTitle: 'مسیر طراحی محصولتان را مشخص کنیم',
      ctaBody: 'اگر در آغاز ساخت یا بازطراحی محصول هستید، می‌توانیم از کشف مسئله تا نقشه دامنه کنار شما باشیم.'
    },
    'logistics-product-thinking': {
      projects: [],
      services: ['product', 'consulting'],
      solutions: [],
      ctaTitle: 'مدل وضعیت محصولتان را با هم شفاف کنیم',
      ctaBody: 'اگر محصولتان با موجودی، وضعیت یا عملیات پیچیده درگیر است، جلسه کشف کوتاه کمک می‌کند مرز سیستم روشن شود.'
    },
    'product-validation': {
      projects: ['golding', 'crafty'],
      services: ['product', 'mvp'],
      solutions: ['mvp-launch', 'fintech-product'],
      ctaTitle: 'فرضیات محصول را قبل از توسعه بسنجیم',
      ctaBody: 'اگر هنوز در مرحله اعتبارسنجی ایده هستید، می‌توانیم این مرحله را قبل از کدنویسی با شما پیش ببریم.'
    },
    'mvp-scope': {
      projects: ['golding', 'crafty'],
      services: ['mvp', 'product'],
      solutions: ['mvp-launch'],
      ctaTitle: 'دامنه MVP را با هم ببندیم',
      ctaBody: 'ایده MVP دارید؟ درباره اولویت فرضیه‌ها و مرز لانچ اول حرف بزنیم.'
    },
    'product-metrics': {
      projects: ['zarafe', 'tfec'],
      services: ['product'],
      solutions: ['fintech-product', 'product-redesign'],
      ctaTitle: 'سیگنال تصمیم محصولتان را تعریف کنیم',
      ctaBody: 'اگر داشبورد دارید اما مسیر محصول مبهم است، روی شاخص‌های قابل‌اقدام تمرکز می‌کنیم.'
    },
    'modern-ui-2026': {
      projects: ['vanilly', 'pandoraland'],
      services: ['ui-ux'],
      solutions: ['product-redesign'],
      ctaTitle: 'تجربه رابط محصولتان را بازطراحی کنیم',
      ctaBody: 'اگر سفر کاربری طولانی یا تعامل پیچیده دارید، از UI/UX تا سیستم طراحی کنار شما هستیم.'
    },
    'design-system-scale': {
      projects: ['vanilly', 'shogir'],
      services: ['ui-ux'],
      solutions: ['product-redesign'],
      ctaTitle: 'سیستم طراحی مقیاس‌پذیر بسازیم',
      ctaBody: 'وقتی تیم بزرگ می‌شود، توکن و کامپوننت مشترک جلوی بدهی بصری را می‌گیرد.'
    },
    'design-eng-sync': {
      projects: [],
      services: ['consulting', 'ui-ux'],
      solutions: ['product-redesign'],
      ctaTitle: 'هماهنگی دیزاین و مهندسی را بهبود دهیم',
      ctaBody: 'اگر تحویل بین تیم‌ها کند شده، می‌توانیم فرآیند و مرز مسئولیت را شفاف کنیم.'
    },
    'nextjs-scale-seo': {
      projects: ['khosravani', 'moniaz'],
      services: ['web', 'seo'],
      solutions: ['corporate-website'],
      ctaTitle: 'وب مقیاس‌پذیر و قابل‌کشف بسازیم',
      ctaBody: 'برای ساخت یا بازطراحی محصول وب با سئو و عملکرد جدی صحبت کنیم.'
    },
    'edge-caching': {
      projects: ['shogir'],
      services: ['web'],
      solutions: [],
      ctaTitle: 'عملکرد لبه‌ای محصولتان را بررسی کنیم',
      ctaBody: 'اگر کاربران روی شبکه ضعیف‌اند، معماری کش و تحویل محتوا مسیر درستی است.'
    },
    'technical-seo-js': {
      projects: ['zeissqom', 'visionsam'],
      services: ['seo', 'web'],
      solutions: ['corporate-website'],
      ctaTitle: 'سئوی تکنیکال پلتفرم JS را درست کنیم',
      ctaBody: 'اگر ایندکس و رندر برای موتورهای جستجو دردسر شده، معماری کشف را با هم می‌چینیم.'
    },
    'content-seo-funnel': {
      projects: ['visionsam', 'shefaei'],
      services: ['seo', 'consulting'],
      solutions: ['corporate-website'],
      ctaTitle: 'قیف محتوا و لید را هم‌راستا کنیم',
      ctaBody: 'محتوا باید به خدمت و تماس برسد — نه فقط ترافیک. مسیر را مشخص می‌کنیم.'
    },
    'enterprise-ai': {
      projects: ['crafty', 'tfec'],
      services: ['ai'],
      solutions: [],
      ctaTitle: 'قابلیت AI محصولتان را بررسی کنیم',
      ctaBody: 'یکپارچه‌سازی مدل زبانی وقتی معنا دارد که مسئله، داده و مرز ریسک روشن باشد.'
    },
    'ai-ux-guardrails': {
      projects: ['crafty'],
      services: ['ai', 'ui-ux'],
      solutions: [],
      ctaTitle: 'تجربه AI قابل‌اعتماد طراحی کنیم',
      ctaBody: 'اگر خروجی مدل باید برای کاربر قابل‌فهم و قابل‌کنترل باشد، از گاردریل UX شروع می‌کنیم.'
    }
  };

  var PROJECTS = {
    zarafe: {
      articles: ['digital-product-guide', 'product-metrics'],
      solutions: ['fintech-product']
    },
    golding: {
      articles: ['mvp-scope', 'product-validation', 'digital-product-guide'],
      solutions: ['mvp-launch', 'fintech-product']
    },
    crafty: {
      articles: ['enterprise-ai', 'ai-ux-guardrails', 'mvp-scope'],
      solutions: ['mvp-launch']
    },
    vanilly: {
      articles: ['modern-ui-2026', 'design-system-scale'],
      solutions: ['product-redesign']
    },
    pandoraland: {
      articles: ['modern-ui-2026'],
      solutions: []
    },
    shogir: {
      articles: ['edge-caching', 'design-system-scale'],
      solutions: []
    },
    khosravani: {
      articles: ['nextjs-scale-seo'],
      solutions: ['corporate-website', 'product-redesign']
    },
    moniaz: {
      articles: ['nextjs-scale-seo', 'digital-product-guide'],
      solutions: ['product-redesign']
    },
    zeissqom: {
      articles: ['technical-seo-js'],
      solutions: ['corporate-website']
    },
    visionsam: {
      articles: ['content-seo-funnel', 'technical-seo-js'],
      solutions: ['corporate-website']
    },
    shefaei: {
      articles: ['content-seo-funnel'],
      solutions: []
    },
    tfec: {
      articles: ['product-metrics', 'enterprise-ai'],
      solutions: ['fintech-product']
    },
    madanicamp: {
      articles: ['modern-ui-2026', 'digital-product-guide'],
      solutions: []
    },
    zivanplus: {
      articles: ['modern-ui-2026', 'design-system-scale'],
      solutions: []
    },
    azinpart: {
      articles: ['nextjs-scale-seo', 'content-seo-funnel'],
      solutions: ['corporate-website']
    },
    abryadak: {
      articles: ['modern-ui-2026', 'content-seo-funnel'],
      solutions: []
    },
    dgservice: {
      articles: ['mvp-scope', 'product-validation', 'edge-caching'],
      solutions: ['mvp-launch']
    }
  };

  var SERVICES = {
    product: {
      articles: ['digital-product-guide', 'product-validation', 'mvp-scope', 'product-metrics'],
      solutions: ['product-redesign', 'fintech-product']
    },
    'ui-ux': {
      articles: ['modern-ui-2026', 'design-system-scale', 'ai-ux-guardrails'],
      solutions: ['product-redesign']
    },
    web: {
      articles: ['nextjs-scale-seo', 'edge-caching', 'technical-seo-js'],
      solutions: ['corporate-website']
    },
    mobile: {
      articles: ['modern-ui-2026', 'edge-caching'],
      solutions: []
    },
    mvp: {
      articles: ['mvp-scope', 'product-validation'],
      solutions: ['mvp-launch']
    },
    ai: {
      articles: ['enterprise-ai', 'ai-ux-guardrails'],
      solutions: []
    },
    seo: {
      articles: ['technical-seo-js', 'content-seo-funnel', 'nextjs-scale-seo'],
      solutions: ['corporate-website']
    },
    consulting: {
      articles: ['design-eng-sync', 'content-seo-funnel', 'logistics-product-thinking'],
      solutions: []
    }
  };

  /** Internal topic clusters — not public taxonomy pages. */
  var TOPICS = {
    'mvp': {
      label: 'راه‌اندازی MVP',
      service: 'mvp',
      solution: 'mvp-launch',
      articles: ['mvp-scope', 'product-validation', 'product-metrics'],
      projects: ['golding', 'crafty', 'dgservice']
    },
    'product-design': {
      label: 'طراحی محصول',
      service: 'product',
      solution: 'fintech-product',
      articles: ['digital-product-guide', 'product-validation', 'product-metrics'],
      projects: ['zarafe', 'golding', 'moniaz']
    },
    'redesign': {
      label: 'بازطراحی محصول',
      service: 'product',
      solution: 'product-redesign',
      articles: ['modern-ui-2026', 'product-metrics', 'design-eng-sync'],
      projects: ['moniaz', 'vanilly', 'khosravani']
    },
    'ui-ux': {
      label: 'طراحی UI/UX',
      service: 'ui-ux',
      solution: 'product-redesign',
      articles: ['modern-ui-2026', 'design-system-scale', 'ai-ux-guardrails'],
      projects: ['vanilly', 'pandoraland', 'shogir']
    },
    'web': {
      label: 'توسعه وب',
      service: 'web',
      solution: 'corporate-website',
      articles: ['nextjs-scale-seo', 'edge-caching', 'technical-seo-js'],
      projects: ['khosravani', 'visionsam', 'moniaz']
    },
    'seo': {
      label: 'سئو و رشد',
      service: 'seo',
      solution: 'corporate-website',
      articles: ['technical-seo-js', 'content-seo-funnel', 'nextjs-scale-seo'],
      projects: ['zeissqom', 'visionsam', 'shefaei']
    },
    'ai': {
      label: 'هوش مصنوعی در محصول',
      service: 'ai',
      solution: '',
      articles: ['enterprise-ai', 'ai-ux-guardrails'],
      projects: ['crafty', 'tfec']
    },
    'fintech': {
      label: 'محصول فین‌تک',
      service: 'product',
      solution: 'fintech-product',
      articles: ['digital-product-guide', 'product-metrics', 'product-validation'],
      projects: ['zarafe', 'golding', 'tfec']
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

  var SOLUTION_LABELS = {
    'product-redesign': 'بازطراحی محصول و وب‌سایت',
    'corporate-website': 'طراحی و توسعه سایت شرکتی',
    'mvp-launch': 'راه‌اندازی MVP قابل‌ساخت',
    'fintech-product': 'طراحی محصول فین‌تک'
  };

  function articleRel(slug) {
    var row = ARTICLES[slug] || {};
    return {
      projects: row.projects || [],
      services: row.services || [],
      solutions: row.solutions || [],
      ctaTitle: row.ctaTitle || '',
      ctaBody: row.ctaBody || ''
    };
  }

  function projectRel(slug) {
    var row = PROJECTS[slug] || {};
    return {
      articles: row.articles || [],
      solutions: row.solutions || []
    };
  }

  function serviceRel(slug) {
    var row = SERVICES[slug] || {};
    return {
      articles: row.articles || [],
      solutions: row.solutions || []
    };
  }

  function topicRel(slug) {
    return TOPICS[slug] || null;
  }

  global.HASH_CONTENT_GRAPH = {
    articles: ARTICLES,
    projects: PROJECTS,
    services: SERVICES,
    topics: TOPICS,
    serviceLabels: SERVICE_LABELS,
    solutionLabels: SOLUTION_LABELS,
    articleRel: articleRel,
    projectRel: projectRel,
    serviceRel: serviceRel,
    topicRel: topicRel
  };
})(typeof window !== 'undefined' ? window : this);
