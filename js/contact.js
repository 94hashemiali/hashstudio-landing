(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var upload = document.getElementById('ct-upload');
  var fileInput = document.getElementById('attachment');
  var fileName = document.getElementById('ct-upload-name');
  var MAX_BYTES = 10 * 1024 * 1024;
  var studioEmail = (window.HASH_STUDIO && window.HASH_STUDIO.email) || 'info@hashstudio.ir';
  var details = document.getElementById('ct-details');
  var formStarted = false;
  var analytics = window.HashAnalytics;
  var userChoseProjectType = false;

  var SERVICE_LABELS = {
    product: 'طراحی محصول',
    'ui-ux': 'طراحی UI/UX',
    web: 'توسعه وب',
    mobile: 'توسعه موبایل',
    mvp: 'ساخت MVP',
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

  var SOLUTION_PRIMARY = {
    'product-redesign': 'product',
    'corporate-website': 'web',
    'mvp-launch': 'mvp',
    'fintech-product': 'product'
  };

  var FIT_INTENT_LABELS = {
    idea: 'شروع از ایده جدید',
    existing: 'بهبود محصول موجود',
    website: 'سایت یا حضور آنلاین',
    technical: 'پیاده‌سازی فنی',
    unknown: 'شفاف‌سازی مسیر'
  };

  var KNOWN_INTENTS = {
    idea: 1,
    existing: 1,
    website: 1,
    technical: 1,
    unknown: 1,
    'product-redesign': 1,
    'corporate-website': 1,
    'mvp-launch': 1,
    'fintech-product': 1
  };

  var SERVICE_TO_FORM = {
    product: 'product',
    'ui-ux': 'ui-ux',
    web: 'website',
    mobile: 'app',
    mvp: 'mvp',
    ai: 'ai',
    seo: 'seo',
    consulting: 'consulting'
  };

  var MESSAGE_PROMPTS = {
    'mvp-launch':
      'چه چیزی می‌خواهید بسازید؟ کاربر اصلی کیست و نسخه اول باید چه کاری را انجام دهد؟',
    'product-redesign':
      'الان چه چیزی در محصول یا سایت خوب کار نمی‌کند و می‌خواهید چه چیزی بهتر شود؟',
    'corporate-website':
      'هدف سایت چیست؟ چه مخاطبی باید به تماس، خرید یا درخواست مشاوره برسد؟',
    'fintech-product':
      'هسته معامله یا پرداخت چیست و بزرگ‌ترین اصطکاک اعتماد کاربر کجاست؟',
    idea: 'ایده چیست، برای چه کسی است، و نسخه اول باید چه فرضیه‌ای را بیازماید؟',
    existing: 'الان چه چیزی در محصول خوب کار نمی‌کند و اولویت اول بهبود چیست؟',
    website: 'هدف سایت چیست؟ چه مخاطبی باید به تماس، خرید یا درخواست مشاوره برسد؟',
    technical: 'چه چیزی باید ساخته شود و محدودیت فنی یا زمان‌بندی اصلی چیست؟',
    seo: 'الان مشکل سئو چیست و چه صفحات یا مسیرهایی برای کسب‌وکار مهم‌ترند؟',
    mvp: 'چه چیزی می‌خواهید بسازید؟ کاربر اصلی کیست و نسخه اول باید چه کاری را انجام دهد؟',
    product: 'مسئله کاربر چیست و چه خروجی ملموسی از همکاری می‌خواهید؟',
    'ui-ux': 'کدام جریان یا صفحه گیر دارد و موفقیت تجربه جدید چه شکلی است؟',
    web: 'هدف سایت یا محصول وب چیست و مسیر اقدام اصلی کاربر کدام است؟'
  };

  // Analytics: contextual flags only. Form values go to mailto body, never to track().
  function track(eventName, props) {
    if (!analytics || typeof analytics.track !== 'function') return;
    try {
      analytics.track(eventName, props || {});
    } catch (err) {}
  }

  function markFormStart() {
    if (formStarted) return;
    formStarted = true;
    track('contact_form_start', { location: 'contact-form' });
  }

  function showError(input, message) {
    input.classList.add('is-error');
    var errorEl = input.parentElement.querySelector('.ct-form__error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'ct-form__error';
      errorEl.setAttribute('role', 'alert');
      input.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  function clearError(input) {
    input.classList.remove('is-error');
    var errorEl = input.parentElement.querySelector('.ct-form__error');
    if (errorEl) errorEl.remove();
  }

  function validateField(input) {
    var value = input.value.trim();
    clearError(input);

    if (input.hasAttribute('required') && !value) {
      showError(input, 'این فیلد الزامی است.');
      return { ok: false, reason: 'required' };
    }

    if (input.type === 'email' && value && !emailRegex.test(value)) {
      showError(input, 'ایمیل وارد شده معتبر نیست.');
      return { ok: false, reason: 'invalid' };
    }

    return { ok: true };
  }

  form.querySelectorAll('.ct-form__input, .ct-form__select, .ct-form__textarea').forEach(function (input) {
    input.addEventListener('focus', markFormStart);
    input.addEventListener('input', markFormStart);
    input.addEventListener('change', markFormStart);
    input.addEventListener('blur', function () {
      validateField(input);
    });
  });

  function setFile(file) {
    if (!fileName) return;
    if (!file) {
      fileName.hidden = true;
      fileName.textContent = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      fileName.hidden = false;
      fileName.textContent = 'حجم فایل بیشتر از ۱۰ مگابایت است.';
      if (fileInput) fileInput.value = '';
      return;
    }
    fileName.hidden = false;
    fileName.textContent = 'نام فایل در ایمیل ذکر می‌شود: ' + file.name;
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      markFormStart();
      setFile(fileInput.files && fileInput.files[0]);
    });
  }

  if (upload && fileInput) {
    function openPicker() {
      fileInput.click();
    }

    upload.addEventListener('click', openPicker);
    upload.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPicker();
      }
    });

    ;['dragenter', 'dragover'].forEach(function (type) {
      upload.addEventListener(type, function (event) {
        event.preventDefault();
        upload.classList.add('is-dragover');
      });
    });
    ;['dragleave', 'drop'].forEach(function (type) {
      upload.addEventListener(type, function (event) {
        event.preventDefault();
        upload.classList.remove('is-dragover');
      });
    });
    upload.addEventListener('drop', function (event) {
      var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (!file) return;
      try {
        var dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
      } catch (err) {}
      markFormStart();
      setFile(file);
    });
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  function fieldLabel(id) {
    var el = document.getElementById(id);
    if (!el) return '';
    if (el.tagName === 'SELECT' && el.selectedOptions && el.selectedOptions[0]) {
      return String(el.selectedOptions[0].textContent || '').trim();
    }
    return fieldValue(id);
  }

  function selectValue(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  function hasUsefulAttribution(attr, lead) {
    if (lead && (lead.project_slug || lead.service_slug || lead.article_slug || lead.page_path)) {
      return true;
    }
    if (!attr) return false;
    return !!(
      attr.first_utm_source ||
      attr.first_utm_medium ||
      attr.first_utm_campaign ||
      attr.first_utm_content ||
      attr.first_utm_term ||
      attr.first_referrer ||
      (attr.first_landing_path && attr.first_landing_path !== '/contact.html' && attr.first_landing_path !== '/')
    );
  }

  function relatedPath(lead) {
    if (!lead) return '';
    if (lead.page_path && /^\/(project|service|article|solutions|for)\//.test(lead.page_path)) {
      return lead.page_path;
    }
    if (lead.project_slug) return '/project/' + lead.project_slug + '/';
    if (lead.service_slug) return '/service/' + lead.service_slug + '/';
    if (lead.article_slug) return '/article/' + lead.article_slug + '/';
    if (lead.intent && SOLUTION_LABELS[lead.intent]) {
      return '/solutions/' + lead.intent + '/';
    }
    return '';
  }

  // Mailto body may include user form content. Analytics must not.
  function attributionLines() {
    var lines = [];
    var attr = analytics && analytics.getAttribution ? analytics.getAttribution() : null;
    var lead =
      analytics && analytics.ensureLeadContext
        ? analytics.ensureLeadContext()
        : analytics && analytics.getLeadContext
          ? analytics.getLeadContext()
          : null;

    if (!hasUsefulAttribution(attr, lead)) return lines;

    lines.push('', 'اطلاعات مسیر ورود:');
    if (attr) {
      if (attr.first_utm_source) lines.push('منبع: ' + attr.first_utm_source);
      if (attr.first_utm_medium) lines.push('رسانه: ' + attr.first_utm_medium);
      if (attr.first_utm_campaign) lines.push('کمپین: ' + attr.first_utm_campaign);
      if (attr.first_utm_content) lines.push('محتوای UTM: ' + attr.first_utm_content);
      if (attr.first_utm_term) lines.push('عبارت UTM: ' + attr.first_utm_term);
      if (attr.first_referrer) lines.push('ارجاع اولیه: ' + attr.first_referrer);
      if (attr.first_landing_path) lines.push('صفحه ورود: ' + attr.first_landing_path);
    }
    var related = relatedPath(lead);
    if (related) lines.push('صفحه مرتبط: ' + related);
    if (lead && lead.intent) lines.push('نیت بازدیدکننده: ' + lead.intent);
    if (lead && lead.recommended_service) lines.push('خدمت پیشنهادی: ' + lead.recommended_service);
    return lines;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var required = form.querySelectorAll('[required]');
    var isValid = true;
    var firstBadField = '';
    var firstReason = '';
    required.forEach(function (field) {
      var result = validateField(field);
      if (!result.ok) {
        isValid = false;
        if (!firstBadField) {
          firstBadField = field.id || field.name || 'unknown';
          firstReason = result.reason || 'invalid';
        }
      }
    });

    if (!isValid) {
      track('contact_form_validation_error', {
        field: firstBadField,
        reason: firstReason || 'invalid'
      });
      var firstBad = form.querySelector('.is-error');
      if (firstBad) firstBad.focus();
      return;
    }

    // Form content for mailto only — not for analytics
    var name = fieldValue('name');
    var phone = fieldValue('phone');
    var email = fieldValue('email');
    var company = fieldValue('company');
    var projectType = fieldLabel('project-type');
    var projectTypeValue = selectValue('project-type');
    var goal = fieldValue('goal');
    var budgetValue = selectValue('budget');
    var timelineValue = selectValue('timeline');
    var budget = fieldLabel('budget');
    var timeline = fieldLabel('timeline');
    var message = fieldValue('message');
    var hasAttachment = !!(fileInput && fileInput.files && fileInput.files[0]);
    var attachmentNote = hasAttachment
      ? ('نام فایل انتخاب‌شده: ' + fileInput.files[0].name + ' — فایل را جداگانه به همین ایمیل پیوست کنید (mailto پیوست ندارد).')
      : 'بدون اشاره به فایل';

    track('contact_form_submit_intent', {
      project_type: projectTypeValue || 'unknown',
      has_company: !!company,
      has_goal: !!goal,
      has_budget: !!budgetValue,
      has_timeline: !!timelineValue,
      has_attachment: hasAttachment
    });
    track('contact_form_completed', {
      project_type: projectTypeValue || 'unknown',
      has_budget: !!budgetValue,
      has_timeline: !!timelineValue,
      location: 'contact-form'
    });

    var lines = [
      'نام: ' + name,
      'تلفن: ' + phone,
      'ایمیل: ' + email
    ];
    if (company) lines.push('شرکت / برند: ' + company);
    lines.push('نوع پروژه: ' + projectType);
    if (goal) lines.push('هدف پروژه: ' + goal);
    if (budgetValue) lines.push('بودجه تقریبی: ' + budget);
    if (timelineValue) lines.push('زمان‌بندی: ' + timeline);
    lines.push('', 'شرح:', message, '', attachmentNote);
    lines = lines.concat(attributionLines());

    var body = lines.join('\n');
    if (body.length > 1800) {
      body = body.slice(0, 1800) + '\n…(ادامه را در ایمیل کامل کنید)';
    }

    var mailto =
      'mailto:' +
      studioEmail +
      '?subject=' +
      encodeURIComponent('درخواست همکاری — ' + (name || 'استودیو هش')) +
      '&body=' +
      encodeURIComponent(body);

    var successEl = form.querySelector('.ct-form__success');
    if (!successEl) {
      successEl = document.createElement('div');
      successEl.className = 'ct-form__success';
      successEl.setAttribute('role', 'status');
      form.insertBefore(successEl, form.firstChild);
    }

    successEl.innerHTML =
      'پنجره ایمیل باز می‌شود تا پیام به <strong dir="ltr">' +
      studioEmail +
      '</strong> برسد. ارسال خودکار سروری نیست — اگر پنجره باز نشد، همین متن را دستی بفرستید.';

    track('contact_email_open', { method: 'mailto' });
    window.location.href = mailto;
  });

  if (details) {
    details.addEventListener('toggle', function () {
      if (details.open) {
        markFormStart();
        var first = details.querySelector('select, input, textarea');
        if (first) first.focus();
      }
    });
  }

  function solutionIntentConflicts(service, intent, urlService) {
    if (!intent || !SOLUTION_LABELS[intent]) return false;
    var primary = SOLUTION_PRIMARY[intent] || '';
    // Explicit URL service that disagrees with solution primary → ignore stale solution intent
    return !!(urlService && primary && urlService !== primary);
  }

  function buildContextHint(service, intent, lead, urlService) {
    if (intent && SOLUTION_LABELS[intent] && !solutionIntentConflicts(service, intent, urlService)) {
      return {
        text:
          'این گفتگو از مسیر <strong>' +
          SOLUTION_LABELS[intent] +
          '</strong> شروع شده است.',
        source: 'solution'
      };
    }
    if (intent && FIT_INTENT_LABELS[intent] && service && SERVICE_LABELS[service]) {
      return {
        text:
          'مسیر پیشنهادی شما: <strong>' +
          SERVICE_LABELS[service] +
          '</strong> <span class="ct-fit-hint__quiet">(' +
          FIT_INTENT_LABELS[intent] +
          ')</span>',
        source: 'service-fit'
      };
    }
    if (lead && lead.project_slug && service && SERVICE_LABELS[service]) {
      return {
        text:
          'این گفتگو از بررسی یک نمونه‌کار مرتبط شروع شده و احتمالاً <strong>' +
          SERVICE_LABELS[service] +
          '</strong> نقطه شروع مناسبی است.',
        source: 'project'
      };
    }
    if (lead && lead.article_slug && service && SERVICE_LABELS[service]) {
      return {
        text:
          'از مسیر مطالعه وارد شده‌اید؛ احتمالاً <strong>' +
          SERVICE_LABELS[service] +
          '</strong> نزدیک‌ترین خدمت به موضوع شماست.',
        source: 'article'
      };
    }
    if (service && SERVICE_LABELS[service]) {
      return {
        text:
          'به نظر می‌رسد درباره <strong>' +
          SERVICE_LABELS[service] +
          '</strong> با ما وارد گفتگو شده‌اید.',
        source: 'service'
      };
    }
    return null;
  }

  function applyMessagePrompt(intent, service, urlService) {
    var message = document.getElementById('message');
    var hint = document.getElementById('ct-message-hint');
    var promptIntent = intent;
    if (solutionIntentConflicts(service, intent, urlService)) {
      promptIntent = '';
    }
    var prompt =
      (promptIntent && MESSAGE_PROMPTS[promptIntent]) ||
      (service && MESSAGE_PROMPTS[service]) ||
      '';
    if (!prompt) return;
    if (message && !message.value) {
      message.setAttribute('placeholder', prompt);
    }
    if (hint) {
      hint.textContent = prompt;
    }
  }

  function applyFitContext() {
    var params = new URLSearchParams(window.location.search || '');
    var qService = (params.get('service') || '').trim();
    var qIntent = (params.get('intent') || '').trim();
    if (qService && !SERVICE_TO_FORM[qService]) qService = '';
    if (qIntent && !KNOWN_INTENTS[qIntent]) qIntent = '';

    var lead =
      analytics && analytics.ensureLeadContext
        ? analytics.ensureLeadContext()
        : analytics && analytics.getLeadContext
          ? analytics.getLeadContext()
          : null;

    var service = qService || (lead && (lead.recommended_service || lead.service_slug)) || '';
    var intent = qIntent || (lead && lead.intent) || '';
    if (service && !SERVICE_TO_FORM[service]) service = '';
    if (intent && !KNOWN_INTENTS[intent]) intent = '';

    // Only persist when URL carries context — avoid rewriting page_path to /contact.html
    if (qService || qIntent) {
      if (analytics && typeof analytics.rememberLeadContext === 'function') {
        analytics.rememberLeadContext({
          intent: intent || undefined,
          service_slug: service || undefined,
          recommended_service: service || undefined,
          project_slug: (lead && lead.project_slug) || undefined,
          article_slug: (lead && lead.article_slug) || undefined
        });
      }
    }

    if (service || intent) {
      track('lead_context_applied', {
        intent: intent || '',
        service_slug: service || '',
        has_project: !!(lead && lead.project_slug),
        has_article: !!(lead && lead.article_slug),
        location: 'contact'
      });
    }

    var select = document.getElementById('project-type');
    if (select) {
      select.addEventListener('change', function () {
        userChoseProjectType = true;
      });
      if (!userChoseProjectType && service && SERVICE_TO_FORM[service] && !select.value) {
        select.value = SERVICE_TO_FORM[service];
        track('contact_project_type_prefilled', {
          project_type: SERVICE_TO_FORM[service],
          service_slug: service,
          intent: intent || '',
          location: 'contact'
        });
      }
    }

    applyMessagePrompt(intent, service, qService);

    var hint = document.getElementById('ct-fit-hint');
    var summary = buildContextHint(service, intent, lead, qService);
    if (hint && summary) {
      hint.hidden = false;
      hint.innerHTML =
        '<p class="ct-fit-hint__text">' +
        summary.text +
        '</p>' +
        '<p class="ct-fit-hint__sub">اگر نوع پروژه یا مسیر فرق دارد، همین‌جا عوضش کنید — انتخاب شما اولویت دارد.</p>';
      track('contact_context_viewed', {
        source: summary.source,
        intent: intent || '',
        service_slug: service || '',
        location: 'contact'
      });
    }
  }

  applyFitContext();
})();
