/**
 * App entry — Tam Quốc Wiki
 */

import { loadData } from './data/loader.js';
import { initCategoryNav } from './components/categoryNav.js';
import { initHeroGrid } from './components/heroGrid.js';
import { initHeroModal, openHeroModal } from './components/heroModal.js';
import { initEffectPopup, hideEffectPopup } from './components/effectPopup.js';
import { initPetGrid } from './components/petGrid.js';

async function init() {
  const categoryNavEl = document.getElementById('category-nav');
  const gridEl = document.getElementById('hero-grid');
  const petGridEl = document.getElementById('pet-grid');
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');

  try {
    await loadData();
    loadingEl?.classList.add('hidden');

    initHeroModal();
    initEffectPopup();

    initHeroGrid(gridEl, (hero) => {
      hideEffectPopup();
      openHeroModal(hero);
    });
    initPetGrid(petGridEl);

    initCategoryNav(categoryNavEl, () => {
      hideEffectPopup();
    });

    document.querySelector('[data-category-panel="vo-tuong"]')?.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    loadingEl?.classList.add('hidden');
    errorEl?.classList.remove('hidden');
    if (errorEl) {
      errorEl.textContent = `Lỗi tải dữ liệu: ${err.message}. Hãy chạy qua local server (không mở file:// trực tiếp).`;
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
