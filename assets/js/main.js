/**
* Template Name: Arsha
* Template URL: https://bootstrapmade.com/arsha-free-bootstrap-html-template-corporate/
* Updated: Feb 22 2025 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  /**
   * Preserve links shared before the thematic content moved to its own page.
   * The redirect is intentionally limited to the homepage so normal hashes on
   * other pages are never rewritten.
   */
  const legacyIndexAnchors = {
    '#services': 'thematiques.html#themes',
    '#faq-2': 'thematiques.html#faq'
  };
  if (document.body?.classList.contains('index-page')) {
    const legacyTarget = legacyIndexAnchors[window.location.hash];
    if (legacyTarget) window.location.replace(legacyTarget);
  }

  function onLoaded(callback) {
    if (document.readyState === 'complete') queueMicrotask(callback);
    else window.addEventListener('load', callback, { once: true });
  }

  function hashTarget(hash) {
    if (!hash || hash === '#') return null;
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return null;
    }
  }

  /**
   * Keep fixed-header compensation in sync with the rendered header.
   * The mobile navigation can wrap to additional lines, so a media-query-only
   * scroll offset is not reliable at narrow widths.
   */
  function syncHeaderMetrics() {
    const header = document.querySelector('#header');
    if (!header) return;

    const height = Math.ceil(header.getBoundingClientRect().height);
    if (!height) return;

    root.style.setProperty('--header-height', `${height}px`);
    root.style.setProperty('--header-scroll-padding', `${height}px`);
  }

  function initHeaderMetrics() {
    const header = document.querySelector('#header');
    if (!header) return;

    syncHeaderMetrics();

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(syncHeaderMetrics);
      observer.observe(header);
    }

    window.addEventListener('resize', syncHeaderMetrics, { passive: true });
    document.fonts?.ready.then(syncHeaderMetrics);
    onLoaded(syncHeaderMetrics);
    document.addEventListener('load', event => {
      if (event.target instanceof HTMLImageElement) syncHeaderMetrics();
    }, true);
  }

  initHeaderMetrics();

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader || (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top'))) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  onLoaded(toggleScrolled);

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    const dismissPreloader = () => {
      preloader.remove();
      root.classList.remove('preloader-active');
    };
    onLoaded(dismissPreloader);
    // A remote resource must not leave an overlay covering otherwise readable content.
    const preloaderTimeout = setTimeout(dismissPreloader, 8000);
    onLoaded(() => clearTimeout(preloaderTimeout));
    if (document.readyState !== 'complete') root.classList.add('preloader-active');
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: motionPreference.matches ? 'instant' : 'smooth'
    });
  });

  onLoaded(toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  let aosStarted = false;
  let pageStarted = false;
  let aosFailed = false;
  let refreshFrame = 0;

  function revealOnFailure(error) {
    aosFailed = true;
    root.classList.remove('aos-ready');
    console.warn('Scroll animations unavailable; content remains visible.', error);
  }

  function scheduleAosRefresh() {
    if (!aosStarted || aosFailed || refreshFrame) return;
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0;
      try { window.AOS.refresh(); }
      catch (error) { revealOnFailure(error); }
    });
  }

  function correctInitialAnchor() {
    // History restores the user's position, which may differ from the URL's hash.
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation?.type === 'back_forward') return;
    const section = hashTarget(window.location.hash);
    if (!section) return;
    syncHeaderMetrics();
    const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    window.scrollTo({
      top: section.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'instant'
    });
  }

  /**
   * Highlight only the homepage section currently crossing the reading line.
   * Accueil remains the page-level link and keeps its own default styling.
   */
  function initPageNavigation() {
    const navigation = document.querySelector('.header-section-links');
    if (!navigation) return;

    const entries = Array.from(navigation.querySelectorAll('a[href^="#"]'))
      .map(link => ({ link, section: hashTarget(link.getAttribute('href')) }))
      .filter(entry => entry.section);
    if (!entries.length) return;

    let activeSection = null;
    let framePending = false;
    let pendingHashSection = null;
    let pendingHashTimer = 0;

    function setActiveSection(section) {
      if (activeSection === section) return;
      activeSection = section;
      entries.forEach(({ link, section: target }) => {
        const isActive = target === section;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    function clearPendingHash() {
      pendingHashSection = null;
      if (pendingHashTimer) {
        clearTimeout(pendingHashTimer);
        pendingHashTimer = 0;
      }
    }

    function finishHashNavigation() {
      if (!pendingHashSection) return;
      clearPendingHash();
      updateActiveSection();
    }

    function trackHashNavigation(section) {
      clearPendingHash();
      pendingHashSection = section;
      if (!section) return;

      // Keep the hash target active while smooth scrolling/history restoration
      // is still moving the viewport. Older browsers use the timer fallback.
      pendingHashTimer = window.setTimeout(
        finishHashNavigation,
        motionPreference.matches ? 0 : 1500
      );
    }

    function updateActiveSection() {
      if (pendingHashSection) {
        setActiveSection(pendingHashSection);
        return;
      }
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(() => {
        framePending = false;
        const header = document.querySelector('#header');
        const readingLine = (header?.getBoundingClientRect().bottom || 0) + 24;
        const activeEntry = entries
          .map(entry => ({ ...entry, bounds: entry.section.getBoundingClientRect() }))
          .find(({ bounds }) => bounds.top <= readingLine && bounds.bottom > readingLine);
        setActiveSection(activeEntry?.section || null);
      });
    }

    function activateFromHash() {
      const target = hashTarget(window.location.hash);
      const entry = entries.find(({ section }) => section === target);
      trackHashNavigation(entry?.section || null);
      if (entry) setActiveSection(entry.section);
      updateActiveSection();
    }

    document.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    window.addEventListener('hashchange', activateFromHash);
    window.addEventListener('pageshow', activateFromHash);
    if ('onscrollend' in document) {
      document.addEventListener('scrollend', finishHashNavigation, { passive: true });
    }
    activateFromHash();
  }

  function startAnimations() {
    if (pageStarted) return;
    pageStarted = true;
    initSwiper();
    // Let slider load callbacks finish before the single initial anchor correction.
    requestAnimationFrame(() => {
      correctInitialAnchor();
      if (!window.AOS) return;
      try {
        window.AOS.init({ duration: 600, easing: 'ease-in-out', once: true, offset: 120 });
        aosStarted = true;
        // Enable hidden states only after AOS has measured and revealed the initial view.
        root.classList.add('aos-ready');
        if ('ResizeObserver' in window) {
          const observer = new ResizeObserver(scheduleAosRefresh);
          document.querySelectorAll('main > section, main > .page-title, main .container, main .swiper')
            .forEach(element => observer.observe(element));
        }
        scheduleAosRefresh();
      } catch (error) { revealOnFailure(error); }
    });
  }

  // Register before optional widgets, so a widget failure cannot cancel AOS startup.
  onLoaded(initPageNavigation);
  onLoaded(startAnimations);
  window.addEventListener('pageshow', scheduleAosRefresh);
  window.addEventListener('hashchange', scheduleAosRefresh);
  motionPreference.addEventListener('change', scheduleAosRefresh);
  document.fonts?.ready.then(scheduleAosRefresh);

  if ('onscrollend' in document) {
    document.addEventListener('scrollend', scheduleAosRefresh);
  } else {
    let scrollTimer;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(scheduleAosRefresh, 150);
    }, { passive: true });
  }
  document.addEventListener('transitionend', event => {
    if (event.target.matches('.faq-content')) scheduleAosRefresh();
  });
  document.addEventListener('load', event => {
    if (event.target instanceof HTMLImageElement) scheduleAosRefresh();
  }, true);
  document.addEventListener('focusin', event => {
    // Include animated ancestors: a visible input can still have a transparent parent.
    for (let element = event.target; element instanceof Element; element = element.parentElement) {
      if (element.hasAttribute('data-aos')) element.classList.add('aos-focus-visible');
    }
  });

  /**
   * Initiate glightbox
   */
  const glightbox = typeof GLightbox === 'function' && GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      try {
        const config = JSON.parse(
          swiperElement.querySelector(".swiper-config").innerHTML.trim()
        );

        if (swiperElement.classList.contains("swiper-tab")) {
          initSwiperWithCustomPagination(swiperElement, config);
        } else {
          const swiper = new Swiper(swiperElement, config);
          ['resize', 'breakpoint', 'update', 'slideChangeTransitionEnd'].forEach(event => {
            swiper.on(event, scheduleAosRefresh);
          });
        }
      } catch (error) {
        console.warn('Slider unavailable; continuing page initialization.', error);
      }
    });
  }

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item .faq-question').forEach((faqQuestion) => {
    const faqItem = faqQuestion.closest('.faq-item');
    const faqPanel = document.getElementById(faqQuestion.getAttribute('aria-controls'));

    const syncFaqState = () => {
      const isExpanded = faqItem.classList.contains('faq-active');
      faqQuestion.setAttribute('aria-expanded', String(isExpanded));
      faqPanel?.setAttribute('aria-hidden', String(!isExpanded));
    };

    syncFaqState();
    faqQuestion.addEventListener('click', () => {
      faqItem.classList.toggle('faq-active');
      syncFaqState();
      scheduleAosRefresh();
    });
  });

})();