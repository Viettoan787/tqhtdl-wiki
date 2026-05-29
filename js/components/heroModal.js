/**
 * Hero detail modal (no stats).
 */

import { renderSkills } from './skillRenderer.js';

const PROFESSION_ICONS = {
  'Tấn Công': '/assets/icons/profession-attack.svg',
  'Đột Kích': '/assets/icons/profession-raid.svg',
  'Hỗ Trợ': '/assets/icons/profession-support.svg',
  'Phòng Thủ': '/assets/icons/profession-defense.svg',
};

const QUALITY_LABELS = {
  R: 'Lương Tướng',
  SR: 'Danh Tướng',
  SSR: 'Thần Tướng',
};

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
  const profession = renderProfessionBadge(hero.profession);

  return `
    <div class="modal-hero grid grid-cols-1 md:grid-cols-[minmax(140px,200px)_1fr] gap-4 md:gap-6">
      <div class="modal-hero__media flex flex-col items-center md:items-start">
        <div class="w-full max-w-[200px] aspect-[5/7] rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img src="${hero.image}" alt="${hero.name}" class="w-full h-full object-cover" />
        </div>
        <div class="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
          ${profession}
          <span class="modal-meta-pill ${factionClass}">${hero.faction}</span>
        </div>
      </div>

      <div class="min-w-0">
        <header class="mb-4">
          <h2 id="hero-modal-title" class="text-xl sm:text-2xl font-bold text-slate-900">${hero.name}</h2>
          ${hero.name_cn ? `<p class="text-sm text-slate-500">${hero.name_cn}</p>` : ''}
          ${renderQuality(hero)}
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

function renderProfessionBadge(profession) {
  if (!profession) return '';

  const icon = PROFESSION_ICONS[profession];

  if (icon) {
    return `
      <span class="modal-meta-pill modal-meta-pill--profession" title="${profession}" aria-label="${profession}">
        <img src="${icon}" alt="" class="modal-meta-pill__icon" aria-hidden="true" />
      </span>
    `;
  }

  return `<span class="modal-meta-pill modal-meta-pill--profession">${profession}</span>`;
}

function renderQuality(hero) {
  const label = hero?.type === 'soul' ? 'Hồn Tướng' : QUALITY_LABELS[hero?.quality];
  if (!label) return '';

  const className = hero?.type === 'soul' ? 'quality-soul' : `quality-${String(hero.quality).toLowerCase()}`;
  return `<p class="hero-quality ${className}">${label}</p>`;
}
