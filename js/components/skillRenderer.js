/**
 * Render skill cards with parsed effect keywords.
 */

import { getSkillsForHero } from '../data/loader.js';
import { parseEffectTokens } from '../utils/effectParser.js';

const TYPE_LABELS = {
  passive: { label: 'Bị động', class: 'bg-emerald-900/60 text-emerald-300 border-emerald-700' },
  active: { label: 'Chủ động', class: 'bg-blue-900/60 text-blue-300 border-blue-700' },
  ultimate: { label: 'Tuyệt kỹ', class: 'bg-amber-900/60 text-amber-300 border-amber-700' },
};

/**
 * @param {object} hero
 * @returns {string} HTML for skills section
 */
export function renderSkills(hero) {
  const skills = getSkillsForHero(hero);
  if (!skills.length) {
    return '<p class="text-slate-400 text-sm">Chưa có dữ liệu kỹ năng.</p>';
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
    class: 'bg-slate-800 text-slate-300 border-slate-600',
  };

  const cooldown =
    skill.cooldown != null
      ? `<span class="text-xs text-slate-500">Hồi chiêu: ${skill.cooldown} lượt</span>`
      : '';

  const description = parseEffectTokens(skill.description);

  return `
    <article class="skill-card rounded-lg border border-slate-700/80 bg-slate-800/40 p-3 sm:p-4">
      <header class="flex flex-wrap items-center gap-2 mb-2">
        <h4 class="font-semibold text-slate-100">${skill.name}</h4>
        ${skill.name_cn ? `<span class="text-xs text-slate-500">${skill.name_cn}</span>` : ''}
        <span class="ml-auto text-xs px-2 py-0.5 rounded border ${typeInfo.class}">${typeInfo.label}</span>
      </header>
      <p class="skill-description text-sm text-slate-300 leading-relaxed">${description}</p>
      ${cooldown ? `<footer class="mt-2">${cooldown}</footer>` : ''}
    </article>
  `;
}
