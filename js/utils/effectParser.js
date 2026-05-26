/**
 * Parse [Tên Hiệu Ứng] in skill descriptions into inline highlight buttons.
 */

import { getEffectByName } from '../data/loader.js';

const BRACKET_TOKEN = /\[([^\]]+)\]/g;

/**
 * @param {string} text - Raw skill description
 * @returns {string} HTML string with inline effect keywords
 */
export function parseEffectTokens(text) {
  if (!text) return '';

  return text.replace(BRACKET_TOKEN, (_, rawName) => {
    const name = rawName.trim();
    const effect = getEffectByName(name);
    const known = Boolean(effect);
    const unknownClass = known ? '' : ' effect-keyword--unknown';

    return (
      `<button type="button" class="effect-keyword${unknownClass}" ` +
      `data-effect-name="${escapeAttr(name)}" ` +
      `aria-label="Giải thích: ${escapeAttr(name)}">` +
      `${escapeHtml(name)}</button>`
    );
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}
