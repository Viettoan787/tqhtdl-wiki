/**
 * Render character skills grouped by required slots.
 */

import { getSkillsForHero } from '../data/loader.js';
import { parseEffectTokens } from '../utils/effectParser.js';

const VO_SONG_FLAME_ICON = '/assets/icons/vo-song-flame.svg';
const RED_FLAME_ICON = '/assets/icons/menh-hon-red-flame.svg';

const SLOT_LABELS = {
  pho_cong: 'Phổ Công',
  no_cong: 'Nộ Công',
  passive_2_sao: '★★',
  passive_3_sao: '★★★',
  passive_4_sao: '★★★★',
  passive_5_sao: '★★★★★',
  long_hon_ky: 'Long Hồn Kỹ',
  vo_song: 'Thức Tỉnh Vô Song',
  duyen_phan: 'Duyên Phận',
  huyen_vu: 'Huyễn Vũ',
  menh_hon_do: 'Mệnh Hồn Đỏ',
};

function getExpectedSlotKeys(hero) {
  if (hero?.type === 'soul' && hero?.quality === 'UR') {
    return ['pho_cong', 'no_cong', 'long_hon_ky', 'vo_song', 'duyen_phan'];
  }

  return [
    'pho_cong',
    'no_cong',
    'passive_2_sao',
    'passive_3_sao',
    'passive_4_sao',
    'passive_5_sao',
    'vo_song',
    'duyen_phan',
    'huyen_vu',
    'menh_hon_do',
  ];
}

function getSlotKeyFromSkillId(skillId) {
  if (!skillId) return null;

  if (skillId.includes('_pho_cong')) return 'pho_cong';
  if (skillId.includes('_no_cong')) return 'no_cong';
  if (skillId.includes('_bi_dong_2_sao')) return 'passive_2_sao';
  if (skillId.includes('_bi_dong_3_sao')) return 'passive_3_sao';
  if (skillId.includes('_bi_dong_4_sao')) return 'passive_4_sao';
  if (skillId.includes('_bi_dong_5_sao')) return 'passive_5_sao';
  if (skillId.includes('_long_hon_ky')) return 'long_hon_ky';
  if (skillId.includes('_vo_song_')) return 'vo_song';
  if (skillId.includes('_huyen_vu') || skillId.includes('_huyan_vu')) return 'huyen_vu';
  if (skillId.includes('_menh_hon_do')) return 'menh_hon_do';
  if (skillId.includes('_duyen_phan')) return 'duyen_phan';

  return null;
}

function getSortIndex(skill) {
  const id = skill?.id ?? '';
  const indexedPatterns = [
    /_pho_cong_(\d+)/,
    /_duyen_phan_(\d+)/,
    /_vo_song_(\d+)/,
    /_menh_hon_do_(\d+)/,
  ];

  for (const pattern of indexedPatterns) {
    const match = id.match(pattern);
    if (match) return Number(match[1]);
  }

  if (id.includes('_bi_dong_2_sao')) return 2;
  if (id.includes('_bi_dong_3_sao')) return 3;
  if (id.includes('_bi_dong_4_sao')) return 4;
  if (id.includes('_bi_dong_5_sao')) return 5;

  return 999;
}

export function renderSkills(hero) {
  const skills = getSkillsForHero(hero).filter(isRenderableSkill);
  if (!skills.length) {
    return '<p class="muted-copy">Chưa có dữ liệu kỹ năng.</p>';
  }

  const expectedSlots = getExpectedSlotKeys(hero);
  const bySlot = new Map(expectedSlots.map((k) => [k, []]));

  for (const skill of skills) {
    const slotKey = getSlotKeyFromSkillId(skill.id);
    if (!slotKey) continue;
    if (!bySlot.has(slotKey)) {
      bySlot.set(slotKey, []);
      expectedSlots.push(slotKey);
    }
    bySlot.get(slotKey).push(skill);
  }

  const sections = expectedSlots
    .map((slotKey) => renderSlotSection(slotKey, bySlot.get(slotKey) ?? []))
    .filter(Boolean)
    .join('');

  return sections ? `<div class="skill-sections">${sections}</div>` : '<p class="muted-copy">Chưa có dữ liệu kỹ năng phù hợp.</p>';
}

function renderSlotSection(slotKey, slotSkills) {
  if (!slotSkills.length) return '';

  const sorted = [...slotSkills].sort((a, b) => getSortIndex(a) - getSortIndex(b));
  const content =
    slotKey === 'vo_song' || slotKey === 'menh_hon_do'
      ? renderGroupedAwakeningCard(sorted, slotKey)
      : sorted.map((skill) => renderSkillCard(skill, slotKey)).join('');

  return `
    <section class="skill-slot skill-slot--${slotKey}">
      <h4 class="skill-slot__title">${SLOT_LABELS[slotKey] ?? slotKey}</h4>
      <div class="skill-slot__list">${content}</div>
    </section>
  `;
}

function isRenderableSkill(skill) {
  const description = skill?.description?.trim() ?? '';
  if (!skill?.id || !skill?.name || !description) return false;
  if (description === 'Mô tả mẫu.') return false;
  if (description.includes('dữ liệu chi tiết sẽ được cập nhật sau')) return false;
  return true;
}

function renderGroupedAwakeningCard(skills, slotKey) {
  const groupName =
    slotKey === 'menh_hon_do' ? `<h5 class="skill-card__name mb-3">${getAwakeningGroupName(skills[0])}</h5>` : '';
  const icon = renderSkillIcon(skills[0]);

  return `
    <article class="skill-card skill-card--grouped">
      <div class="skill-card__group-head">
        ${icon}
        <div>${groupName}</div>
      </div>
      <div class="skill-card__group-list">
        ${skills.map((skill) => renderAwakeningItem(skill, slotKey)).join('')}
      </div>
    </article>
  `;
}

function renderAwakeningItem(skill, slotKey) {
  const description = parseEffectTokens(skill.description);
  const label = getAwakeningLabel(skill, slotKey);
  const flames = renderFlames(getAwakeningLevel(skill, slotKey), slotKey);

  return `
    <section class="skill-card__group-item">
      <h5 class="skill-card__group-title">
        <span class="skill-card__flames" aria-label="${escapeAttr(label)}">${flames}</span>
      </h5>
      <p class="skill-card__desc skill-description">${description}</p>
    </section>
  `;
}

function renderSkillCard(skill, slotKey) {
  const cooldown =
    skill.cooldown != null ? `<span class="text-xs text-slate-400">Hồi chiêu: ${skill.cooldown} lượt</span>` : '';
  const description = parseEffectTokens(skill.description);

  return `
    <article class="skill-card">
      ${renderSkillIcon(skill)}
      <div class="skill-card__body">
        <header class="skill-card__header">
          <h4 class="skill-card__name">${escapeHtml(getDisplaySkillName(skill))}</h4>
          ${skill.name_cn ? `<span class="skill-card__name-cn">${escapeHtml(skill.name_cn)}</span>` : ''}
        </header>
        <p class="skill-card__desc skill-description">${description}</p>
        ${cooldown ? `<footer class="mt-2">${cooldown}</footer>` : ''}
      </div>
    </article>
  `;
}

/** Ô tròn icon kỹ năng bên trái card. Luôn render (kể cả khi chưa có ảnh) như một slot. */
function renderSkillIcon(skill) {
  const icon = skill.icon ?? '';
  const img = icon
    ? `<img src="${escapeAttr(icon)}" alt="" class="skill-card__icon" loading="lazy" aria-hidden="true"${skillIconStyle(skill)} />`
    : '';
  const emptyClass = icon ? '' : ' skill-card__icon-wrap--empty';
  return `<span class="skill-card__icon-wrap${emptyClass}">${img}</span>`;
}

/** Áp crop (objectPosition + zoom) cho icon kỹ năng, giống ảnh thẻ/chi tiết. */
function skillIconStyle(skill) {
  const avatar = skill.avatar;
  if (!avatar) return '';
  const parts = [];
  const op = avatar.objectPosition;
  if (op) parts.push(`object-position:${op}`);
  if (avatar.zoom && Number(avatar.zoom) !== 1) {
    parts.push(`transform:scale(${Number(avatar.zoom)})`);
    parts.push(`transform-origin:${op || 'center center'}`);
  }
  return parts.length ? ` style="${escapeAttr(parts.join(';'))}"` : '';
}

function getDisplaySkillName(skill) {
  return skill.name
    .replace(/^Phổ Công\s*—\s*/, '')
    .replace(/^Nộ Công\s*—\s*/, '')
    .replace(/^Bị động 2 sao\s*—\s*/, '')
    .replace(/^Bị động 3 sao\s*—\s*/, '')
    .replace(/^Bị động 4 sao\s*—\s*/, '')
    .replace(/^Bị động 5 sao\s*—\s*/, '')
    .replace(/^Duyên Phận\s*—\s*/, '')
    .replace(/^Huyễn Vũ\s*—\s*/, '')
    .replace(/^Mệnh Hồn Đỏ\s*—\s*/, '');
}

function getAwakeningGroupName(skill) {
  return getDisplaySkillName(skill).replace(/\s+(1|3|5)$/u, '');
}

function getAwakeningLabel(skill, slotKey) {
  const id = skill?.id ?? '';
  if (slotKey === 'menh_hon_do') {
    if (id.includes('_menh_hon_do_1')) return 'Mệnh Hồn Đỏ 1';
    if (id.includes('_menh_hon_do_3')) return 'Mệnh Hồn Đỏ 3';
    if (id.includes('_menh_hon_do_5')) return 'Mệnh Hồn Đỏ 5';
  }

  if (id.includes('_vo_song_1')) return 'Vô Song 1';
  if (id.includes('_vo_song_3')) return 'Vô Song 3';
  if (id.includes('_vo_song_5')) return 'Vô Song 5';
  return skill.name;
}

function getAwakeningLevel(skill, slotKey) {
  const id = skill?.id ?? '';
  if (slotKey === 'menh_hon_do') {
    if (id.includes('_menh_hon_do_1')) return 1;
    if (id.includes('_menh_hon_do_3')) return 3;
    if (id.includes('_menh_hon_do_5')) return 5;
  }

  if (id.includes('_vo_song_1')) return 1;
  if (id.includes('_vo_song_3')) return 3;
  if (id.includes('_vo_song_5')) return 5;
  return 0;
}

function renderFlames(count, slotKey) {
  const icon = slotKey === 'menh_hon_do' ? RED_FLAME_ICON : VO_SONG_FLAME_ICON;
  return Array.from(
    { length: count },
    () => `<img src="${icon}" alt="" class="skill-card__flame" aria-hidden="true" />`
  ).join('');
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
