/**
 * Hero picker dùng chung: ô tìm kiếm + select tướng.
 */

import { getHeroes } from '../data/loader.js';

export function renderHeroPicker(currentId, query = '') {
  const filtered = filterHeroes(query);
  const options = filtered
    .map(
      (h) =>
        `<option value="${escapeAttr(h.id)}" ${h.id === currentId ? 'selected' : ''}>${escapeHtml(
          fullName(h)
        )}</option>`
    )
    .join('');
  return `
    <div class="hero-picker">
      <input type="search" data-action="search-hero" placeholder="Tìm tướng..." value="${escapeAttr(query)}" />
      <select data-action="pick-hero">${options || '<option disabled>Không tìm thấy</option>'}</select>
      <span class="hero-picker__count">${filtered.length} / ${getHeroes().length}</span>
    </div>
  `;
}

export function filterHeroes(query) {
  const q = normalize(query);
  const heroes = getHeroes();
  if (!q) return heroes;
  return heroes.filter((h) => {
    const text = normalize(`${h.title ?? ''} ${h.name ?? ''} ${h.name_cn ?? ''} ${h.id ?? ''}`);
    return text.includes(q);
  });
}

function fullName(h) {
  return h.title ? `${h.title} ${h.name}` : h.name;
}

function normalize(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}
