/** Shared runtime behaviour for generated site headers. */
(function() {
  'use strict';

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  function onLoaded(callback) {
    if (document.readyState === 'complete') queueMicrotask(callback);
    else window.addEventListener('load', callback, { once: true });
  }

  const legacyIndexAnchors = {
    '#services': 'pages/thematiques.html#themes',
    '#faq-2': 'pages/thematiques.html#faq'
  };
  if (document.body?.classList.contains('index-page')) {
    const legacyTarget = legacyIndexAnchors[window.location.hash];
    if (legacyTarget) window.location.replace(legacyTarget);
  }

  function hashTarget(hash) {
    if (!hash || hash === '#') return null;
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return null;
    }
  }

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

  function toggleScrolled() {
    const body = document.body;
    const header = document.querySelector('#header');
    if (!header || (!header.classList.contains('scroll-up-sticky') && !header.classList.contains('sticky-top') && !header.classList.contains('fixed-top'))) return;
    body.classList.toggle('scrolled', window.scrollY > 40);
  }

  function correctInitialAnchor() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation?.type === 'back_forward') return;
    const section = hashTarget(window.location.hash);
    if (!section) return;

    syncHeaderMetrics();
    const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    window.scrollTo({
      top: section.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'instant'
    });
  }

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
        const measuredEntries = entries.map(entry => ({
          ...entry,
          bounds: entry.section.getBoundingClientRect()
        }));
        const activeEntry = measuredEntries.find(({ bounds }) => bounds.top <= readingLine && bounds.bottom > readingLine);
        setActiveSection(activeEntry?.section || null);
      });
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
      pendingHashTimer = window.setTimeout(finishHashNavigation, motionPreference.matches ? 0 : 1500);
    }

    function activateFromHash() {
      const target = hashTarget(window.location.hash);
      const entry = entries.find(({ section }) => section === target);
      trackHashNavigation(entry?.section || null);
      if (entry) setActiveSection(entry.section);
      else if (!window.location.hash && window.scrollY <= 1) setActiveSection(null);
      updateActiveSection();
    }

    document.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);
    window.addEventListener('hashchange', activateFromHash);
    window.addEventListener('pageshow', activateFromHash);
    if ('onscrollend' in document) document.addEventListener('scrollend', finishHashNavigation, { passive: true });
    activateFromHash();
  }

  initHeaderMetrics();
  document.addEventListener('scroll', toggleScrolled, { passive: true });
  onLoaded(toggleScrolled);
  // This script is loaded at the end of the document, so the header and all
  // section targets already exist. Initialize now so the first section can be
  // highlighted before the window waits for images and other resources.
  initPageNavigation();
  onLoaded(() => requestAnimationFrame(() => requestAnimationFrame(correctInitialAnchor)));
})();
