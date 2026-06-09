/**
 * Trình chỉnh tướng đầy đủ: metadata + slot kỹ năng theo loại.
 * Mẫu: tao_phi.json (tướng thường) và phuong_nghi_vuong_nguyen_co.json (hồn tướng).
 */

import { getHeroById, getHeroes, getHeroFileName } from '../data/loader.js';
import { downloadBlob, downloadJson, hasRoot, pickRoot, supportsFsAccess, writeBinary, writeJson } from './fsStore.js';
import { renderHeroPicker } from './heroPicker.js';

const COUNTRIES = [
  { id: 'nguy', label: 'Ngụy' },
  { id: 'thuc', label: 'Thục' },
  { id: 'ngo', label: 'Ngô' },
  { id: 'quan-hung', label: 'Quần Hùng' },
];
const QUALITIES_NORMAL = ['R', 'SR', 'SSR'];
const PROFESSIONS = ['Tấn Công', 'Đột Kích', 'Hỗ Trợ', 'Phòng Thủ', 'Chưa rõ'];

// Slot definitions: id suffix, label, optional levels, optional name template (for skill.name)
const HUYEN_VU_STAGES = ['Lược Hữu Tiểu Thành', 'Lư Hỏa Thuần Thanh', 'Thần Hồ Kỳ Kỹ'];

const NORMAL_SLOTS = [
  { key: 'pho_cong', label: 'Phổ Công', namePrefix: 'Phổ Công — ' },
  { key: 'no_cong', label: 'Nộ Công', namePrefix: 'Nộ Công — ' },
  { key: 'bi_dong_3_sao', label: 'Bị động 3 sao', namePrefix: 'Bị động 3 sao — ' },
  { key: 'bi_dong_5_sao', label: 'Bị động 5 sao', namePrefix: 'Bị động 5 sao — ' },
  { key: 'vo_song', label: 'Thức Tỉnh Vô Song', levels: [1, 3, 5], nameTemplate: (lv) => `Vô Song ${lv}` },
  { key: 'duyen_phan', label: 'Duyên Phận', levels: [1], namePrefix: 'Duyên Phận — ' },
  { key: 'huyen_vu', label: 'Huyễn Vũ', namePrefix: 'Huyễn Vũ — ', huyenVu: true },
  {
    key: 'menh_hon_do',
    label: 'Mệnh Hồn Đỏ',
    levels: [1, 3, 5],
    nameTemplate: (lv, base) => `Mệnh Hồn Đỏ — ${base ?? ''} ${lv}`.replace(/\s+/g, ' ').trim(),
    sharedName: true, // dùng chung "tên đại cảnh" cho cả 3 bậc
  },
];

const SOUL_SLOTS = [
  { key: 'pho_cong', label: 'Phổ Công', namePrefix: 'Phổ Công — ' },
  { key: 'no_cong', label: 'Nộ Công', namePrefix: 'Nộ Công — ' },
  { key: 'long_hon_ky', label: 'Long Hồn Kỹ', namePrefix: 'Long Hồn Kỹ — ' },
  { key: 'vo_song', label: 'Thức Tỉnh Vô Song', levels: [1, 3, 5], nameTemplate: (lv) => `Vô Song ${lv}` },
  { key: 'duyen_phan', label: 'Duyên Phận', levels: [1, 2], namePrefix: 'Duyên Phận — ', hasHoPhap: true },
];

let containerEl = null;
let state = {
  query: '',
  heroId: null,
  draft: null, // {meta, skills: {slotKey: ...}, sharedNames: {...}}
  status: '',
  pendingIcons: new Map(),
};

export function mountHeroEditor(el) {
  containerEl = el;
  const heroes = getHeroes();
  if (!heroes.length) {
    containerEl.innerHTML = '<p class="muted-copy">Chưa có dữ liệu tướng.</p>';
    return;
  }
  state.heroId = state.heroId ?? heroes[0].id;
  loadHero(state.heroId);
  render();
}

function loadHero(heroId) {
  const hero = getHeroById(heroId);
  if (!hero) return;
  state.heroId = heroId;
  state.draft = heroToDraft(hero);
  state.status = '';
}

function heroToDraft(hero) {
  const draft = {
    meta: {
      type: hero.type ?? 'normal',
      title: hero.title ?? '',
      name: hero.name ?? '',
      name_cn: hero.name_cn ?? '',
      country: hero.country ?? 'quan-hung',
      faction: hero.faction ?? '',
      role: hero.role ?? (hero.type === 'soul' ? 'Hồn Tướng' : 'Võ Tướng'),
      profession: hero.profession ?? 'Chưa rõ',
      quality: hero.quality ?? (hero.type === 'soul' ? 'UR' : 'SSR'),
      image: hero.image ?? '',
      description: hero.description ?? '',
      releaseDate: hero.releaseDate ?? '',
    },
    slots: {},
    sharedNames: {},
  };
  // Map skills hiện có vào slots
  const skills = Array.isArray(hero.skills) ? hero.skills : [];
  for (const skill of skills) {
    const parsed = parseSkillId(skill.id, hero.id);
    if (!parsed) continue;
    const { slotKey, level } = parsed;
    if (slotKey === 'huyen_vu') {
      draft.slots.huyen_vu = {
        name: stripPrefix(skill.name, slotKey),
        icon: skill.icon ?? '',
        avatar: skill.avatar ?? null,
        stages: parseHuyenVuStages(skill.description ?? ''),
      };
      continue;
    }
    if (level == null) {
      draft.slots[slotKey] = {
        name: stripPrefix(skill.name, slotKey),
        icon: skill.icon ?? '',
        avatar: skill.avatar ?? null,
        description: skill.description ?? '',
      };
    } else {
      draft.slots[slotKey] = draft.slots[slotKey] ?? {};
      if ((slotKey === 'vo_song' || slotKey === 'menh_hon_do') && skill.icon && !draft.slots[slotKey].icon) {
        draft.slots[slotKey].icon = skill.icon;
        draft.slots[slotKey].avatar = skill.avatar ?? null;
      }
      draft.slots[slotKey][level] = {
        name: stripPrefix(skill.name, slotKey),
        icon: slotKey === 'vo_song' || slotKey === 'menh_hon_do' ? '' : skill.icon ?? '',
        avatar: slotKey === 'vo_song' || slotKey === 'menh_hon_do' ? null : skill.avatar ?? null,
        description: skill.description ?? '',
        hoPhap: extractHoPhap(skill.name),
      };
      // Mệnh Hồn Đỏ có sharedName
      if (slotKey === 'menh_hon_do' && !draft.sharedNames.menh_hon_do) {
        draft.sharedNames.menh_hon_do = extractMenhHonDoBaseName(skill.name);
      }
    }
  }
  return draft;
}

function parseHuyenVuStages(description) {
  const out = {};
  for (const stageName of HUYEN_VU_STAGES) {
    out[stageName] = '';
  }
  if (!description) return out;
  // Tách theo các marker **<stage>**: (cho phép "Lư"/"Lô" cả hai)
  const altRegex = /\*\*\s*(Lược Hữu Tiểu Thành|Lư Hỏa Thuần Thanh|Lô Hỏa Thuần Thanh|Thần Hồ Kỳ Kỹ)\s*\*\*\s*:?\s*/g;
  const matches = [...description.matchAll(altRegex)];
  if (!matches.length) {
    // Không có marker — đặt toàn bộ vào ô đầu tiên để người dùng tự chia
    out[HUYEN_VU_STAGES[0]] = description.trim();
    return out;
  }
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = m.index + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : description.length;
    let body = description.slice(start, end).trim();
    // Chuẩn hóa tên về "Lư Hỏa Thuần Thanh" làm khóa form
    let key = m[1];
    if (key === 'Lô Hỏa Thuần Thanh') key = 'Lư Hỏa Thuần Thanh';
    out[key] = body;
  }
  return out;
}

function parseSkillId(skillId, heroId) {
  if (!skillId || !heroId) return null;
  const prefix = `${heroId}_`;
  const rest = skillId.startsWith(prefix) ? skillId.slice(prefix.length) : skillId;
  const patterns = [
    { re: /^pho_cong$/, slot: 'pho_cong' },
    { re: /^no_cong$/, slot: 'no_cong' },
    { re: /^bi_dong_(\d)_sao$/, slot: (m) => `bi_dong_${m[1]}_sao` },
    { re: /^long_hon_ky$/, slot: 'long_hon_ky' },
    { re: /^vo_song_(\d)$/, slot: 'vo_song', level: (m) => Number(m[1]) },
    { re: /^duyen_phan$/, slot: 'duyen_phan', level: () => 1 },
    { re: /^duyen_phan_(\d)$/, slot: 'duyen_phan', level: (m) => Number(m[1]) },
    { re: /^huyen_vu$/, slot: 'huyen_vu' },
    { re: /^menh_hon_do_(\d)$/, slot: 'menh_hon_do', level: (m) => Number(m[1]) },
  ];
  for (const p of patterns) {
    const m = rest.match(p.re);
    if (m) {
      return {
        slotKey: typeof p.slot === 'function' ? p.slot(m) : p.slot,
        level: p.level ? p.level(m) : null,
      };
    }
  }
  return null;
}

function stripPrefix(name, slotKey) {
  if (!name) return '';
  return name
    .replace(/^Phổ Công\s*—\s*/, '')
    .replace(/^Nộ Công\s*—\s*/, '')
    .replace(/^Bị động \d sao\s*—\s*/, '')
    .replace(/^Long Hồn Kỹ\s*—\s*/, '')
    .replace(/^Vô Song\s*\d\s*$/, '')
    .replace(/^Duyên Phận\s*—\s*/, '')
    .replace(/^Huyễn Vũ\s*—\s*/, '')
    .replace(/^Mệnh Hồn Đỏ\s*—\s*/, '')
    .replace(/\s*\((Hộ pháp:[^)]+)\)\s*$/, '')
    .replace(/\s+\d$/, '')
    .trim();
}

function extractHoPhap(name) {
  const m = String(name).match(/\(Hộ pháp:\s*([^)]+)\)/);
  return m ? m[1].trim() : '';
}

function extractMenhHonDoBaseName(name) {
  const m = String(name).match(/^Mệnh Hồn Đỏ\s*—\s*(.+?)\s+\d$/);
  return m ? m[1] : '';
}

function getSlotsForType(type) {
  return type === 'soul' ? SOUL_SLOTS : NORMAL_SLOTS;
}

function render() {
  const hero = getHeroById(state.heroId);
  const draft = state.draft;
  const slots = getSlotsForType(draft.meta.type);

  containerEl.innerHTML = `
    <div class="hero-editor">
      <header class="hero-editor__top">
        ${renderHeroPicker(state.heroId, state.query)}
        <div class="hero-editor__type">
          <label><input type="radio" name="hero-type" value="normal" ${draft.meta.type === 'normal' ? 'checked' : ''}/> Tướng thường</label>
          <label><input type="radio" name="hero-type" value="soul" ${draft.meta.type === 'soul' ? 'checked' : ''}/> Hồn tướng</label>
        </div>
      </header>

      <section class="hero-editor__section">
        <h3>Metadata</h3>
        <div class="hero-editor__grid">
          ${textField('title', 'Danh hiệu (Hồn tướng)', draft.meta.title, draft.meta.type === 'soul')}
          ${textField('name', 'Tên *', draft.meta.name, true)}
          ${textField('name_cn', 'Tên Hán', draft.meta.name_cn)}
          ${selectField('country', 'Trận doanh *', COUNTRIES.map((c) => ({ value: c.id, label: c.label })), draft.meta.country)}
          ${textField('faction', 'Phe (hiển thị)', draft.meta.faction)}
          ${selectField(
            'quality',
            'Phẩm cấp *',
            (draft.meta.type === 'soul' ? ['UR'] : QUALITIES_NORMAL).map((q) => ({ value: q, label: q })),
            draft.meta.quality
          )}
          ${selectField('profession', 'Chức nghiệp', PROFESSIONS.map((p) => ({ value: p, label: p })), draft.meta.profession)}
          ${textField('image', 'Đường dẫn ảnh *', draft.meta.image, true)}
          ${draft.meta.type === 'soul' ? dateField('releaseDate', 'Ngày ra mắt', draft.meta.releaseDate) : ''}
        </div>
        <label class="admin-field admin-field--full">
          <span>Mô tả</span>
          <textarea data-meta="description" rows="3">${escapeHtml(draft.meta.description)}</textarea>
        </label>
      </section>

      <section class="hero-editor__section">
        <h3>Kỹ năng</h3>
        ${slots.map((slot) => renderSlot(slot, draft)).join('')}
      </section>

      <div class="admin-actions">
        <button type="button" data-action="reload" class="admin-btn admin-btn--ghost">Nạp lại từ file</button>
        <button type="button" data-action="save" class="admin-btn admin-btn--primary">Lưu vào JSON</button>
      </div>

      <p class="admin-status" data-bind="status">${escapeHtml(state.status)}</p>

      <details class="admin-json">
        <summary>Xem JSON sẽ ghi</summary>
        <pre data-bind="json">${escapeHtml(JSON.stringify(buildEntity(hero), null, 2))}</pre>
      </details>
    </div>
  `;

  bind();
}

function renderSlot(slot, draft) {
  if (slot.huyenVu) {
    const data = draft.slots[slot.key] ?? { name: '', stages: {} };
    return `
      <div class="hero-editor__slot">
        <div class="hero-editor__slot-head"><strong>${escapeHtml(slot.label)}</strong></div>
        <div class="hero-editor__slot-body">
          ${renderIconPicker(slot.key, data)}
          <label class="admin-field">
            <span>Tên Huyễn Vũ (vd: Long Xà Triển Dực)</span>
            <input type="text" data-slot="${slot.key}" data-field="name" value="${escapeAttr(data.name ?? '')}" />
          </label>
          ${HUYEN_VU_STAGES.map(
            (stageName) => `
              <fieldset class="hero-editor__level">
                <legend>${escapeHtml(stageName)}</legend>
                <label class="admin-field admin-field--full">
                  <span>Mô tả</span>
                  <textarea data-stage="${escapeAttr(stageName)}" rows="3">${escapeHtml(
                    (data.stages ?? {})[stageName] ?? ''
                  )}</textarea>
                </label>
              </fieldset>
            `
          ).join('')}
        </div>
      </div>
    `;
  }
  if (!slot.levels) {
    const data = draft.slots[slot.key] ?? {};
    return `
      <div class="hero-editor__slot">
        <div class="hero-editor__slot-head">
          <strong>${escapeHtml(slot.label)}</strong>
        </div>
        <div class="hero-editor__slot-body">
          ${renderIconPicker(slot.key, data)}
          <label class="admin-field">
            <span>Tên kỹ năng</span>
            <input type="text" data-slot="${slot.key}" data-field="name" value="${escapeAttr(data.name ?? '')}" placeholder="vd: Phi Cảnh" />
          </label>
          <label class="admin-field admin-field--full">
            <span>Mô tả</span>
            <textarea data-slot="${slot.key}" data-field="description" rows="4">${escapeHtml(data.description ?? '')}</textarea>
          </label>
        </div>
      </div>
    `;
  }
  // multi-level
  const sharedIcon = slot.key === 'vo_song' || slot.key === 'menh_hon_do'
    ? renderIconPicker(slot.key, draft.slots[slot.key] ?? {})
    : '';
  const sharedHeader = slot.sharedName
    ? `<label class="admin-field">
         <span>Tên đại cảnh (chung 3 bậc)</span>
         <input type="text" data-shared="${slot.key}" value="${escapeAttr(draft.sharedNames[slot.key] ?? '')}" placeholder="vd: Đại Hán Xưng Đế" />
       </label>`
    : '';
  return `
    <div class="hero-editor__slot">
      <div class="hero-editor__slot-head"><strong>${escapeHtml(slot.label)}</strong></div>
      <div class="hero-editor__slot-body">
        ${sharedIcon}
        ${sharedHeader}
        ${slot.levels
          .map((lv) => {
            const data = (draft.slots[slot.key] ?? {})[lv] ?? {};
            const nameField =
              slot.key === 'vo_song' || slot.sharedName
                ? '' // Vô Song không có tên riêng; Mệnh Hồn Đỏ dùng tên chung
                : `<label class="admin-field">
                     <span>Tên (bậc ${lv})</span>
                     <input type="text" data-slot="${slot.key}" data-level="${lv}" data-field="name" value="${escapeAttr(data.name ?? '')}" />
                   </label>`;
            const hoPhapField = slot.hasHoPhap
              ? `<label class="admin-field">
                   <span>Hộ pháp (bậc ${lv})</span>
                   <input type="text" data-slot="${slot.key}" data-level="${lv}" data-field="hoPhap" value="${escapeAttr(data.hoPhap ?? '')}" />
                 </label>`
              : '';
            return `
              <fieldset class="hero-editor__level">
                <legend>Bậc ${lv}</legend>
                ${sharedIcon ? '' : renderIconPicker(slot.key, data, lv)}
                ${nameField}
                ${hoPhapField}
                <label class="admin-field admin-field--full">
                  <span>Mô tả (bậc ${lv})</span>
                  <textarea data-slot="${slot.key}" data-level="${lv}" data-field="description" rows="3">${escapeHtml(data.description ?? '')}</textarea>
                </label>
              </fieldset>
            `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function renderIconPicker(slotKey, data = {}, level = '') {
  const current = data.icon ?? '';
  const crop = getIconCrop(data);
  const key = iconKey(slotKey, level);
  const pending = state.pendingIcons.get(key);
  const preview = pending?.previewUrl ?? current;
  const emptyClass = preview ? '' : ' is-empty';
  const levelAttr = level ? ` data-level="${level}"` : '';
  return `
    <div class="admin-skill-icon${emptyClass}" data-icon-picker data-slot="${escapeAttr(slotKey)}"${levelAttr} tabindex="0" title="Bấm để chọn icon, hoặc Ctrl+V ảnh khi đang chọn ô này">
      <input type="file" accept="image/*" data-icon-file data-slot="${escapeAttr(slotKey)}"${levelAttr} />
      <button type="button" class="admin-skill-icon__button" data-action="pick-icon" data-slot="${escapeAttr(slotKey)}"${levelAttr} aria-label="Chọn icon kỹ năng">
        ${preview ? `<img src="${escapeAttr(preview)}" alt=""${iconPreviewStyle(data)} />` : '<span>+</span>'}
      </button>
      <label class="admin-field admin-skill-icon__path">
        <span>Icon kỹ năng</span>
        <input type="text" data-slot="${escapeAttr(slotKey)}"${levelAttr} data-field="icon" value="${escapeAttr(current)}" placeholder="/assets/skill-icons/..." />
      </label>
      <div class="admin-skill-icon__crop">
        <label class="admin-field">
          <span data-icon-crop-label="x">Vị trí X: ${crop.x}%</span>
          <input type="range" min="0" max="100" step="1" data-icon-crop="x" data-slot="${escapeAttr(slotKey)}"${levelAttr} value="${crop.x}" />
        </label>
        <label class="admin-field">
          <span data-icon-crop-label="y">Vị trí Y: ${crop.y}%</span>
          <input type="range" min="0" max="100" step="1" data-icon-crop="y" data-slot="${escapeAttr(slotKey)}"${levelAttr} value="${crop.y}" />
        </label>
        <label class="admin-field">
          <span data-icon-crop-label="zoom">Phóng: ${crop.zoom.toFixed(2)}x</span>
          <input type="range" min="0.8" max="3" step="0.05" data-icon-crop="zoom" data-slot="${escapeAttr(slotKey)}"${levelAttr} value="${crop.zoom}" />
        </label>
      </div>
    </div>
  `;
}

function textField(key, label, value, required = false) {
  return `
    <label class="admin-field">
      <span>${escapeHtml(label)}</span>
      <input type="text" data-meta="${key}" value="${escapeAttr(value ?? '')}" ${required ? 'required' : ''} />
    </label>
  `;
}

function dateField(key, label, value) {
  return `
    <label class="admin-field">
      <span>${escapeHtml(label)}</span>
      <input type="date" data-meta="${key}" value="${escapeAttr(value ?? '')}" />
    </label>
  `;
}

function selectField(key, label, options, currentValue) {
  const opts = options
    .map((o) => `<option value="${escapeAttr(o.value)}" ${o.value === currentValue ? 'selected' : ''}>${escapeHtml(o.label)}</option>`)
    .join('');
  return `
    <label class="admin-field">
      <span>${escapeHtml(label)}</span>
      <select data-meta="${key}">${opts}</select>
    </label>
  `;
}

function bind() {
  // Search + pick
  containerEl.querySelector('[data-action="search-hero"]').addEventListener('input', (e) => {
    state.query = e.target.value;
    rerenderPicker();
  });
  containerEl.querySelector('[data-action="pick-hero"]').addEventListener('change', (e) => {
    loadHero(e.target.value);
    render();
  });
  // Type radios
  containerEl.querySelectorAll('input[name="hero-type"]').forEach((r) => {
    r.addEventListener('change', (e) => {
      state.draft.meta.type = e.target.value;
      state.draft.meta.role = e.target.value === 'soul' ? 'Hồn Tướng' : 'Võ Tướng';
      if (e.target.value === 'soul') state.draft.meta.quality = 'UR';
      render();
    });
  });
  // Meta fields
  containerEl.querySelectorAll('[data-meta]').forEach((el) => {
    el.addEventListener('input', () => {
      state.draft.meta[el.dataset.meta] = el.value;
      refreshJson();
    });
  });
  // Slot fields (no level)
  containerEl.querySelectorAll('[data-slot][data-field]:not([data-level])').forEach((el) => {
    el.addEventListener('input', () => {
      const key = el.dataset.slot;
      const field = el.dataset.field;
      state.draft.slots[key] = state.draft.slots[key] ?? {};
      state.draft.slots[key][field] = el.value;
      refreshJson();
    });
  });
  // Huyễn Vũ stages
  containerEl.querySelectorAll('[data-stage]').forEach((el) => {
    el.addEventListener('input', () => {
      const stageName = el.dataset.stage;
      state.draft.slots.huyen_vu = state.draft.slots.huyen_vu ?? { name: '', stages: {} };
      state.draft.slots.huyen_vu.stages = state.draft.slots.huyen_vu.stages ?? {};
      state.draft.slots.huyen_vu.stages[stageName] = el.value;
      refreshJson();
    });
  });
  // Slot fields (level)
  containerEl.querySelectorAll('[data-slot][data-level][data-field]').forEach((el) => {
    el.addEventListener('input', () => {
      const key = el.dataset.slot;
      const level = Number(el.dataset.level);
      const field = el.dataset.field;
      state.draft.slots[key] = state.draft.slots[key] ?? {};
      state.draft.slots[key][level] = state.draft.slots[key][level] ?? {};
      state.draft.slots[key][level][field] = el.value;
      refreshJson();
    });
  });
  // Shared names (Mệnh Hồn Đỏ)
  containerEl.querySelectorAll('[data-shared]').forEach((el) => {
    el.addEventListener('input', () => {
      state.draft.sharedNames[el.dataset.shared] = el.value;
      refreshJson();
    });
  });
  containerEl.querySelectorAll('[data-action="pick-icon"]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = findIconFileInput(button.dataset.slot, button.dataset.level);
      input?.click();
    });
  });
  containerEl.querySelectorAll('[data-icon-file]').forEach((input) => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      await setIconFile(input.dataset.slot, input.dataset.level, file);
    });
  });
  containerEl.querySelectorAll('[data-icon-picker]').forEach((picker) => {
    picker.addEventListener('paste', async (event) => {
      const file = imageFromClipboard(event.clipboardData);
      if (!file) return;
      event.preventDefault();
      await setIconFile(picker.dataset.slot, picker.dataset.level, file);
    });
  });
  containerEl.querySelectorAll('[data-icon-crop]').forEach((input) => {
    input.addEventListener('input', () => {
      updateIconCrop(input.dataset.slot, input.dataset.level, input.dataset.iconCrop, input.value);
      updateIconCropPreview(input.closest('[data-icon-picker]'), input.dataset.slot, input.dataset.level);
      refreshJson();
    });
  });

  containerEl.querySelector('[data-action="reload"]').addEventListener('click', () => {
    loadHero(state.heroId);
    render();
  });
  containerEl.querySelector('[data-action="save"]').addEventListener('click', save);
}

function rerenderPicker() {
  // Render lại chỉ khối picker, không reset toàn bộ form
  const wrap = containerEl.querySelector('.hero-editor__top');
  if (!wrap) return;
  const html = renderHeroPicker(state.heroId, state.query);
  wrap.querySelector('.hero-picker').outerHTML = html;
  // Rebind picker events
  containerEl.querySelector('[data-action="search-hero"]').addEventListener('input', (e) => {
    state.query = e.target.value;
    rerenderPicker();
  });
  containerEl.querySelector('[data-action="pick-hero"]').addEventListener('change', (e) => {
    loadHero(e.target.value);
    render();
  });
}

function refreshJson() {
  const hero = getHeroById(state.heroId);
  const json = containerEl.querySelector('[data-bind="json"]');
  if (json) json.textContent = JSON.stringify(buildEntity(hero), null, 2);
}

function findIconFileInput(slotKey, level = '') {
  const levelSelector = level ? `[data-level="${CSS.escape(String(level))}"]` : ':not([data-level])';
  return containerEl.querySelector(`[data-icon-file][data-slot="${CSS.escape(slotKey)}"]${levelSelector}`);
}

async function setIconFile(slotKey, level = '', file) {
  if (!slotKey || !file?.type?.startsWith('image/')) return;
  const path = suggestIconPath(slotKey, level, file);
  const key = iconKey(slotKey, level);
  const old = state.pendingIcons.get(key);
  if (old?.previewUrl) URL.revokeObjectURL(old.previewUrl);

  state.pendingIcons.set(key, {
    blob: file,
    path,
    previewUrl: URL.createObjectURL(file),
  });

  setSlotIconPath(slotKey, level, path);
  render();
  setStatus(`Đã nhận icon ${path}. Bấm Lưu vào JSON để ghi file.`);
}

function setSlotIconPath(slotKey, level = '', path) {
  if (level) {
    const lv = Number(level);
    state.draft.slots[slotKey] = state.draft.slots[slotKey] ?? {};
    state.draft.slots[slotKey][lv] = state.draft.slots[slotKey][lv] ?? {};
    state.draft.slots[slotKey][lv].icon = path;
    return;
  }
  state.draft.slots[slotKey] = state.draft.slots[slotKey] ?? {};
  state.draft.slots[slotKey].icon = path;
}

function updateIconCrop(slotKey, level = '', field, value) {
  const data = getSlotDraft(slotKey, level, true);
  const crop = getIconCrop(data);
  if (field === 'x') crop.x = Number(value);
  if (field === 'y') crop.y = Number(value);
  if (field === 'zoom') crop.zoom = Number(value);
  data.avatar = cropToAvatar(crop);
}

function updateIconCropPreview(picker, slotKey, level = '') {
  const data = getSlotDraft(slotKey, level, false);
  const crop = getIconCrop(data);
  const img = picker?.querySelector('.admin-skill-icon__button img');
  if (img) img.setAttribute('style', iconStyleFromCrop(crop));

  const xLabel = picker?.querySelector('[data-icon-crop-label="x"]');
  const yLabel = picker?.querySelector('[data-icon-crop-label="y"]');
  const zoomLabel = picker?.querySelector('[data-icon-crop-label="zoom"]');
  if (xLabel) xLabel.textContent = `Vị trí X: ${crop.x}%`;
  if (yLabel) yLabel.textContent = `Vị trí Y: ${crop.y}%`;
  if (zoomLabel) zoomLabel.textContent = `Phóng: ${crop.zoom.toFixed(2)}x`;
}

function getSlotDraft(slotKey, level = '', create = false) {
  if (level) {
    const lv = Number(level);
    if (create) {
      state.draft.slots[slotKey] = state.draft.slots[slotKey] ?? {};
      state.draft.slots[slotKey][lv] = state.draft.slots[slotKey][lv] ?? {};
    }
    return state.draft.slots[slotKey]?.[lv] ?? {};
  }
  if (create) state.draft.slots[slotKey] = state.draft.slots[slotKey] ?? {};
  return state.draft.slots[slotKey] ?? {};
}

function getIconCrop(data = {}) {
  const avatar = data.avatar ?? {};
  const [rawX = '50%', rawY = '50%'] = String(avatar.objectPosition ?? '50% 50%').split(/\s+/);
  return {
    x: clampPercent(Number.parseFloat(rawX), 50),
    y: clampPercent(Number.parseFloat(rawY), 50),
    zoom: clamp(Number(avatar.zoom ?? 1), 0.8, 3, 1),
  };
}

function cropToAvatar(crop) {
  const avatar = {
    objectPosition: `${Math.round(crop.x)}% ${Math.round(crop.y)}%`,
  };
  if (Number(crop.zoom) !== 1) avatar.zoom = Number(Number(crop.zoom).toFixed(2));
  return avatar;
}

function iconPreviewStyle(data = {}) {
  const crop = getIconCrop(data);
  return ` style="${escapeAttr(iconStyleFromCrop(crop))}"`;
}

function iconStyleFromCrop(crop) {
  const parts = [`object-position:${crop.x}% ${crop.y}%`];
  if (crop.zoom !== 1) {
    parts.push(`transform:scale(${crop.zoom})`);
    parts.push(`transform-origin:${crop.x}% ${crop.y}%`);
  }
  return parts.join(';');
}

function clampPercent(value, fallback) {
  return Math.round(clamp(value, 0, 100, fallback));
}

function clamp(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function imageFromClipboard(clipboardData) {
  const items = [...(clipboardData?.items ?? [])];
  const imageItem = items.find((item) => item.kind === 'file' && item.type.startsWith('image/'));
  return imageItem?.getAsFile() ?? null;
}

function suggestIconPath(slotKey, level = '', file) {
  const heroId = state.heroId || 'hero';
  const suffix = level ? `${slotKey}-${level}` : slotKey;
  const ext = extensionFromFile(file);
  return `/assets/skill-icons/${slugify(`${heroId}-${suffix}`)}.${ext}`;
}

function extensionFromFile(file) {
  const byType = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  if (byType[file.type]) return byType[file.type];
  const match = file.name?.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : 'png';
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function iconKey(slotKey, level = '') {
  return `${slotKey}:${level || ''}`;
}

function buildEntity(hero) {
  const meta = state.draft.meta;
  const id = hero?.id;
  const out = { id };
  // Theo thứ tự giống file mẫu
  if (meta.title?.trim()) out.title = meta.title.trim();
  out.name = meta.name?.trim() ?? '';
  if (meta.name_cn?.trim()) out.name_cn = meta.name_cn.trim();
  out.type = meta.type;
  out.country = meta.country;
  out.faction = meta.faction || factionFromCountry(meta.country);
  out.role = meta.type === 'soul' ? 'Hồn Tướng' : 'Võ Tướng';
  out.profession = meta.profession || 'Chưa rõ';
  out.quality = meta.type === 'soul' ? 'UR' : meta.quality;
  out.image = meta.image;
  out.description = meta.description;
  out.skills = buildSkills(id);
  if (meta.type === 'soul' && meta.releaseDate) out.releaseDate = meta.releaseDate;
  // Giữ các cấu hình ảnh không quản lý trong form này (tránh mất khi lưu).
  if (hero?.avatar) out.avatar = hero.avatar;
  if (hero?.avatarDetail) out.avatarDetail = hero.avatarDetail;
  if (hero?.huyenVu) out.huyenVu = hero.huyenVu;
  return out;
}

function factionFromCountry(country) {
  return COUNTRIES.find((c) => c.id === country)?.label ?? '';
}

function buildSkills(heroId) {
  const slots = getSlotsForType(state.draft.meta.type);
  const out = [];
  for (const slot of slots) {
    if (slot.huyenVu) {
      const data = state.draft.slots.huyen_vu;
      if (!data) continue;
      const stages = data.stages ?? {};
      const parts = [];
      for (const stageName of HUYEN_VU_STAGES) {
        const body = (stages[stageName] ?? '').trim();
        if (body) parts.push(`**${stageName}**: ${body}`);
      }
      if (!parts.length) continue;
      out.push({
        id: `${heroId}_huyen_vu`,
        name: `Huyễn Vũ — ${(data.name ?? '').trim()}`.replace(/—\s*$/, '').trim(),
        type: 'passive',
        cooldown: null,
        ...skillIconField(data),
        description: parts.join('\n\n'),
      });
      continue;
    }
    if (!slot.levels) {
      const data = state.draft.slots[slot.key];
      if (!data || !data.description?.trim()) continue;
      const idSuffix = slot.key === 'duyen_phan' && state.draft.meta.type === 'normal' ? 'duyen_phan' : slot.key;
      out.push({
        id: `${heroId}_${idSuffix}`,
        name: `${slot.namePrefix ?? ''}${data.name ?? ''}`.trim(),
        type: defaultSkillType(slot.key),
        cooldown: null,
        ...skillIconField(data),
        description: data.description ?? '',
      });
    } else {
      const sharedBase = slot.sharedName ? state.draft.sharedNames[slot.key] ?? '' : null;
      const sharedIconData =
        slot.key === 'vo_song' || slot.key === 'menh_hon_do' ? state.draft.slots[slot.key] ?? null : null;
      const firstIconLevel = sharedIconData
        ? slot.levels.find((lv) => (state.draft.slots[slot.key] ?? {})[lv]?.description?.trim())
        : null;
      for (const lv of slot.levels) {
        const data = (state.draft.slots[slot.key] ?? {})[lv];
        if (!data || !data.description?.trim()) continue;
        let name;
        if (slot.nameTemplate) name = slot.nameTemplate(lv, sharedBase);
        else name = `${slot.namePrefix ?? ''}${data.name ?? ''}`.trim();
        if (slot.hasHoPhap && data.hoPhap) name = `${name} (Hộ pháp: ${data.hoPhap})`;
        out.push({
          id: `${heroId}_${slot.key}_${lv}`,
          name,
          type: defaultSkillType(slot.key),
          cooldown: null,
          ...skillIconField(sharedIconData && lv === firstIconLevel ? sharedIconData : data),
          description: data.description ?? '',
        });
      }
    }
  }
  return out;
}

function defaultSkillType(slotKey) {
  if (slotKey === 'pho_cong' || slotKey === 'no_cong' || slotKey === 'long_hon_ky') return 'active';
  if (slotKey.startsWith('bi_dong') || slotKey === 'huyen_vu' || slotKey === 'duyen_phan') return 'passive';
  return 'ultimate';
}

function skillIconField(data) {
  const icon = data?.icon?.trim();
  if (!icon) return {};
  const out = { icon };
  if (data.avatar) out.avatar = data.avatar;
  return out;
}

async function writePendingIcons() {
  for (const item of state.pendingIcons.values()) {
    await writeBinary(item.path, item.blob);
  }
  clearPendingIcons();
}

function downloadPendingIcons() {
  for (const item of state.pendingIcons.values()) {
    downloadBlob(item.path.split('/').pop(), item.blob);
  }
  clearPendingIcons();
}

function clearPendingIcons() {
  for (const item of state.pendingIcons.values()) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  }
  state.pendingIcons.clear();
}

async function save() {
  const hero = getHeroById(state.heroId);
  if (!hero) return;
  const filename = getHeroFileName(hero.id);
  const updated = buildEntity(hero);

  try {
    if (supportsFsAccess()) {
      if (!hasRoot()) {
        setStatus('Đang chờ chọn thư mục dự án...');
        try {
          await pickRoot();
        } catch {
          setStatus(`Bạn chưa chọn thư mục. Đã tải ${filename} về thay vào đó.`);
          downloadPendingIcons();
          downloadJson(filename, updated);
          return;
        }
      }
      await writePendingIcons();
      await writeJson('heroes', filename, updated);
      setStatus(`Đã lưu data/heroes/${filename}. F5 trang Võ tướng để thấy thay đổi.`);
      Object.assign(hero, updated);
    } else {
      downloadPendingIcons();
      downloadJson(filename, updated);
      setStatus(`Trình duyệt không hỗ trợ ghi trực tiếp. Đã tải ${filename}.`);
    }
  } catch (err) {
    setStatus(`Lỗi lưu: ${err.message}`);
  }
}

function setStatus(text) {
  state.status = text;
  const el = containerEl.querySelector('[data-bind="status"]');
  if (el) el.textContent = text;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}
