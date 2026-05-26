/**
 * Hero detail modal (no stats).
 */

import { renderSkills } from './skillRenderer.js';

let modalEl = null;
let backdropEl = null;
let onClose = null;

export function initHeroModal() {
  modalEl = document.getElementById('hero-modal');
  backdropEl = document.getElementById('hero-modal-backdrop');

  backdropEl?.addEventListener('click', closeHeroModal);
  modalEl?.querySelector('[data-modal-close]')?.addEventListener('click', closeHeroModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) closeHeroModal();
  });
}

export function openHeroModal(hero) {
  if (!modalEl || !hero) return;

  const content = modalEl.querySelector('[data-modal-content]');
  if (content) content.innerHTML = renderModalContent(hero);

  modalEl.classList.remove('hidden');
  backdropEl?.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');

  modalEl.querySelector('[data-modal-close]')?.focus();
}

export function closeHeroModal() {
  modalEl?.classList.add('hidden');
  backdropEl?.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
  onClose?.();
}

export function isOpen() {
  return modalEl && !modalEl.classList.contains('hidden');
}

export function setOnClose(fn) {
  onClose = fn;
}

function renderModalContent(hero) {
  const factionClass = hero.country ? `faction-${hero.country}` : '';

  return `
    <div class="modal-hero grid grid-cols-1 md:grid-cols-[minmax(140px,200px)_1fr] gap-4 md:gap-6">
      <div class="flex flex-col items-center md:items-start">
        <div class="w-full max-w-[200px] aspect-[5/7] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img src="${hero.image}" alt="${hero.name}" class="w-full h-full object-cover" />
        </div>
        <div class="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
          <span class="hero-card__badge">Hồn Tướng</span>
          <span class="faction-pill ${factionClass}">${hero.faction}</span>
        </div>
      </div>

      <div class="min-w-0">
        <header class="mb-4">
          <h2 id="hero-modal-title" class="text-xl sm:text-2xl font-bold text-slate-900">${hero.name}</h2>
          ${hero.name_cn ? `<p class="text-sm text-slate-500">${hero.name_cn}</p>` : ''}
          ${hero.role ? `<p class="text-sm text-slate-500 mt-1">${hero.role}</p>` : ''}
          <p class="text-sm text-slate-700 mt-3 leading-relaxed">${hero.description}</p>
        </header>

        <section aria-label="Kỹ năng">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Kỹ năng</h3>
          ${renderSkills(hero)}
        </section>
      </div>
    </div>
  `;
}
