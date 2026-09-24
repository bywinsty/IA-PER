
(() => {
  'use strict';
  const root = document.querySelector('.theme-carousel');
  const track = root.querySelector('.card-track');
  const cards = [...root.querySelectorAll('.theme-card')];
  const dots = [...root.querySelectorAll('.carousel-dots button')];
  const previous = document.getElementById('previous-card');
  const next = document.getElementById('next-card');
  const status = root.querySelector('.carousel-status');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = 1, pending = null, timer = 0, frame = 0, gesture = null, suppressClick = false;
  const clamp = index => Math.max(0, Math.min(cards.length - 1, index));
  function paint(index, announce = false) {
    selected = clamp(index);
    cards.forEach((card, i) => {
      const active = i === selected;
      card.classList.toggle('card--active', active);
      card.classList.toggle('card--inactive', !active);
      card.querySelector('button').setAttribute('aria-pressed', String(active));
      card.querySelector('.card-action').firstChild.textContent = active ? 'Thématique sélectionnée ' : 'Sélectionner cette thématique ';
      dots[i].setAttribute('aria-pressed', String(active));
    });
    previous.disabled = selected === 0;
    next.disabled = selected === cards.length - 1;
    if (announce) status.textContent = `${String(selected + 1).padStart(2, '0')} / 03 — ${cards[selected].querySelector('h3').textContent}`;
  }
  function center(index, instant = false) {
    pending = clamp(index);
    paint(pending, true);
    const card = cards[pending];
    track.scrollTo({left:card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2, behavior:instant || motion.matches ? 'instant' : 'smooth'});
    clearTimeout(timer);
    timer = setTimeout(settle, 220);
  }
  function nearest() {
    const midpoint = track.scrollLeft + track.clientWidth / 2;
    return cards.reduce((best, card, i) => Math.abs(card.offsetLeft + card.offsetWidth / 2 - midpoint) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - midpoint) ? i : best, 0);
  }
  function settle() {
    if (gesture) return;
    pending = null;
    paint(nearest(), true);
  }
  cards.forEach((card,i) => card.querySelector('button').addEventListener('click', () => {if (!suppressClick) center(i)}));
  dots.forEach((dot,i) => dot.addEventListener('click', () => center(i)));
  previous.addEventListener('click', () => center(selected - 1));
  next.addEventListener('click', () => center(selected + 1));
  root.addEventListener('keydown', event => {
    const targets = {ArrowLeft:selected - 1,ArrowRight:selected + 1,Home:0,End:cards.length - 1};
    if (!(event.key in targets)) return;
    event.preventDefault();
    const index = clamp(targets[event.key]);
    center(index);
    cards[index].querySelector('button').focus({preventScroll:true});
  });
  track.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(() => {if (pending === null) paint(nearest());frame = 0});
    clearTimeout(timer);timer = setTimeout(settle, 160);
  }, {passive:true});
  track.addEventListener('scrollend', settle);
  track.addEventListener('wheel', () => {pending = null}, {passive:true});
  // Touch uses browser scrolling and CSS snapping, preserving vertical page scrolling and pinch zoom.
  // Mouse dragging is an enhancement; a drag must never trigger a subsequent card click.
  track.addEventListener('pointerdown', event => {
    pending = null;suppressClick = false;
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    gesture = {id:event.pointerId,x:event.clientX,scroll:track.scrollLeft,moved:false};
  });
  track.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const delta = event.clientX - gesture.x;
    if (!gesture.moved && Math.abs(delta) < 7) return;
    if (!gesture.moved) {gesture.moved = true;track.setPointerCapture(event.pointerId);track.classList.add('is-dragging')}
    event.preventDefault();track.scrollLeft = gesture.scroll - delta;
  });
  function release(event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const moved = gesture.moved;gesture = null;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    if (moved) {suppressClick = true;center(nearest());setTimeout(() => {suppressClick = false}, 0)}
  }
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  document.querySelectorAll('[data-select-card]').forEach(link => link.addEventListener('click', () => center(Number(link.dataset.selectCard))));
  document.querySelectorAll('.faq-question').forEach(button => button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    document.getElementById(button.getAttribute('aria-controls')).setAttribute('aria-hidden', String(!expanded));
    button.closest('.faq-item').classList.toggle('faq-active', expanded);
  }));
  new ResizeObserver(() => center(selected, true)).observe(track);
  center(selected, true);
})();
