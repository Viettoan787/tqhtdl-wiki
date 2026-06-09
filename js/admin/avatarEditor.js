/**
 * Avatar editor: chỉnh objectPosition + zoom cho ảnh tướng,
 * preview thẻ nhỏ ngay, lưu vào file JSON tướng.
 */

import { getHeroes, getHeroById, getHeroFileName } from '../data/loader.js';
import { downloadJson, hasRoot, pickRoot, supportsFsAccess, writeJson } from './fsStore.js';
import { renderHeroPicker } from './heroPicker.js';

let containerEl = null;
let state = {
  heroId: null,
  query: '',
  // 'list' (avatar), 'detail' (avatarDetail), 'huyenVu' (huyenVu.avatar + huyenVu.image)
  target: 'list',
  posX: 50,
  posY: 30,
  zoom: 1.2,
  huyenVuImage: '', // chỉ dùng khi target = 'huyenVu'
  status: '',
};

export function mountAvatarEditor(el) {
  containerEl = el;
  const heroes = getHeroes();
  if (!heroes.length) {
    containerEl.innerHTML = '<p class="muted-copy">Chưa có dữ liệu tướng để chỉnh.</p>';
    return;
  }
  state.heroId = state.heroId ?? heroes[0].id;
  loadHeroIntoState(state.heroId);
  render();
}

function loadHeroIntoState(heroId) {
  const hero = getHeroById(heroId);
  state.heroId = heroId;
  let avatar;
  if (state.target === 'detail') avatar = hero?.avatarDetail ?? {};
  else if (state.target === 'huyenVu') avatar = hero?.huyenVu?.avatar ?? {};
  else avatar = hero?.avatar ?? {};
  const [px, py] = parseObjectPosition(avatar.objectPosition);
  state.posX = px;
  state.posY = py;
  state.zoom = Number(avatar.zoom) || 1;
  state.huyenVuImage = hero?.huyenVu?.image ?? '';
}

function parseObjectPosition(value) {
  if (!value) return [50, 30];
  const parts = String(value).trim().split(/\s+/);
  const x = Number(String(parts[0] ?? '50').replace('%', '')) || 50;
  const y = Number(String(parts[1] ?? '30').replace('%', '')) || 30;
  return [x, y];
}

function buildAvatarObject() {
  const objectPosition = `${round(state.posX)}% ${round(state.posY)}%`;
  const zoom = round(state.zoom, 2);
  if (zoom === 1 && objectPosition === '50% 50%') return null;
  const out = { objectPosition };
  if (zoom !== 1) out.zoom = zoom;
  return out;
}

/** Trả về URL ảnh đang được preview/áp dụng theo target. */
function getActiveImageSrc(hero) {
  if (state.target === 'huyenVu') return state.huyenVuImage || '';
  return hero?.image ?? '';
}

function round(n, digits = 0) {
  const f = 10 ** digits;
  return Math.round(Number(n) * f) / f;
}

function render() {
  const hero = getHeroById(state.heroId);
  const fsBtn = supportsFsAccess()
    ? `<button type="button" data-action="pick-root" class="admin-btn admin-btn--secondary">${
        hasRoot() ? 'Đã chọn thư mục dự án ✓' : 'Chọn thư mục dự án'
      }</button>`
    : '<span class="muted-copy">Trình duyệt không hỗ trợ ghi trực tiếp — sẽ tải file về.</span>';

  containerEl.innerHTML = `
    <div class="avatar-editor">
      <aside class="avatar-editor__side">
        <div class="admin-field">
          <span>Tướng</span>
          ${renderHeroPicker(state.heroId, state.query)}
        </div>

        <div class="admin-field">
          <span>Áp dụng cho</span>
          <div class="avatar-editor__target">
            <label><input type="radio" name="avatar-target" value="list" ${state.target === 'list' ? 'checked' : ''}/> Thẻ danh sách</label>
            <label><input type="radio" name="avatar-target" value="detail" ${state.target === 'detail' ? 'checked' : ''}/> Trang chi tiết</label>
            <label><input type="radio" name="avatar-target" value="huyenVu" ${state.target === 'huyenVu' ? 'checked' : ''}/> Ảnh Huyễn Vũ</label>
          </div>
          ${
            state.target === 'huyenVu'
              ? `<label class="avatar-editor__huyen-vu-image-field">
                   <span>Đường dẫn ảnh Huyễn Vũ</span>
                   <input type="text" data-action="set-hv-image" value="${escapeAttr(state.huyenVuImage)}" placeholder="/assets/huyen-vu/long-xa-trien-duc.png" />
                 </label>`
              : ''
          }
        </div>

        <label class="admin-field">
          <span>Vị trí ngang (object-position X): <strong data-bind="posX">${state.posX}%</strong></span>
          <input type="range" min="0" max="100" step="1" data-action="set-posX" value="${state.posX}" />
        </label>

        <label class="admin-field">
          <span>Vị trí dọc (object-position Y): <strong data-bind="posY">${state.posY}%</strong></span>
          <input type="range" min="0" max="100" step="1" data-action="set-posY" value="${state.posY}" />
        </label>

        <label class="admin-field">
          <span>Zoom: <strong data-bind="zoom">${state.zoom}</strong>×</span>
          <input type="range" min="1" max="8" step="0.05" data-action="set-zoom" value="${state.zoom}" />
        </label>

        <div class="admin-actions">
          <button type="button" data-action="reset" class="admin-btn admin-btn--ghost">Đặt lại</button>
          ${fsBtn}
          <button type="button" data-action="save" class="admin-btn admin-btn--primary">Lưu vào JSON</button>
        </div>

        <p class="admin-status" data-bind="status">${escapeHtml(state.status)}</p>

        <details class="admin-json">
          <summary>Xem JSON sẽ ghi</summary>
          <pre data-bind="json">${escapeHtml(buildJsonPreview(hero))}</pre>
        </details>
      </aside>

      <div class="avatar-editor__preview">
        <div class="avatar-editor__panel">
          <h3>Khung gốc (4/5)</h3>
          <div class="avatar-editor__big" data-preview-big>
            ${renderImg(hero, 'big')}
          </div>
        </div>
        <div class="avatar-editor__panel">
          <h3>Thẻ trong danh sách</h3>
          <a class="hero-directory-card" style="pointer-events:none;max-width:11rem;">
            <span class="hero-directory-card__image-wrap" data-preview-card>
              ${renderImg(hero, 'card')}
            </span>
            <span class="hero-directory-card__label">
              ${hero.title ? `<span class="hero-directory-card__title">${escapeHtml(hero.title)}</span>` : ''}
              <span class="hero-directory-card__name">${escapeHtml(hero.name)}</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function renderImg(hero) {
  const src = getActiveImageSrc(hero);
  if (!src) {
    return '<div class="muted-copy" style="padding:1rem;text-align:center;">Chưa có ảnh — nhập đường dẫn ảnh Huyễn Vũ ở trên.</div>';
  }
  const style = `object-position:${state.posX}% ${state.posY}%;transform:scale(${state.zoom});transform-origin:${state.posX}% ${state.posY}%;`;
  return `<img src="${escapeAttr(src)}" alt="${escapeAttr(fullName(hero))}" style="${style}" />`;
}

function bindEvents() {
  containerEl.querySelector('[data-action="search-hero"]').addEventListener('input', (e) => {
    state.query = e.target.value;
    render();
  });
  containerEl.querySelector('[data-action="pick-hero"]').addEventListener('change', (e) => {
    loadHeroIntoState(e.target.value);
    render();
  });
  containerEl.querySelectorAll('input[name="avatar-target"]').forEach((r) => {
    r.addEventListener('change', (e) => {
      state.target = e.target.value;
      loadHeroIntoState(state.heroId);
      render();
    });
  });
  const hvImageInput = containerEl.querySelector('[data-action="set-hv-image"]');
  if (hvImageInput) {
    hvImageInput.addEventListener('input', (e) => {
      state.huyenVuImage = e.target.value;
      updatePreviews();
    });
  }
  containerEl.querySelector('[data-action="set-posX"]').addEventListener('input', (e) => {
    state.posX = Number(e.target.value);
    updatePreviews();
  });
  containerEl.querySelector('[data-action="set-posY"]').addEventListener('input', (e) => {
    state.posY = Number(e.target.value);
    updatePreviews();
  });
  containerEl.querySelector('[data-action="set-zoom"]').addEventListener('input', (e) => {
    state.zoom = Number(e.target.value);
    updatePreviews();
  });
  containerEl.querySelector('[data-action="reset"]').addEventListener('click', () => {
    state.posX = 50;
    state.posY = 30;
    state.zoom = 1.2;
    render();
  });

  const pickBtn = containerEl.querySelector('[data-action="pick-root"]');
  if (pickBtn) {
    pickBtn.addEventListener('click', async () => {
      try {
        await pickRoot();
        setStatus('Đã chọn thư mục dự án.');
        render();
      } catch (err) {
        setStatus(`Lỗi chọn thư mục: ${err.message}`);
      }
    });
  }

  containerEl.querySelector('[data-action="save"]').addEventListener('click', save);
}

function updatePreviews() {
  const hero = getHeroById(state.heroId);
  containerEl.querySelector('[data-bind="posX"]').textContent = `${state.posX}%`;
  containerEl.querySelector('[data-bind="posY"]').textContent = `${state.posY}%`;
  containerEl.querySelector('[data-bind="zoom"]').textContent = round(state.zoom, 2);
  containerEl.querySelector('[data-preview-big]').innerHTML = renderImg(hero);
  containerEl.querySelector('[data-preview-card]').innerHTML = renderImg(hero);
  const json = containerEl.querySelector('[data-bind="json"]');
  if (json) json.textContent = buildJsonPreview(hero);
}

async function save() {
  const hero = getHeroById(state.heroId);
  if (!hero) return;
  const filename = getHeroFileName(hero.id);
  const updated = mergeAvatar(hero);

  try {
    if (supportsFsAccess()) {
      if (!hasRoot()) {
        setStatus('Đang chờ bạn chọn thư mục dự án...');
        try {
          await pickRoot();
        } catch (err) {
          setStatus(`Bạn chưa chọn thư mục. Đã tải ${filename} về thay vào đó.`);
          downloadJson(filename, updated);
          return;
        }
      }
      await writeJson('heroes', filename, updated);
      setStatus(`Đã lưu data/heroes/${filename}. F5 trang Võ tướng để thấy thay đổi.`);
      Object.assign(hero, updated);
      render(); // cập nhật trạng thái nút "Đã chọn thư mục ✓"
    } else {
      downloadJson(filename, updated);
      setStatus(`Trình duyệt không hỗ trợ ghi trực tiếp. Đã tải ${filename} — hãy thay file trong data/heroes/.`);
      Object.assign(hero, updated);
    }
  } catch (err) {
    setStatus(`Lỗi lưu: ${err.message}`);
  }
}

function mergeAvatar(hero) {
  const avatar = buildAvatarObject();
  const next = { ...hero };

  if (state.target === 'huyenVu') {
    const image = (state.huyenVuImage ?? '').trim();
    if (!image && !avatar) {
      // Không có ảnh và không có cấu hình crop -> bỏ hẳn huyenVu.
      delete next.huyenVu;
      return next;
    }
    const hv = {};
    if (image) hv.image = image;
    if (avatar) hv.avatar = avatar;
    next.huyenVu = hv;
    return next;
  }

  const field = state.target === 'detail' ? 'avatarDetail' : 'avatar';
  if (avatar) next[field] = avatar;
  else delete next[field];
  return next;
}

function buildJsonPreview(hero) {
  return JSON.stringify(mergeAvatar(hero), null, 2);
}

function setStatus(text) {
  state.status = text;
  const el = containerEl.querySelector('[data-bind="status"]');
  if (el) el.textContent = text;
}

function fullName(h) {
  return h.title ? `${h.title} ${h.name}` : h.name;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}
