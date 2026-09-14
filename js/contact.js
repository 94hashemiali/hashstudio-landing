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
    if (lead.page_path && /^\/(project|service|article)\//.test(lead.page_path)) {
      return lead.page_path;
    }
    if (lead.project_slug) return '/project/' + lead.project_slug + '/';
    if (lead.service_slug) return '/service/' + lead.service_slug + '/';
    if (lead.article_slug) return '/article/' + lead.article_slug + '/';
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
      has_budget: !!(budget && budget.indexOf('انتخاب') === -1),
      has_timeline: !!(timeline && timeline.indexOf('انتخاب') === -1),
      has_attachment: hasAttachment
    });

    var lines = [
      'نام: ' + name,
      'تلفن: ' + phone,
      'ایمیل: ' + email
    ];
    if (company) lines.push('شرکت / برند: ' + company);
    lines.push('نوع پروژه: ' + projectType);
    if (goal) lines.push('هدف پروژه: ' + goal);
    if (budget && budget.indexOf('انتخاب') === -1) lines.push('بودجه تقریبی: ' + budget);
    if (timeline && timeline.indexOf('انتخاب') === -1) lines.push('زمان‌بندی: ' + timeline);
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
})();
