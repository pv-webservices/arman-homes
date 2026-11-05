import { filterProperties } from '../data/properties.mjs';

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Loader: dismiss as soon as the page is ready (CSS also auto-hides it as a fallback).
const dismissLoader = () => { if (root.classList.contains('loading')) { root.classList.replace('loading', 'loaded'); } };
if (document.readyState === 'complete') dismissLoader(); else addEventListener('load', dismissLoader, { once: true });
setTimeout(dismissLoader, 900);

// Header: transparent over dark heroes, solid after scrolling or on light pages.
const header = document.querySelector<HTMLElement>('[data-header]');
const alwaysSolid = document.body.dataset.header === 'solid';
const updateHeader = () => header?.classList.toggle('solid', alwaysSolid || scrollY > 40);
addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

// Mobile menu
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const menu = document.querySelector<HTMLElement>('#mobile-menu');
const menuLabel = toggle?.querySelector('[data-menu-label]');
function setMenu(open: boolean, restoreFocus = false) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  menuLabel?.replaceChildren(open ? 'Close menu' : 'Open menu');
  root.classList.toggle('menu-open', open);
  menu.inert = !open;
  if (open) menu.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
  else if (restoreFocus) toggle.focus();
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false, true); });
matchMedia('(min-width: 1025px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

// One-time scroll reveals
const revealables = document.querySelectorAll('[data-reveal]');
if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('reveal-in'); observer.unobserve(entry.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealables.forEach((el) => observer.observe(el));
} else {
  revealables.forEach((el) => el.classList.add('reveal-in'));
}

const params = new URLSearchParams(location.search);
document.querySelectorAll<HTMLFormElement>('.property-search.expanded').forEach(form => {
  const filters: Record<string, string> = {};
  form.querySelectorAll<HTMLSelectElement>('select').forEach(select => {
    const value = params.get(select.name);
    if (value !== null && [...select.options].some(option => option.value === value)) select.value = value;
    filters[select.name] = select.value;
  });
  const cards = [...document.querySelectorAll<HTMLElement>('[data-property]')];
  const records = cards.map(card => ({ ...card.dataset, price: Number(card.dataset.price), bedrooms: Number(card.dataset.bedrooms), element: card }));
  const matches = filterProperties(records, filters);
  cards.forEach(card => card.hidden = !matches.some(record => record.element === card));
  document.querySelector('[data-result-count]')?.replaceChildren(String(matches.length));
  const empty = document.querySelector<HTMLElement>('[data-empty]');
  if (empty) empty.hidden = matches.length > 0;
  const summary = document.querySelector<HTMLElement>('[data-filter-summary]');
  if (summary) {
    const active = [...form.querySelectorAll<HTMLSelectElement>('select')].filter(s => s.value).map(s => s.selectedOptions[0].textContent);
    summary.textContent = active.length ? `Your search: ${active.join(' · ')}. Budget applies to the total sale price or monthly rent.` : 'Choose your preferences to explore published properties. Rental budgets are per month.';
  }
});

import './enquiry';

document.querySelectorAll<HTMLElement>('[data-gallery]').forEach(gallery => {
  const main = gallery.querySelector<HTMLImageElement>('[data-gallery-main] img')!;
  const dialog = gallery.querySelector<HTMLDialogElement>('dialog')!;
  const enlarged = dialog.querySelector<HTMLImageElement>('img')!;
  gallery.querySelectorAll<HTMLButtonElement>('[data-gallery-src]').forEach(button => button.addEventListener('click', () => {
    // The thumbnail only knows the full-size path; drop the cover's srcset so src is honoured.
    main.removeAttribute('srcset');
    main.src = button.dataset.gallerySrc!;
    main.alt = button.dataset.galleryAlt || '';
    gallery.querySelectorAll('[aria-pressed]').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
  }));
  gallery.querySelector('[data-gallery-main]')?.addEventListener('click', () => { enlarged.src = main.src; enlarged.alt = main.alt; dialog.showModal(); });
  dialog.querySelector('button')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
});

// ---------- Hero project slideshow ----------
const hero = document.querySelector<HTMLElement>('[data-hero]');
if (hero) {
  const slides = [...hero.querySelectorAll<HTMLElement>('[data-slide]')];
  const chips = [...hero.querySelectorAll<HTMLElement>('[data-chip]')];
  const dots = [...hero.querySelectorAll<HTMLButtonElement>('[data-slide-to]')];
  const interval = Number(hero.dataset.slideMs) || 7000;
  let current = 0;
  let timer: number | undefined;
  // Inactive slides ship with data-src/data-srcset (see Picture.astro `deferred`) so they don't
  // compete with the first slide (the LCP image). Load them once the page has finished loading.
  const loadSlide = (slide: HTMLElement) => {
    const img = slide.querySelector<HTMLImageElement>('img[data-src]');
    if (!img) return;
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    img.src = img.dataset.src!;
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');
  };
  const loadAllSlides = () => slides.forEach(loadSlide);
  if (document.readyState === 'complete') loadAllSlides(); else addEventListener('load', loadAllSlides, { once: true });
  const show = (next: number) => {
    current = (next + slides.length) % slides.length;
    loadSlide(slides[current]);
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    chips.forEach((c, i) => {
      const active = i === current;
      c.classList.toggle('is-active', active);
      c.tabIndex = active ? 0 : -1;
      if (active) c.removeAttribute('aria-hidden'); else c.setAttribute('aria-hidden', 'true');
    });
    // Restart the progress animation on the active control.
    dots.forEach((d) => d.setAttribute('aria-current', 'false'));
    void dots[current]?.offsetWidth;
    dots[current]?.setAttribute('aria-current', 'true');
  };
  const toggle = hero.querySelector<HTMLButtonElement>('[data-hero-toggle]');
  // A pause chosen with the toggle persists until the visitor presses play; hover/focus pauses are temporary.
  let userPaused = false;
  const stop = () => { window.clearInterval(timer); timer = undefined; };
  const start = () => { stop(); if (!reduceMotion && !userPaused) timer = window.setInterval(() => show(current + 1), interval); };
  const resume = () => { if (userPaused) return; hero.classList.remove('hero-paused'); start(); };
  dots.forEach((d) => d.addEventListener('click', () => { show(Number(d.dataset.slideTo)); start(); }));
  hero.addEventListener('mouseenter', () => { stop(); hero.classList.add('hero-paused'); });
  hero.addEventListener('mouseleave', resume);
  hero.addEventListener('focusin', () => { stop(); hero.classList.add('hero-paused'); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if (toggle && !reduceMotion) {
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      userPaused = !userPaused;
      toggle.toggleAttribute('data-paused', userPaused);
      toggle.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
      hero.classList.toggle('hero-paused', userPaused);
      if (userPaused) stop(); else start();
    });
  }
  if (reduceMotion) hero.classList.add('hero-paused');
  start();
}

// ---------- Film: background loop + on-demand modal ----------
const bgVideo = document.querySelector<HTMLVideoElement>('[data-bg-video]');
// Data Saver: keep the poster instead of streaming the 3 MB decorative loop.
const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
if (bgVideo && !reduceMotion && !saveData && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { bgVideo.preload = 'auto'; bgVideo.play().catch(() => { /* autoplay blocked: poster stays */ }); }
    else bgVideo.pause();
  }, { threshold: 0.2 });
  io.observe(bgVideo);
}
const filmModal = document.querySelector<HTMLDialogElement>('[data-film-modal]');
const filmVideo = filmModal?.querySelector('video');
document.querySelectorAll<HTMLButtonElement>('[data-film-open]').forEach((button) => {
  if (!filmModal) { button.hidden = true; return; }
  button.addEventListener('click', () => {
    // The poster is only needed once the modal opens; setting it earlier made it load with the page.
    if (filmVideo?.dataset.poster && !filmVideo.poster) filmVideo.poster = filmVideo.dataset.poster;
    filmModal.showModal();
    filmVideo?.play().catch(() => { /* user can press play */ });
  });
});
filmModal?.querySelector('[data-film-close]')?.addEventListener('click', () => filmModal.close());
filmModal?.addEventListener('click', (event) => { if (event.target === filmModal) filmModal.close(); });
filmModal?.addEventListener('close', () => filmVideo?.pause());

// ---------- Project gallery lightbox ----------
document.querySelectorAll<HTMLElement>('[data-gallery-group]').forEach((group) => {
  const modal = group.parentElement?.querySelector<HTMLDialogElement>('[data-gallery-modal]');
  if (!modal) return;
  const items = [...group.querySelectorAll<HTMLButtonElement>('[data-lightbox-item]')];
  const img = modal.querySelector('img')!;
  const caption = modal.querySelector('[data-caption]')!;
  let index = 0;
  const open = (i: number) => {
    index = (i + items.length) % items.length;
    img.src = items[index].dataset.full!;
    img.alt = items[index].dataset.alt || '';
    caption.textContent = `${index + 1} / ${items.length} — ${items[index].dataset.alt || ''}`;
    if (!modal.open) modal.showModal();
  };
  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  modal.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => open(index - 1));
  modal.querySelector('[data-lightbox-next]')?.addEventListener('click', () => open(index + 1));
  modal.querySelector('[data-lightbox-close]')?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => { if (event.target === modal) modal.close(); });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') open(index - 1);
    if (event.key === 'ArrowRight') open(index + 1);
  });
  modal.addEventListener('close', () => items[index]?.focus());
});

// ---------- Single-image lightboxes (e.g. location map) ----------
document.querySelectorAll<HTMLButtonElement>('[data-lightbox-open]').forEach((button) => {
  const modal = document.querySelector<HTMLDialogElement>(`[data-single-lightbox="${button.dataset.lightboxOpen}"]`);
  if (!modal) return;
  button.addEventListener('click', () => modal.showModal());
  modal.querySelector('[data-lightbox-close]')?.addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => { if (event.target === modal) modal.close(); });
});
