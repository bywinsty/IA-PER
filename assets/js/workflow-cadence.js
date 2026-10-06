/* Interactive workflow story: scroll selects steps on desktop, tabs select them on mobile. */
(function () {
  'use strict';

  const workflow = document.querySelector('#workflow');
  if (!workflow) return;

  const steps = Array.from(workflow.querySelectorAll('.workflow-step'));
  const screens = Array.from(workflow.querySelectorAll('.workflow-screen'));
  const tabs = Array.from(workflow.querySelectorAll('[role="tab"]'));
  const rail = workflow.querySelector('#workflowRail');
  const desktopQuery = window.matchMedia('(min-width: 960px)');

  function setStep(index) {
    const safeIndex = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      const active = stepIndex === safeIndex;
      step.classList.toggle('is-active', active);
      step.setAttribute('aria-hidden', String(!active && !desktopQuery.matches));
    });
    screens.forEach((screen, screenIndex) => screen.classList.toggle('is-active', screenIndex === safeIndex));
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === safeIndex;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    if (rail) rail.style.setProperty('--workflow-progress', String(safeIndex / Math.max(1, steps.length - 1)));
  }

  tabs.forEach((tab, tabIndex) => {
    tab.addEventListener('click', () => setStep(tabIndex));
    tab.addEventListener('keydown', (event) => {
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
      if (!direction) return;
      event.preventDefault();
      const nextIndex = (tabIndex + direction + tabs.length) % tabs.length;
      setStep(nextIndex);
      tabs[nextIndex].focus();
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!desktopQuery.matches) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) setStep(steps.indexOf(entry.target));
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    steps.forEach((step) => observer.observe(step));
  }

  desktopQuery.addEventListener?.('change', () => setStep(steps.findIndex((step) => step.classList.contains('is-active')) || 0));
  setStep(0);
}());
