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
      return false;
    }

    if (input.type === 'email' && value && !emailRegex.test(value)) {
      showError(input, 'ایمیل وارد شده معتبر نیست.');
      return false;
    }

    return true;
  }

  form.querySelectorAll('.ct-form__input, .ct-form__select, .ct-form__textarea').forEach(function (input) {
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
    fileName.textContent = file.name;
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
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

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fields = form.querySelectorAll('.ct-form__input, .ct-form__select, .ct-form__textarea');
    var isValid = true;

    fields.forEach(function (field) {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) return;

    var name = fieldValue('name');
    var phone = fieldValue('phone');
    var email = fieldValue('email');
    var projectType = fieldLabel('project-type');
    var budget = fieldLabel('budget');
    var timeline = fieldLabel('timeline');
    var message = fieldValue('message');
    var attachmentNote = (fileInput && fileInput.files && fileInput.files[0])
      ? ('فایل پیوست در مرورگر انتخاب شد: ' + fileInput.files[0].name + ' (لازم است جداگانه ایمیل شود)')
      : 'بدون پیوست';

    var body = [
      'نام: ' + name,
      'تلفن: ' + phone,
      'ایمیل: ' + email,
      'نوع پروژه: ' + projectType,
      'بودجه: ' + budget,
      'بازه زمانی: ' + timeline,
      '',
      'شرح:',
      message,
      '',
      attachmentNote
    ].join('\n');

    if (body.length > 1600) {
      body = body.slice(0, 1600) + '\n…(ادامه در صورت نیاز جداگانه ارسال شود)';
    }

    var mailto = 'mailto:' + studioEmail +
      '?subject=' + encodeURIComponent('درخواست همکاری — ' + (name || 'استودیو هش')) +
      '&body=' + encodeURIComponent(body);

    var successEl = form.querySelector('.ct-form__success');
    if (!successEl) {
      successEl = document.createElement('div');
      successEl.className = 'ct-form__success';
      successEl.setAttribute('role', 'status');
      form.insertBefore(successEl, form.firstChild);
    }

    successEl.innerHTML =
      'فرم آماده ارسال است. پنجره ایمیل باز می‌شود تا پیام به <strong dir="ltr">' +
      studioEmail +
      '</strong> برسد. اگر باز نشد، همین اطلاعات را مستقیم به همین آدرس بفرستید.';

    window.location.href = mailto;
  });
})();
