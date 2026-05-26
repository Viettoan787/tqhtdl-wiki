/**
 * Render character skills grouped by required slots.
 *
 * - Normal hero: Phổ Công, Nộ Công, bị động 3/5 sao, Vô Song 1/3/5, Duyên Phận
 * - Hồn Tướng (quality UR): Phổ Công, Nộ Công, Long Hồn Kỹ, Vô Song 1/3/5, 2 Duyên Phận
 *
 * Note: slot mapping is inferred from `skill.id` (no schema change).
 */

import { getSkillsForHero } from '../data/loader.js';
import { parseEffectTokens } from '../utils/effectParser.js';

const SLOT_LABELS = {
  pho_cong: 'Phổ Công',
  no_cong: 'Nộ Công',
  passive_3_sao: 'Bị động (3 sao)',
  passive_5_sao: 'Bị động (5 sao)',
  long_hon_ky: 'Long Hồn Kỹ',
  vo_song_1: 'Vô Song 1',
  vo_song_3: 'Vô Song 3',
  vo_song_5: 'Vô Song 5',
  duyen_phan: 'Duyên Phận',
  huyan_vu: 'Huyễn Vũ',
  thuc_tinh_menh_hon: 'Thức Tỉnh Mệnh Hồn',
};

/**
 * @param {object} hero
 * @returns {string[]}
 */
function getExpectedSlotKeys(hero) {
  if (hero?.type === 'soul' && hero?.quality === 'UR') {
    return [
      'pho_cong',
      'no_cong',
      'long_hon_ky',
      'vo_song_1',
      'vo_song_3',
      'vo_song_5',
      'duyen_phan',
    ];
  }

  return [
    'pho_cong',
    'no_cong',
    'passive_3_sao',
    'passive_5_sao',
    'vo_song_1',
    'vo_song_3',
    'vo_song_5',
    'duyen_phan',
  ];
}

/**
 * Infer slot key from skill.id.
 * @param {string} skillId
 * @returns {string|null}
 */
function getSlotKeyFromSkillId(skillId) {
  if (!skillId) return null;

  if (skillId.includes('_pho_cong_')) return 'pho_cong';
  if (skillId.includes('_pho_cong')) return 'pho_cong';
  if (skillId.includes('_no_cong')) return 'no_cong';

  if (skillId.includes('_bi_dong_3_sao')) return 'passive_3_sao';
  if (skillId.includes('_bi_dong_5_sao')) return 'passive_5_sao';

  if (skillId.includes('_long_hon_ky')) return 'long_hon_ky';

  if (skillId.includes('_vo_song_1')) return 'vo_song_1';
  if (skillId.includes('_vo_song_3')) return 'vo_song_3';
  if (skillId.includes('_vo_song_5')) return 'vo_song_5';

  if (skillId.includes('_duyen_phan')) return 'duyen_phan';

  return null;
}

function getSortIndex(skill) {
  const id = skill?.id ?? '';

  if (id.includes('_pho_cong_')) {
    const m = id.match(/_pho_cong_(\d+)/);
    if (m) return Number(m[1]);
  }
  if (id.includes('_duyen_phan_')) {
    const m = id.match(/_duyen_phan_(\d+)/);
    if (m) return Number(m[1]);
  }
  if (id.includes('_bi_dong_3_sao')) return 3;
  if (id.includes('_bi_dong_5_sao')) return 5;
  if (id.includes('_vo_song_1')) return 1;
  if (id.includes('_vo_song_3')) return 3;
  if (id.includes('_vo_song_5')) return 5;

  return 999;
}

/**
 * @param {object} hero
 * @returns {string} HTML for skills section
 */
export function renderSkills(hero) {
  const skills = getSkillsForHero(hero);
  if (!skills.length) {
    return '<p class="text-slate-500 text-sm">Chưa có dữ liệu kỹ năng.</p>';
  }

  const expectedSlots = getExpectedSlotKeys(hero);
  const bySlot = new Map(expectedSlots.map((k) => [k, []]));

  for (const skill of skills) {
    const slotKey = getSlotKeyFromSkillId(skill.id);
    if (!slotKey || !bySlot.has(slotKey)) continue;
    bySlot.get(slotKey).push(skill);
  }

  const sections = expectedSlots
    .map((slotKey) => renderSlotSection(slotKey, bySlot.get(slotKey) ?? []))
    .filter(Boolean)
    .join('');

  if (!sections) {
    return '<p class="text-slate-500 text-sm">Chưa có dữ liệu kỹ năng phù hợp cấu hình.</p>';
  }

  return `<div class="space-y-6">${sections}</div>`;
}

function renderSlotSection(slotKey, slotSkills) {
  if (!slotSkills.length) return '';

  const label = SLOT_LABELS[slotKey] ?? slotKey;
  const sorted = [...slotSkills].sort((a, b) => getSortIndex(a) - getSortIndex(b));

  return `
    <section class="skill-slot">
      <h4 class="skill-slot__title">${label}</h4>
      <div class="skill-slot__list">
        ${sorted.map((skill) => renderSkillCard(skill)).join('')}
      </div>
    </section>
  `;
}

function renderSkillCard(skill) {
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
      </header>
      <p class="skill-card__desc skill-description">${description}</p>
      ${cooldown ? `<footer class="mt-2">${cooldown}</footer>` : ''}
    </article>
  `;
}
