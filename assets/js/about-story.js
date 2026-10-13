/* Progressive enhancement for the IA-PER about story. */
(function () {
  'use strict';

  const about = document.querySelector('#about.about-story');
  if (!about) return;

  const tabs = Array.from(about.querySelectorAll('[data-about-tab]'));
  const panels = Array.from(about.querySelectorAll('[data-about-panel]'));
  const chapters = Array.from(about.querySelectorAll('[data-about-step]'));
  const screens = Array.from(about.querySelectorAll('[data-about-screen]'));
  const rail = about.querySelector('#aboutRail');
  const mobileQuery = window.matchMedia('(max-width: 959.98px)');
  const tabList = about.querySelector('.about-story__tabs');
  let activeIndex = 0;
  let observer;

  function setVisualState(index) {
    activeIndex = Math.max(0, Math.min(index, panels.length - 1));
    chapters.forEach((chapter, chapterIndex) => chapter.classList.toggle('is-active', chapterIndex === activeIndex));
    screens.forEach((screen, screenIndex) => screen.classList.toggle('is-active', screenIndex === activeIndex));
    if (rail) rail.style.setProperty('--about-progress', String(activeIndex / Math.max(1, panels.length - 1)));
  }

  function setMobileState(index) {
    setVisualState(index);
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === activeIndex;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel, panelIndex) => {
      panel.hidden = panelIndex !== activeIndex;
    });
  }

  function enableMobileTabs() {
    about.classList.add('is-enhanced');
    tabList.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[index].id);
    });
    panels.forEach((panel, index) => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs[index].id);
      panel.tabIndex = 0;
    });
    setMobileState(activeIndex);
  }

  function disableMobileTabs() {
    tabList.removeAttribute('role');
    tabs.forEach((tab) => {
      tab.removeAttribute('role');
      tab.removeAttribute('aria-controls');
      tab.removeAttribute('aria-selected');
      tab.removeAttribute('tabindex');
    });
    panels.forEach((panel) => {
      panel.hidden = false;
      panel.removeAttribute('role');
      panel.removeAttribute('aria-labelledby');
      panel.removeAttribute('tabindex');
    });
  }

  function observeDesktopChapters() {
    observer?.disconnect();
    if (!('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setVisualState(panels.indexOf(entry.target));
      });
    }, { rootMargin: '-42% 0px -52% 0px' });
    panels.forEach((panel) => observer.observe(panel));
  }

  function applyMode() {
    if (mobileQuery.matches) {
      observer?.disconnect();
      enableMobileTabs();
      return;
    }
    disableMobileTabs();
    observeDesktopChapters();
    setVisualState(activeIndex);
  }

  tabs.forEach((tab, tabIndex) => {
    tab.addEventListener('click', () => setMobileState(tabIndex));
    tab.addEventListener('keydown', (event) => {
      if (!mobileQuery.matches) return;
      const lastIndex = tabs.length - 1;
      let nextIndex = null;
      if (event.key === 'ArrowRight') nextIndex = (tabIndex + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (tabIndex - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = lastIndex;
      if (event.key === 'Enter' || event.key === ' ') nextIndex = tabIndex;
      if (nextIndex === null) return;
      event.preventDefault();
      setMobileState(nextIndex);
      tabs[nextIndex].focus();
    });
  });

  mobileQuery.addEventListener?.('change', applyMode);
  applyMode();
}());
