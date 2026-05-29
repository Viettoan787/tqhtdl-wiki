/**
 * Main category navigation (Notion-style cards).
 */

export const CATEGORIES = [
  { id: 'vo-tuong', label: 'Võ Tướng', enabled: true },
  { id: 'chien-hon-chien-linh', label: 'Chiến Hồn - Chiến Linh', enabled: false },
  { id: 'thien-linh', label: 'Thiện Linh', enabled: false },
  { id: 'than-binh', label: 'Thần Binh', enabled: false },
  { id: 'linh-sung', label: 'Linh Sủng', enabled: true },
  { id: 'trang-bi-linh-sung', label: 'Trang Bị Linh Sủng', enabled: false },
  { id: 'phong-vat-chi', label: 'Phong Vật Chí', enabled: false },
  { id: 'long-hon-huu-the', label: 'Long Hồn Hữu Thế', enabled: false },
];

let activeCategory = 'vo-tuong';
let onCategoryChange = null;

/**
 * @param {HTMLElement} navEl
 * @param {(categoryId: string) => void} onChange
 */
export function initCategoryNav(navEl, onChange) {
  onCategoryChange = onChange;
  navEl.innerHTML = CATEGORIES.map((cat) => renderCategoryButton(cat)).join('');

  navEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;

    const id = btn.dataset.category;
    const cat = CATEGORIES.find((c) => c.id === id);
    if (!cat?.enabled) return;

    setActiveCategory(id);
    onCategoryChange?.(id);
  });

  setActiveCategory('vo-tuong');
}

export function setActiveCategory(id) {
  activeCategory = id;
  document.querySelectorAll('[data-category]').forEach((btn) => {
    btn.classList.toggle('category-card--active', btn.dataset.category === id);
  });

  document.querySelectorAll('[data-category-panel]').forEach((panel) => {
    panel.classList.toggle('hidden', panel.dataset.categoryPanel !== id);
  });
}

export function getActiveCategory() {
  return activeCategory;
}

function renderCategoryButton(cat) {
  const disabled = !cat.enabled;
  return `
    <button
      type="button"
      data-category="${cat.id}"
      class="category-card ${disabled ? 'category-card--disabled' : ''}"
      ${disabled ? 'disabled aria-disabled="true"' : ''}
      title="${disabled ? 'Sắp có' : cat.label}"
    >
      <span class="category-card__label">${cat.label}</span>
      ${disabled ? '<span class="category-card__badge">Sắp có</span>' : ''}
    </button>
  `;
}
