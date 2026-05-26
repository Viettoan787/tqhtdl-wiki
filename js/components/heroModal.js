/**
 * Hero detail modal with stats and skills.
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

  const closeBtn = modalEl.querySelector('[data-modal-close]');
  closeBtn?.focus();
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
  const isSoul = hero.type === 'soul';
  const typeLabel = isSoul ? 'Hồn Tướng' : 'Tướng thường';
  const typeClass = isSoul
    ? 'bg-purple-900/60 text-purple-200 border-purple-600'
    : 'bg-slate-700/60 text-slate-200 border-slate-600';

  const stats = hero.stats ?? {};
  const statItems = [
    { key: 'hp', label: 'HP' },
    { key: 'atk', label: 'ATK' },
    { key: 'def', label: 'DEF' },
    { key: 'spd', label: 'SPD' },
  ];

  return `
    <div class="grid grid-cols-1 md:grid-cols-[minmax(140px,200px)_1fr] gap-4 md:gap-6">
      <div class="flex flex-col items-center md:items-start">
        <div class="w-full max-w-[200px] aspect-[5/7] rounded-lg overflow-hidden border border-slate-600 bg-slate-900">
          <img src="${hero.image}" alt="${hero.name}" class="w-full h-full object-cover" />
        </div>
        <div class="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
          <span class="text-xs px-2 py-0.5 rounded border ${typeClass}">${typeLabel}</span>
          <span class="text-xs px-2 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-700/50">${hero.quality}</span>
        </div>
      </div>

      <div class="min-w-0">
        <header class="mb-4">
          <h2 id="hero-modal-title" class="text-xl sm:text-2xl font-bold text-slate-50">${hero.name}</h2>
          ${hero.name_cn ? `<p class="text-sm text-slate-400">${hero.name_cn}</p>` : ''}
          <p class="text-sm text-slate-400 mt-1">${hero.faction} · ${hero.role}</p>
          <p class="text-sm text-slate-300 mt-2 leading-relaxed">${hero.description}</p>
        </header>

        <section class="mb-5" aria-label="Chỉ số">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Chỉ số</h3>
          <dl class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            ${statItems
              .map(
                (s) => `
              <div class="bg-slate-800/60 rounded-lg px-3 py-2 text-center">
                <dt class="text-xs text-slate-500">${s.label}</dt>
                <dd class="text-lg font-bold text-amber-300">${formatStat(stats[s.key])}</dd>
              </div>
            `
              )
              .join('')}
          </dl>
        </section>

        <section aria-label="Kỹ năng">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Kỹ năng</h3>
          ${renderSkills(hero)}
        </section>
      </div>
    </div>
  `;
}

function formatStat(value) {
  if (value == null) return '—';
  return typeof value === 'number' ? value.toLocaleString('vi-VN') : value;
}
