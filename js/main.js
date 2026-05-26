/**
 * App entry — Tam Quốc Wiki MVP
 */

import { loadData } from './data/loader.js';
import { initHeroGrid } from './components/heroGrid.js';
import { initHeroModal, openHeroModal } from './components/heroModal.js';
import { initEffectPopup, hideEffectPopup } from './components/effectPopup.js';

async function init() {
  const gridEl = document.getElementById('hero-grid');
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

    gridEl?.classList.remove('hidden');
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
