/**
 * Minimal effect glossary popover (desktop) / bottom sheet (mobile).
 */

import { getEffectByName, getPetById } from '../data/loader.js';
import { findLocalEffectByName } from '../utils/effectParser.js';

const MOBILE_QUERY = '(max-width: 640px)';
const MISSING_COPY = 'Chưa có mô tả hiệu ứng này.';
const BRACKET_TOKEN = /\[[^\]]+\]/g;

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

  const context = getEffectContext(anchor);
  const effect = resolveEffect(effectName, context);
  const level = getEffectLevelByStar(effect, context.star);
  const title = effect?.name ?? effectName;
  const description = level?.description ?? effect?.description ?? MISSING_COPY;
  const titleEl = popupEl.querySelector('[data-effect-title]');
  const descEl = popupEl.querySelector('[data-effect-desc]');

  if (titleEl) {
    titleEl.replaceChildren();
    if (effect?.icon) {
      const icon = document.createElement('img');
      icon.src = effect.icon;
      icon.alt = '';
      icon.className = 'effect-popup__icon';
      icon.setAttribute('aria-hidden', 'true');
      titleEl.append(icon);
    }
    const text = document.createElement('span');
    text.textContent = title;
    titleEl.append(text);
  }
  if (descEl) renderEffectDescription(descEl, description, effect, level, context);

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

function getEffectContext(anchor) {
  const scopeEl = anchor?.closest('[data-pet-id]');
  const starEl = anchor?.closest('[data-skill-star]');
  const pet = scopeEl?.dataset.petId ? getPetById(scopeEl.dataset.petId) : null;
  const star = starEl?.dataset.skillStar ? Number(starEl.dataset.skillStar) : null;

  return {
    localEffects: pet?.localEffects ?? null,
    pet,
    star: Number.isFinite(star) ? star : null,
  };
}

function resolveEffect(effectName, context) {
  const localEffect = findLocalEffectByName(context.localEffects, effectName);
  if (localEffect) return { ...localEffect, scope: 'local' };

  const globalEffect = getEffectByName(effectName);
  if (globalEffect) return { ...globalEffect, scope: 'global' };

  return null;
}

function getEffectLevelByStar(effect, star) {
  if (!effect?.levelsByStar || !star) return null;
  return effect.levelsByStar[String(star)] ?? null;
}

function getEffectValueByStar(effect, star) {
  if (!effect?.scalingByStar || !star) return null;
  return effect.scalingByStar[String(star)] ?? null;
}

function positionPopover(anchor) {
  if (!popupEl || !anchor || isMobile()) return;

  const rect = getDesktopAnchorRect(anchor);
  const margin = 8;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  popupEl.style.visibility = 'hidden';
  popupEl.style.top = '0px';
  popupEl.style.left = '0px';

  const popupRect = popupEl.getBoundingClientRect();

  let top = rect.top;
  let left = rect.right + margin;

  if (left + popupRect.width > viewportW - margin) {
    left = rect.right - popupRect.width;
  }
  if (left < margin) left = margin;

  if (top + popupRect.height > viewportH - margin) {
    top = viewportH - popupRect.height - margin;
  }
  if (top < margin) top = margin;

  popupEl.style.top = `${top}px`;
  popupEl.style.left = `${left}px`;
  popupEl.style.visibility = '';
}

function getDesktopAnchorRect(anchor) {
  const skillCard = anchor.closest('.skill-card');
  const petTable = anchor.closest('.pet-skill-table');
  const modalPanel = anchor.closest('#hero-modal [role="dialog"], #hero-modal > div') ?? anchor.closest('#hero-modal');
  const base = skillCard ?? petTable ?? modalPanel ?? anchor;
  return base.getBoundingClientRect();
}

function renderEffectDescription(descEl, description, effect, level, context) {
  descEl.replaceChildren();

  if (context.star && level) {
    const star = document.createElement('p');
    star.className = 'effect-popup__star';
    star.textContent = `${context.star} sao`;
    descEl.append(star);
  }

  const body = document.createElement('p');
  body.className = 'effect-popup__body';
  appendTextWithStrongTokens(body, description);
  descEl.append(body);

  if (level?.stats?.length) return;

  const currentValue = getEffectValueByStar(effect, context.star);
  if (currentValue) {
    const current = document.createElement('p');
    current.className = 'effect-popup__current';
    current.innerHTML = `<strong>Giá trị hiện tại:</strong> ${escapeHtml(currentValue)}`;
    descEl.append(current);
  }

  if (effect?.scalingByStar) {
    renderLegacyScaling(descEl, effect.scalingByStar, context.star);
  }
}

function appendTextWithStrongTokens(container, text) {
  let lastIndex = 0;
  for (const match of String(text).matchAll(BRACKET_TOKEN)) {
    if (match.index > lastIndex) {
      container.append(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const strong = document.createElement('strong');
    strong.textContent = match[0];
    container.append(strong);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    container.append(document.createTextNode(text.slice(lastIndex)));
  }
}

function renderLevelStats(descEl, stats) {
  const wrap = document.createElement('dl');
  wrap.className = 'effect-popup__metrics';

  for (const stat of stats) {
    const row = document.createElement('div');
    row.className = 'effect-popup__metric';

    const label = document.createElement('dt');
    label.textContent = stat.label;
    const value = document.createElement('dd');
    value.textContent = stat.value;

    row.append(label, value);
    wrap.append(row);
  }

  descEl.append(wrap);
}

function renderLegacyScaling(descEl, scalingByStar, currentStar) {
  const wrap = document.createElement('div');
  wrap.className = 'effect-popup__scaling';

  const title = document.createElement('h5');
  title.textContent = 'Giá trị theo sao';
  wrap.append(title);

  const list = document.createElement('ul');
  for (const [star, value] of Object.entries(scalingByStar)) {
    const item = document.createElement('li');
    item.textContent = `${star} sao: ${value}`;
    if (Number(star) === currentStar) item.className = 'is-current';
    list.append(item);
  }
  wrap.append(list);
  descEl.append(wrap);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
