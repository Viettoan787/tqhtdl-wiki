/**
 * Linh Sủng list and detail table.
 */

import { getPets } from '../data/loader.js';
import { parseEffectTokens } from '../utils/effectParser.js';

let activePetId = null;

/**
 * @param {HTMLElement} container
 */
export function initPetGrid(container) {
  if (!container) return;

  const pets = getPets();
  activePetId = activePetId ?? pets[0]?.id ?? null;
  renderPetGrid(container);

  container.addEventListener('click', (event) => {
    const card = event.target.closest('[data-pet-card-id]');
    if (!card) return;

    activePetId = card.dataset.petCardId;
    renderPetGrid(container);
  });
}

function renderPetGrid(container) {
  const pets = getPets();
  const activePet = pets.find((pet) => pet.id === activePetId) ?? pets[0] ?? null;

  if (!pets.length) {
    container.innerHTML = '<p class="text-slate-500 text-sm">Chưa có dữ liệu Linh Sủng.</p>';
    return;
  }

  container.innerHTML = `
    <div class="pet-layout">
      <div class="pet-list" aria-label="Danh sách Linh Sủng">
        ${pets.map((pet) => renderPetCard(pet, pet.id === activePet?.id)).join('')}
      </div>
      ${activePet ? renderPetDetail(activePet) : ''}
    </div>
  `;
}

function renderPetCard(pet, active) {
  return `
    <button
      type="button"
      data-pet-card-id="${escapeAttr(pet.id)}"
      class="pet-card ${active ? 'pet-card--active' : ''}"
      aria-pressed="${active}"
    >
      ${renderPetAvatar(pet)}
      <span class="pet-card__body">
        <span class="pet-card__name">${escapeHtml(pet.name)}</span>
        ${pet.name_cn ? `<span class="pet-card__name-cn">${escapeHtml(pet.name_cn)}</span>` : ''}
      </span>
      ${pet.quality ? `<span class="pet-card__quality">${escapeHtml(pet.quality)}</span>` : ''}
    </button>
  `;
}

function renderPetDetail(pet) {
  return `
    <article class="pet-detail" data-pet-id="${escapeAttr(pet.id)}">
      <header class="pet-detail__header">
        <div>
          <p class="pet-detail__eyebrow">Linh Sủng</p>
          <h3 class="pet-detail__title">${escapeHtml(pet.name)}</h3>
          ${pet.name_cn ? `<p class="pet-detail__subtitle">${escapeHtml(pet.name_cn)}</p>` : ''}
        </div>
        ${pet.quality ? `<span class="pet-detail__quality">${escapeHtml(pet.quality)}</span>` : ''}
      </header>

      ${renderPetHeroImage(pet)}

      <div class="pet-skill-table-wrap">
        <table class="pet-skill-table">
          <thead>
            <tr>
              <th scope="col">Sao</th>
              <th scope="col">Kỹ năng xuất chiến - ${escapeHtml(pet.battleSkillName ?? '')}</th>
              <th scope="col">Kỹ năng trợ chiến - ${escapeHtml(pet.assistSkillName ?? '')}</th>
            </tr>
          </thead>
          <tbody>
            ${(pet.skillsByStar ?? []).map((skill) => renderSkillRow(pet, skill)).join('')}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function renderSkillRow(pet, skill) {
  const options = { localEffects: pet.localEffects };

  return `
    <tr data-skill-star="${escapeAttr(skill.star)}">
      <th scope="row" class="pet-skill-table__stars" aria-label="${escapeAttr(skill.star)} sao">
        ${renderStars(skill.star)}
      </th>
      <td>${parseEffectTokens(skill.battleSkill, options)}</td>
      <td>${parseEffectTokens(skill.assistSkill, options)}</td>
    </tr>
  `;
}

function renderStars(star) {
  return Array.from({ length: Number(star) || 0 }, () => '<span aria-hidden="true">★</span>').join('');
}

function renderPetAvatar(pet) {
  if (pet.image) {
    return `
      <span class="pet-card__avatar pet-card__avatar--image" aria-hidden="true">
        <img src="${escapeAttr(pet.image)}" alt="" loading="lazy" />
      </span>
    `;
  }

  return '<span class="pet-card__avatar" aria-hidden="true"></span>';
}

function renderPetHeroImage(pet) {
  if (!pet.image) return '';

  return `
    <div class="pet-detail__image-wrap">
      <img src="${escapeAttr(pet.image)}" alt="${escapeAttr(pet.name)}" class="pet-detail__image" loading="lazy" />
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}
