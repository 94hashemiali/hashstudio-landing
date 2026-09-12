(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showError(input, message) {
    input.classList.add('is-error');
    let errorEl = input.parentElement.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'form-error';
      errorEl.setAttribute('role', 'alert');
      input.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  function clearError(input) {
    input.classList.remove('is-error');
    const errorEl = input.parentElement.querySelector('.form-error');
    if (errorEl) errorEl.remove();
  }

  function validateField(input) {
    const value = input.value.trim();
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

  form.querySelectorAll('.form-input, .form-textarea').forEach(function (input) {
    input.addEventListener('blur', function () {
      validateField(input);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const fields = form.querySelectorAll('.form-input, .form-textarea');
    let isValid = true;

    fields.forEach(function (field) {
      if (!validateField(field)) isValid = false;
    });

    if (!isValid) return;

    let successEl = form.querySelector('.form-success');
    if (!successEl) {
      successEl = document.createElement('div');
      successEl.className = 'form-success';
      successEl.setAttribute('role', 'status');
      form.insertBefore(successEl, form.firstChild);
    }

    successEl.textContent = 'پیام شما با موفقیت ارسال شد. به زودی با شما تماس می‌گیریم.';
    form.reset();
    fields.forEach(clearError);
  });
})();
