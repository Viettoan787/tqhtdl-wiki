/**
 * Võ Tướng — heroes grouped by country (faction).
 */

import { getHeroes } from '../data/loader.js';

const COUNTRIES = [
  { id: 'nguy', label: 'Ngụy', class: 'faction-nguy' },
  { id: 'thuc', label: 'Thục', class: 'faction-thuc' },
  { id: 'ngo', label: 'Ngô', class: 'faction-ngo' },
  { id: 'quan-hung', label: 'Quần Hùng', class: 'faction-quan-hung' },
];

let onHeroSelect = null;

/**
 * @param {HTMLElement} container
 * @param {(hero: object) => void} onSelect
 */
export function initHeroGrid(container, onSelect) {
  onHeroSelect = onSelect;
  renderHeroGrid(container);
}

export function renderHeroGrid(container) {
  const heroes = getHeroes();

  container.innerHTML = `
    <div class="faction-grid">
      ${COUNTRIES.map((country) => renderFactionBlock(country, heroes)).join('')}
    </div>
  `;

  container.querySelectorAll('[data-hero-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.heroId;
      const hero = getHeroes().find((h) => h.id === id);
      if (hero && onHeroSelect) onHeroSelect(hero);
    });
  });
}

function renderFactionBlock(country, heroes) {
  const factionHeroes = heroes.filter((h) => h.country === country.id);

  return `
    <section class="faction-block ${country.class}" aria-label="${country.label}">
      <h3 class="faction-block__title">${country.label}</h3>
      <div class="faction-block__heroes">
        ${
          factionHeroes.length
            ? factionHeroes.map((h) => renderHeroCard(h)).join('')
            : '<p class="faction-block__empty">Chưa có tướng.</p>'
        }
      </div>
    </section>
  `;
}

function renderHeroCard(hero) {
  const badge = hero.type === 'soul' ? 'Hồn Tướng' : 'Võ Tướng';
  return `
    <button
      type="button"
      data-hero-id="${hero.id}"
      class="hero-card"
      aria-label="Xem chi tiết ${hero.name}"
    >
      <div class="hero-card__image-wrap">
        <img
          src="${hero.image}"
          alt="${hero.name}"
          class="hero-card__image"
          loading="lazy"
        />
      </div>
      <div class="hero-card__body">
        <span class="hero-card__badge">${badge}</span>
        <h4 class="hero-card__name">${hero.name}</h4>
        ${hero.name_cn ? `<p class="hero-card__name-cn">${hero.name_cn}</p>` : ''}
      </div>
    </button>
  `;
}
