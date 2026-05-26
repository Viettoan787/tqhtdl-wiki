/**
 * Render skill cards with parsed effect keywords.
 */

import { getSkillsForHero } from '../data/loader.js';
import { parseEffectTokens } from '../utils/effectParser.js';

const TYPE_LABELS = {
  passive: { label: 'Bị động', class: 'skill-tag--passive' },
  active: { label: 'Chủ động', class: 'skill-tag--active' },
  ultimate: { label: 'Tuyệt kỹ', class: 'skill-tag--ultimate' },
};

/**
 * @param {object} hero
 * @returns {string} HTML for skills section
 */
export function renderSkills(hero) {
  const skills = getSkillsForHero(hero);
  if (!skills.length) {
    return '<p class="text-slate-500 text-sm">Chưa có dữ liệu kỹ năng.</p>';
  }

  return `
    <div class="space-y-3">
      ${skills.map((skill) => renderSkillCard(skill)).join('')}
    </div>
  `;
}

function renderSkillCard(skill) {
  const typeInfo = TYPE_LABELS[skill.type] ?? {
    label: skill.type,
    class: 'skill-tag--default',
  };

  const cooldown =
    skill.cooldown != null
      ? `<span class="text-xs text-slate-400">Hồi chiêu: ${skill.cooldown} lượt</span>`
      : '';

  const description = parseEffectTokens(skill.description);

  return `
    <article class="skill-card">
      <header class="skill-card__header">
        <h4 class="skill-card__name">${skill.name}</h4>
        ${skill.name_cn ? `<span class="skill-card__name-cn">${skill.name_cn}</span>` : ''}
        <span class="skill-tag ${typeInfo.class}">${typeInfo.label}</span>
      </header>
      <p class="skill-card__desc skill-description">${description}</p>
      ${cooldown ? `<footer class="mt-2">${cooldown}</footer>` : ''}
    </article>
  `;
}
