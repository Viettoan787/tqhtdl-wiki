/**
 * Minimal effect glossary popover (desktop) / bottom sheet (mobile).
 */

import { getEffectByName } from '../data/loader.js';

const MOBILE_QUERY = '(max-width: 640px)';
const MISSING_COPY = 'Chưa có mô tả hiệu ứng này.';

let popupEl = null;
let backdropEl = null;
let currentAnchor = null;
let isOpen = false;

function isMobile() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

export function initEffectPopup() {
  popupEl = document.getElementById('effect-popup');
  backdropEl = document.getElementById('effect-popup-backdrop');

  backdropEl?.addEventListener('click', hideEffectPopup);
  popupEl?.querySelector('[data-effect-close]')?.addEventListener('click', (e) => {
    e.stopPropagation();
    hideEffectPopup();
  });

  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) hideEffectPopup();
  });
  window.addEventListener('resize', () => {
    if (!isOpen || !currentAnchor) return;
    if (isMobile()) {
      popupEl.dataset.mode = 'sheet';
      backdropEl?.classList.remove('hidden');
      popupEl.style.top = '';
      popupEl.style.left = '';
      popupEl.style.visibility = '';
    } else {
      backdropEl?.classList.add('hidden');
      document.body.classList.remove('effect-sheet-open');
      requestAnimationFrame(() => positionPopover(currentAnchor));
    }
  });
}

function onDocumentClick(event) {
  const keyword = event.target.closest('.effect-keyword');
  if (keyword) {
    event.preventDefault();
    showEffectPopup(keyword.dataset.effectName, keyword);
    return;
  }

  if (!isOpen) return;
  if (popupEl?.contains(event.target)) return;
  hideEffectPopup();
}

/**
 * @param {string} effectName
 * @param {HTMLElement} anchor
 */
export function showEffectPopup(effectName, anchor) {
  if (!popupEl || !effectName) return;

  const effect = getEffectByName(effectName);
  const title = effect?.name ?? effectName;
  const description = effect?.description ?? MISSING_COPY;

  popupEl.querySelector('[data-effect-title]').textContent = title;
  popupEl.querySelector('[data-effect-desc]').textContent = description;

  currentAnchor = anchor;
  isOpen = true;

  popupEl.classList.remove('hidden');

  if (isMobile()) {
    popupEl.dataset.mode = 'sheet';
    backdropEl?.classList.remove('hidden');
    document.body.classList.add('effect-sheet-open');
  } else {
    popupEl.dataset.mode = 'popover';
    backdropEl?.classList.add('hidden');
    document.body.classList.remove('effect-sheet-open');
    requestAnimationFrame(() => positionPopover(anchor));
  }
}

export function hideEffectPopup() {
  isOpen = false;
  currentAnchor = null;
  popupEl?.classList.add('hidden');
  backdropEl?.classList.add('hidden');
  document.body.classList.remove('effect-sheet-open');
  if (popupEl) {
    popupEl.style.top = '';
    popupEl.style.left = '';
  }
}

function positionPopover(anchor) {
  if (!popupEl || !anchor || isMobile()) return;

  const rect = anchor.getBoundingClientRect();
  const margin = 8;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  popupEl.style.visibility = 'hidden';
  popupEl.style.top = '0px';
  popupEl.style.left = '0px';

  const popupRect = popupEl.getBoundingClientRect();

  let top = rect.bottom + margin;
  let left = rect.left;

  if (left + popupRect.width > viewportW - margin) {
    left = viewportW - popupRect.width - margin;
  }
  if (left < margin) left = margin;

  if (top + popupRect.height > viewportH - margin) {
    top = rect.top - popupRect.height - margin;
  }
  if (top < margin) top = margin;

  popupEl.style.top = `${top}px`;
  popupEl.style.left = `${left}px`;
  popupEl.style.visibility = '';
}
