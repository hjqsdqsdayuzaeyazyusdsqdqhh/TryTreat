/* =============================================
   TryTreat - Phase 1: Foundation
   Vanilla JavaScript
   ============================================= */

(function () {
  'use strict';

  /* ---------- DOM Ready ---------- */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initMobileMenu();
    initSearchModal();
    initDarkMode();
    initFAQ();
    initNewsletter();
    initScrollAnimations();
  }

  /* ---------- Mobile Menu ---------- */
  function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
      menu.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    menu.querySelectorAll('.mobile-menu__link').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Search Modal ---------- */
  function initSearchModal() {
    var modal = document.getElementById('search-modal');
    var toggleBtn = document.getElementById('search-toggle');
    var closeBtn = document.getElementById('search-close');
    var backdrop = document.getElementById('search-backdrop');
    var input = document.getElementById('search-input');
    if (!modal || !toggleBtn) return;

    function openSearch() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { input && input.focus(); }, 100);
    }

    function closeSearch() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openSearch);
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    if (backdrop) backdrop.addEventListener('click', closeSearch);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeSearch();
        toggleBtn.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (modal.classList.contains('is-open')) {
          closeSearch();
        } else {
          openSearch();
        }
      }
    });
  }

  /* ---------- Dark Mode ---------- */
  function initDarkMode() {
    var toggle = document.getElementById('dark-mode-toggle');
    var sunIcon = toggle && toggle.querySelector('.icon-sun');
    var moonIcon = toggle && toggle.querySelector('.icon-moon');
    if (!toggle) return;

    var stored = localStorage.getItem('trytreat-theme');
    if (stored === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    }

    toggle.addEventListener('click', function () {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('trytreat-theme', 'light');
        if (sunIcon) sunIcon.style.display = '';
        if (moonIcon) moonIcon.style.display = 'none';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('trytreat-theme', 'dark');
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
      }
    });
  }

  /* ---------- FAQ Accordion ---------- */
  function initFAQ() {
    var questions = document.querySelectorAll('.faq__question');
    questions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq__item');
        var answer = item.querySelector('.faq__answer');
        var isOpen = item.classList.contains('is-open');

        item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', !isOpen);
        answer.setAttribute('aria-hidden', isOpen);
      });
    });
  }

  /* ---------- Newsletter ---------- */
  function initNewsletter() {
    var form = document.getElementById('newsletter-form');
    var input = document.getElementById('newsletter-email');
    var status = document.getElementById('newsletter-status');
    if (!form || !input || !status) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = input.value.trim();

      if (!email || !isValidEmail(email)) {
        status.textContent = 'Please enter a valid email address.';
        status.className = 'newsletter__status newsletter__status--error';
        return;
      }

      status.textContent = 'Thank you for subscribing!';
      status.className = 'newsletter__status newsletter__status--success';
      input.value = '';
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ---------- Scroll Animations ---------- */
  function initScrollAnimations() {
    var elements = document.querySelectorAll(
      '.category-card, .offer-card, .guide-card, .hero__stat, .faq__item'
    );

    if (!elements.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      elements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      elements.forEach(function (el) {
        el.classList.add('animate-in');
      });
    }
  }

})();
