/* ============================================================
   ST GABRIEL CATHOLIC PRIMARY SCHOOL
   script.js — Interactions & Behaviour
   All scripts load deferred — never block rendering
============================================================ */

/* ============================================================
   1. HEADER — add shadow on scroll
============================================================ */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }, { passive: true });
})();

/* ============================================================
   2. MOBILE NAV — toggle open/close
============================================================ */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', function () {
    var isOpen = mobileNav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    mobileNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  });

  // Close mobile nav when a link inside it is clicked
  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileNav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });
})();

/* ============================================================
   3. ACTIVITY TABS
============================================================ */
(function () {
  var tabButtons = document.querySelectorAll('.act-tab');
  var tabPanels  = document.querySelectorAll('.act-panel');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-target');

      // Deactivate all tabs
      tabButtons.forEach(function (b) {
        b.classList.remove('act-tab--active');
        b.setAttribute('aria-selected', 'false');
      });

      // Hide all panels
      tabPanels.forEach(function (p) {
        p.classList.remove('act-panel--active');
        p.hidden = true;
      });

      // Activate clicked tab
      btn.classList.add('act-tab--active');
      btn.setAttribute('aria-selected', 'true');

      // Show target panel
      var panel = document.getElementById(target);
      if (panel) {
        panel.classList.add('act-panel--active');
        panel.hidden = false;
      }
    });
  });
})();

/* ============================================================
   4. SCROLL REVEAL — fade elements in as they enter viewport
============================================================ */
(function () {
  var revealEls = document.querySelectorAll(
    '.ac-card, .admin-card, .trip-card, .fee-card, .meal-card, .club-card, .health-card, .transport-card, .about-pillars, .pillar, .farm-animal, .gallery-item'
  );

  revealEls.forEach(function (el) { el.classList.add('reveal'); });

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function (el) { observer.observe(el); });
})();

/* ============================================================
   5. NOTICE BAR — duplicate spans for seamless loop
============================================================ */
(function () {
  var track = document.querySelector('.notice-bar__track');
  if (!track) return;
  // Clone the children to create a seamless marquee loop
  var clone = track.cloneNode(true);
  track.parentNode.appendChild(clone);
})();

/* ============================================================
   6. ADMISSIONS FORM — validation & honeypot
============================================================ */
(function () {
  var form = document.getElementById('admissions-form');
  if (!form) return;

  var submitBtn   = document.getElementById('submit-btn');
  var successMsg  = document.getElementById('form-success');

  /* Sanitize input — strip HTML tags to prevent XSS */
  function sanitize(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* Validate a single field */
  function validateField(id, errorId, condition, message) {
    var field = document.getElementById(id);
    var error = document.getElementById(errorId);
    if (!field || !error) return true;
    var val = sanitize(field.value.trim());
    if (!condition(val)) {
      field.classList.add('error');
      error.textContent = message;
      return false;
    }
    field.classList.remove('error');
    error.textContent = '';
    return true;
  }

  /* Phone: basic Kenyan format check */
  function validPhone(val) {
    return val.length >= 9 && /^[\d\s\+\-()]+$/.test(val);
  }

  /* Email: simple check */
  function validEmail(val) {
    return val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  /* Rate limiting — max 3 submissions per session */
  var submitCount = 0;
  var MAX_SUBMITS = 3;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Honeypot check */
    var hp = document.getElementById('hp-field');
    if (hp && hp.value !== '') return; // bot detected, silently reject

    /* Rate limit */
    if (submitCount >= MAX_SUBMITS) {
      if (successMsg) {
        successMsg.textContent = 'Too many submissions. Please call us directly.';
        successMsg.hidden = false;
      }
      return;
    }

    /* Validate required fields */
    var valid = true;
    valid = validateField('parent-name',  'parent-name-error',  function(v){ return v.length >= 2; },  'Please enter your full name.') && valid;
    valid = validateField('phone',        'phone-error',         validPhone,                            'Please enter a valid phone number.') && valid;
    valid = validateField('email',        'email-error',         validEmail,                            'Please enter a valid email address.') && valid;
    valid = validateField('learner-name', 'learner-name-error', function(v){ return v.length >= 2; },  'Please enter the learner\'s name.') && valid;
    valid = validateField('grade',        'grade-error',         function(v){ return v !== ''; },       'Please select a grade.') && valid;
    valid = validateField('school-type',  'school-type-error',   function(v){ return v !== ''; },       'Please select day school or boarding.') && valid;

    if (!valid) return;

    /* Simulate successful submission */
    submitCount++;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    setTimeout(function () {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Send Enquiry';
      if (successMsg) { successMsg.hidden = false; }
    }, 900);
  });

  /* Real-time error clearing */
  form.querySelectorAll('.form-input').forEach(function (input) {
    input.addEventListener('input', function () {
      input.classList.remove('error');
      var errorEl = document.getElementById(input.id + '-error');
      if (errorEl) errorEl.textContent = '';
    });
  });
})();