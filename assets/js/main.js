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
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

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
    const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    window.scrollTo({
      top: section.getBoundingClientRect().top + window.scrollY - margin,
      behavior: 'instant'
    });
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
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
      scheduleAosRefresh();
    });
  });

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
      initIsotope.on('arrangeComplete', scheduleAosRefresh);
      scheduleAosRefresh();
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        if (!initIsotope) return;
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
      }, false);
    });

  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = hashTarget(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  onLoaded(navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  /**
   * Poll local storage
   */
  const pollStorageKey = 'poll';

  function getPollState() {
    const defaultState = { positif: 0, negatif: 0, neutre: 0 };

    try {
      const saved = localStorage.getItem(pollStorageKey);
      if (!saved) {
        localStorage.setItem(pollStorageKey, JSON.stringify(defaultState));
        return { ...defaultState };
      }

      const parsed = JSON.parse(saved);
      return {
        positif: Number(parsed.positif) || 0,
        negatif: Number(parsed.negatif) || 0,
        neutre: Number(parsed.neutre) || 0
      };
    } catch (error) {
      console.warn('Impossible de lire le sondage localStorage.', error);
      return { ...defaultState };
    }
  }

  function vote(choice) {
    const poll = getPollState();
    if (!poll[choice] && poll[choice] !== 0) return;

    const hasVoted = localStorage.getItem('poll-voted') === 'true';
    if (hasVoted) {
      showResults();
      return;
    }

    poll[choice] += 1;
    localStorage.setItem(pollStorageKey, JSON.stringify(poll));
    localStorage.setItem('poll-voted', 'true');
    localStorage.setItem('poll-choice', choice);
    showResults();
  }

  function showResults() {
    const results = document.getElementById('results');
    if (!results) return;

    const poll = getPollState();
    const total = poll.positif + poll.negatif + poll.neutre;
    const pPos = total ? Math.round((poll.positif / total) * 100) : 0;
    const pNeg = total ? Math.round((poll.negatif / total) * 100) : 0;
    const pNeu = total ? Math.round((poll.neutre / total) * 100) : 0;

    const positifBar = document.getElementById('positif-bar');
    const negatifBar = document.getElementById('negatif-bar');
    const neutreBar = document.getElementById('neutre-bar');
    const positifVal = document.getElementById('positif-val');
    const negatifVal = document.getElementById('negatif-val');
    const neutreVal = document.getElementById('neutre-val');

    if (positifBar) positifBar.style.width = pPos + '%';
    if (negatifBar) negatifBar.style.width = pNeg + '%';
    if (neutreBar) neutreBar.style.width = pNeu + '%';

    if (positifVal) positifVal.innerText = pPos + '%';
    if (negatifVal) negatifVal.innerText = pNeg + '%';
    if (neutreVal) neutreVal.innerText = pNeu + '%';

    const hasVoted = localStorage.getItem('poll-voted') === 'true';
    results.style.display = hasVoted ? 'block' : 'none';

    const voteMessage = document.getElementById('poll-vote-message');
    if (voteMessage) {
      voteMessage.style.display = hasVoted ? 'block' : 'none';
      voteMessage.textContent = 'Votre vote a déjà été enregistré.';
    }

    const buttons = document.querySelectorAll('[data-vote]');
    buttons.forEach(button => {
      const disabled = hasVoted;
      button.disabled = disabled;
      button.setAttribute('aria-disabled', String(disabled));
      if (disabled) {
        button.classList.add('disabled');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('[data-vote]');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        vote(button.dataset.vote);
      });
    });

    showResults();
  });

})();