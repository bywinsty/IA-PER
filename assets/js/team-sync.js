/* Keep the hero project credit connected to the people listed in the team section. */
(function () {
  'use strict';

  const team = document.querySelector('#team');
  const faces = document.querySelector('#hero .hero-cadence__faces');
  if (!team || !faces) return;

  function isDisplayed(card) {
    for (let element = card; element; element = element.parentElement) {
      if (element.hidden || window.getComputedStyle(element).display === 'none') return false;
      if (element === team) break;
    }
    return true;
  }

  function renderFaces() {
    const fragment = document.createDocumentFragment();
    const members = Array.from(team.querySelectorAll('.team-member')).filter(isDisplayed);

    members.forEach((member) => {
      const source = member.querySelector('.pic img');
      const src = source?.getAttribute('src');
      if (!src) return;

      const face = document.createElement('span');
      face.className = 'hero-cadence__face';

      const image = document.createElement('img');
      ['src', 'srcset', 'sizes', 'width', 'height'].forEach((attribute) => {
        const value = source.getAttribute(attribute);
        if (value) image.setAttribute(attribute, value);
      });
      image.alt = '';
      image.loading = 'lazy';

      face.append(image);
      fragment.append(face);
    });

    faces.replaceChildren(fragment);
  }

  let renderScheduled = false;
  function scheduleRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    window.requestAnimationFrame(() => {
      renderScheduled = false;
      renderFaces();
    });
  }

  renderFaces();

  const observer = new MutationObserver(scheduleRender);
  observer.observe(team, {
    attributes: true,
    attributeFilter: ['class', 'hidden', 'src', 'srcset', 'style'],
    childList: true,
    subtree: true,
  });

  window.addEventListener('resize', scheduleRender, { passive: true });
})();
