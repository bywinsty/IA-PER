(() => {
  'use strict';

  const carousel = document.querySelector('.thematic-carousel');
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll('.orbit-card'));
  const rotationButton = carousel.querySelector('.carousel-rotation');
  const previousButton = carousel.querySelector('.carousel-previous');
  const nextButton = carousel.querySelector('.carousel-next');
  const status = carousel.querySelector('#carousel-status');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = Number.parseInt(carousel.dataset.rotationInterval, 10) || 5200;

  if (!slides.length || !rotationButton || !previousButton || !nextButton || !status) return;

  let activeIndex = Math.max(0, slides.findIndex(slide => slide.getAttribute('aria-current') === 'true'));
  let isRotating = !motionPreference.matches;
  let timer = null;
  let rotationSteps = 0;
  let unlimitedRotation = false;

  function wrap(index) {
    return (index + slides.length) % slides.length;
  }

  function updateRotationControl() {
    const label = isRotating
      ? 'Mettre en pause la rotation automatique'
      : 'Reprendre la rotation automatique';
    const visibleLabel = isRotating ? 'Pause' : 'Reprendre';

    rotationButton.setAttribute('aria-label', label);
    rotationButton.querySelector('span').textContent = visibleLabel;
    rotationButton.querySelector('i').className = isRotating
      ? 'bi bi-pause-fill'
      : 'bi bi-play-fill';
    status.setAttribute('aria-live', isRotating ? 'off' : 'polite');
  }

  function render(announce = false) {
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.classList.toggle('is-prev', index === wrap(activeIndex - 1));
      slide.classList.toggle('is-next', index === wrap(activeIndex + 1));
      slide.setAttribute('aria-current', String(isActive));
      slide.setAttribute('aria-label', `${slide.querySelector('h3').textContent}, ${index + 1} sur ${slides.length}`);
    });

    const activeTitle = slides[activeIndex].querySelector('h3').textContent;
    if (announce) status.textContent = `${activeTitle}, thème ${activeIndex + 1} sur ${slides.length}`;
  }

  function stopRotation() {
    window.clearInterval(timer);
    timer = null;
    isRotating = false;
    updateRotationControl();
  }

  function startRotation(unlimited = false) {
    if ((motionPreference.matches && !unlimited) || isRotating) return;
    isRotating = true;
    unlimitedRotation = unlimited;
    rotationSteps = 0;
    updateRotationControl();
    timer = window.setInterval(advanceRotation, interval);
  }

  function advanceRotation() {
    showSlide(activeIndex + 1, false);
    rotationSteps += 1;

    if (!unlimitedRotation && rotationSteps >= slides.length) stopRotation();
  }

  function showSlide(index, isManual = true) {
    if (isManual) stopRotation();
    activeIndex = wrap(index);
    render(true);
  }

  slides.forEach((slide, index) => {
    slide.addEventListener('click', event => {
      const link = event.target.closest('.orbit-card-link');
      if (slide.getAttribute('aria-current') === 'true') return;
      if (link) event.preventDefault();
      slide.classList.add('suppress-link-hover');
      showSlide(index);
    });

    slide.addEventListener('keydown', event => {
      if (event.target !== slide || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      showSlide(index);
    });
  });

  document.addEventListener('pointermove', event => {
    const pointedElement = document.elementFromPoint(event.clientX, event.clientY);
    slides.forEach(slide => {
      if (slide.classList.contains('suppress-link-hover') && !slide.contains(pointedElement)) {
        slide.classList.remove('suppress-link-hover');
      }
    });
  });

  rotationButton.addEventListener('click', () => {
    if (isRotating) stopRotation();
    else startRotation(true);
  });

  previousButton.addEventListener('click', () => showSlide(activeIndex - 1));
  nextButton.addEventListener('click', () => showSlide(activeIndex + 1));

  carousel.addEventListener('focusin', stopRotation);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopRotation();
  });
  motionPreference.addEventListener('change', event => {
    if (event.matches) stopRotation();
  });

  render();
  updateRotationControl();
  carousel.classList.add('is-ready');

  if (isRotating) {
    timer = window.setInterval(advanceRotation, interval);
  }
})();
