/**
 * Parse [Effect Name] tokens in skill descriptions into inline highlight buttons.
 */

import { getEffectByName } from '../data/loader.js';

const INLINE_TOKEN = /(\[([^\]]+)\]|\*\*([^*]+)\*\*)/g;

/**
 * @param {string} text - Raw skill description
 * @param {{ localEffects?: Record<string, object> }} options
 * @returns {string} HTML string with inline effect keywords
 */
export function parseEffectTokens(text, options = {}) {
  if (!text) return '';

  let html = '';
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_TOKEN)) {
    html += escapeHtml(text.slice(lastIndex, match.index));

    if (match[2]) {
      html += renderEffectKeyword(match[2], options);
    } else {
      html += `<strong>${escapeHtml(match[3].trim())}</strong>`;
    }

    lastIndex = match.index + match[0].length;
  }

  html += escapeHtml(text.slice(lastIndex));
  return html;
}

function renderEffectKeyword(rawName, options) {
  const name = rawName.trim();
  const localEffect = findLocalEffectByName(options.localEffects, name);
  const effect = localEffect ?? getEffectByName(name);
  const known = Boolean(effect);
  const unknownClass = known ? '' : ' effect-keyword--unknown';
  const icon = effect?.icon
    ? `<img src="${escapeAttr(effect.icon)}" alt="" class="effect-keyword__icon" aria-hidden="true" />`
    : '';

  return (
    `<button type="button" class="effect-keyword${unknownClass}" ` +
    `data-effect-name="${escapeAttr(name)}" ` +
    `aria-label="Giải thích: ${escapeAttr(name)}">` +
    `${icon}<span>${escapeHtml(name)}</span></button>`
  );
}

export function findLocalEffectByName(localEffects, name) {
  if (!localEffects || !name) return null;
  const target = name.trim();
  return Object.values(localEffects).find((effect) => effect?.name?.trim() === target) ?? null;
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
