(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var upload = document.getElementById('ct-upload');
  var fileInput = document.getElementById('attachment');
  var fileName = document.getElementById('ct-upload-name');
  var MAX_BYTES = 10 * 1024 * 1024;

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

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var fields = form.querySelectorAll('.ct-form__input, .ct-form__select, .ct-form__textarea');
    var isValid = true;

    fields.forEach(function (field) {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) return;

    var successEl = form.querySelector('.ct-form__success');
    if (!successEl) {
      successEl = document.createElement('div');
      successEl.className = 'ct-form__success';
      successEl.setAttribute('role', 'status');
      form.insertBefore(successEl, form.firstChild);
    }

    successEl.textContent = 'درخواست شما ثبت شد. معمولاً ظرف ۲۴ تا ۴۸ ساعت با شما تماس می‌گیریم.';
    form.reset();
    setFile(null);
    fields.forEach(clearError);
  });
})();
