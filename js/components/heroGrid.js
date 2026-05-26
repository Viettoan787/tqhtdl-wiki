/**
 * Hero card grid with type filter.
 */

import { getHeroes } from '../data/loader.js';

let currentFilter = 'all';
let onHeroSelect = null;

const TYPE_BADGES = {
  normal: { label: 'Thường', class: 'bg-slate-700 text-slate-200' },
  soul: { label: 'Hồn', class: 'bg-purple-900/80 text-purple-200 ring-1 ring-purple-500/50' },
};

/**
 * @param {HTMLElement} container
 * @param {(hero: object) => void} onSelect
 */
export function initHeroGrid(container, onSelect) {
  onHeroSelect = onSelect;
  renderHeroGrid(container);
  initFilters(container);
}

function initFilters(container) {
  const filterBar = container.closest('section')?.querySelector('[data-hero-filters]');
  if (!filterBar) return;

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;

    currentFilter = btn.dataset.filter;
    filterBar.querySelectorAll('[data-filter]').forEach((b) => {
      b.classList.toggle('filter-active', b === btn);
    });
    renderHeroGrid(container);
  });
}

function renderHeroGrid(container) {
  const heroes = getHeroes().filter(
    (h) => currentFilter === 'all' || h.type === currentFilter
  );

  if (!heroes.length) {
    container.innerHTML =
      '<p class="col-span-full text-center text-slate-400 py-12">Không có tướng phù hợp bộ lọc.</p>';
    return;
  }

  container.innerHTML = heroes.map((hero) => renderHeroCard(hero)).join('');

  container.querySelectorAll('[data-hero-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.heroId;
      const hero = getHeroes().find((h) => h.id === id);
      if (hero && onHeroSelect) onHeroSelect(hero);
    });
  });
}

function renderHeroCard(hero) {
  const badge = TYPE_BADGES[hero.type] ?? TYPE_BADGES.normal;
  const qualityClass =
    hero.quality === 'UR'
      ? 'text-purple-300'
      : hero.quality === 'SSR'
        ? 'text-amber-300'
        : 'text-slate-300';

  return `
    <button
      type="button"
      data-hero-id="${hero.id}"
      class="hero-card group text-left rounded-xl border border-slate-700/60 bg-slate-800/50 overflow-hidden
             hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-900/20
             focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all"
      aria-label="Xem chi tiết ${hero.name}"
    >
      <div class="aspect-[5/7] overflow-hidden bg-slate-900">
        <img
          src="${hero.image}"
          alt="${hero.name}"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div class="p-3 sm:p-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs px-1.5 py-0.5 rounded ${badge.class}">${badge.label}</span>
          <span class="text-xs font-bold ${qualityClass}">${hero.quality}</span>
        </div>
        <h3 class="font-bold text-slate-100 truncate">${hero.name}</h3>
        <p class="text-xs text-slate-500 truncate">${hero.name_cn ?? ''}</p>
        <p class="text-xs text-slate-400 mt-1">${hero.faction} · ${hero.role}</p>
      </div>
    </button>
  `;
}
