import { getHeroes, getPets, getHeroById } from '../data/loader.js';
import { renderSkills } from './skillRenderer.js';

const COUNTRIES = [
  { id: 'nguy', label: 'Ngụy' },
  { id: 'thuc', label: 'Thục' },
  { id: 'ngo', label: 'Ngô' },
  { id: 'quan-hung', label: 'Quần Hùng' },
];

const QUALITY_LABELS = {
  R: 'Lương Tướng',
  SR: 'Danh Tướng',
  SSR: 'Thần Tướng',
  UR: 'Hồn Tướng',
};

export function renderHomePage() {
  return `
    <section class="portal-hero portal-hero--articles">
      <div>
        <p class="portal-eyebrow">Cổng thông tin wiki</p>
        <h1>Tam Quốc Chí - Huyễn Tưởng Đại Lục</h1>
        <p>
          Trang chủ được dành cho bài đăng, ghi chú cập nhật, hướng dẫn và các nội dung nổi bật do bạn bổ sung sau này.
          Dữ liệu tra cứu như Võ tướng và Linh Sủng được tách thành từng trang riêng trong menu.
        </p>
      </div>
    </section>

    <div class="portal-grid portal-grid--articles">
      <section class="wiki-block wiki-block--wide">
        <header class="wiki-block__header">
          <h2>Bài đăng mới</h2>
        </header>
        <ul class="portal-article-list">
          <li>
            <a href="#events">Ghi chú cập nhật dữ liệu</a>
            <span>Nơi đăng các thay đổi về dữ liệu, ảnh, kỹ năng và nội dung wiki.</span>
          </li>
          <li>
            <a href="#features">Hướng dẫn hệ thống</a>
            <span>Khu vực dành cho bài viết giải thích các tính năng phụ trong game.</span>
          </li>
          <li>
            <a href="#about">Quy ước nhập liệu wiki</a>
            <span>Ghi chú cách đặt tên, chia file JSON và chuẩn hóa nội dung.</span>
          </li>
        </ul>
      </section>

      <section class="wiki-block">
        <header class="wiki-block__header">
          <h2>Sự Kiện</h2>
          <a href="#events">Mở mục</a>
        </header>
        <ul class="portal-timeline">
          <li><time>04/06/2026</time><span>Trang chủ chuyển sang dạng portal bài viết.</span></li>
          <li><time>29/05/2026</time><span>Bổ sung dữ liệu Linh Sủng và nhóm tướng Thục.</span></li>
          <li><time>29/05/2026</time><span>Chuẩn hóa ảnh và popup mô tả kỹ năng.</span></li>
        </ul>
      </section>

      <section class="wiki-block">
        <header class="wiki-block__header">
          <h2>Bài viết nổi bật</h2>
        </header>
        <ul class="portal-link-list">
          <li><a href="#heroes">Tra cứu Võ tướng</a><span>Danh sách và trang chi tiết riêng.</span></li>
          <li><a href="#pets">Tra cứu Linh Sủng</a><span>Kỹ năng theo cấp sao và popup hiệu ứng.</span></li>
          <li><a href="#features">Các tính năng khác</a><span>Khu vực đang chờ bài viết.</span></li>
        </ul>
      </section>

      <section class="wiki-block wiki-block--wide">
        <header class="wiki-block__header">
          <h2>Ghi chú biên tập</h2>
        </header>
        <p class="muted-copy">
          Các hiệu ứng chung vẫn được giữ trong dữ liệu nền để phục vụ popup trong kỹ năng, nhưng không có trang công khai riêng trên giao diện chính.
        </p>
      </section>
    </div>
  `;
}

export function renderHeroListPage(params = {}) {
  const query = normalize(params.search ?? '');
  const country = params.country ?? 'all';
  const quality = params.quality ?? 'all';
  const profession = params.profession ?? 'all';

  const heroes = getHeroes()
    .filter((hero) => {
      const text = normalize(`${hero.title ?? ''} ${hero.name} ${hero.name_cn ?? ''} ${hero.faction ?? ''} ${hero.profession ?? ''}`);
      if (query && !text.includes(query)) return false;
      if (country !== 'all' && hero.country !== country) return false;
      if (quality !== 'all' && hero.quality !== quality) return false;
      if (profession !== 'all' && hero.profession !== profession) return false;
      return true;
    })
    .sort(compareHeroesForDirectory);

  return `
    <section class="page-heading">
      <p class="portal-eyebrow">Danh mục</p>
      <h1>Võ tướng</h1>
      <p>Tra cứu võ tướng theo phe, phẩm cấp và chức nghiệp. Chọn một thẻ để mở trang chi tiết riêng.</p>
    </section>

    <section class="wiki-block">
      <form class="list-toolbar" data-hero-filter-form>
        <input name="search" type="search" value="${escapeAttr(params.search ?? '')}" placeholder="Tìm theo tên tướng..." />
        <select name="country" aria-label="Lọc theo phe">
          ${renderOptions([{ id: 'all', label: 'Trận doanh' }, ...COUNTRIES], country)}
        </select>
        <select name="quality" aria-label="Lọc theo phẩm">
          ${renderOptions(
            [
              { id: 'all', label: 'Phẩm chất' },
              { id: 'R', label: 'Lương Tướng' },
              { id: 'SR', label: 'Danh Tướng' },
              { id: 'SSR', label: 'Thần Tướng' },
              { id: 'UR', label: 'Hồn Tướng' },
            ],
            quality
          )}
        </select>
        <select name="profession" aria-label="Lọc theo nghề">
          ${renderOptions(getProfessionOptions(), profession)}
        </select>
        <button type="submit">Lọc</button>
      </form>
      <p class="result-count">${heroes.length} võ tướng phù hợp</p>
      <div class="hero-directory-grid">
        ${heroes.length ? heroes.map(renderHeroDirectoryCard).join('') : '<p class="muted-copy">Không tìm thấy võ tướng phù hợp.</p>'}
      </div>
    </section>
  `;
}

export function bindHeroListPage(root) {
  const form = root.querySelector('[data-hero-filter-form]');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const params = new URLSearchParams();

    for (const key of ['search', 'country', 'quality', 'profession']) {
      const value = String(data.get(key) ?? '').trim();
      if (value && value !== 'all') params.set(key, value);
    }

    window.location.hash = `heroes${params.toString() ? `?${params}` : ''}`;
  });
}

export function renderHeroDetailPage(heroId) {
  const hero = getHeroById(heroId);
  if (!hero) {
    return renderEmptyPage('Không tìm thấy tướng', 'Tướng này chưa có trong dữ liệu hoặc đường dẫn chưa đúng.', '#heroes');
  }

  return `
    <nav class="breadcrumb"><a href="#heroes">Võ tướng</a><span>/</span><span>${escapeHtml(fullHeroName(hero))}</span></nav>
    <article class="hero-detail-page">
      <aside class="hero-profile">
        <div class="hero-profile__image-wrap">
          <img src="${escapeAttr(hero.image)}" alt="${escapeAttr(hero.name)}" class="hero-profile__image"${avatarImageStyle(hero, 'detail')} />
        </div>
        ${renderHuyenVuBlock(hero)}
        <dl class="hero-profile__meta">
          <div><dt>Phe</dt><dd>${escapeHtml(hero.faction ?? 'Chưa rõ')}</dd></div>
          <div><dt>Phẩm</dt><dd>${escapeHtml(QUALITY_LABELS[hero.quality] ?? hero.quality ?? 'Chưa rõ')}</dd></div>
          <div><dt>Nghề</dt><dd>${escapeHtml(hero.profession ?? hero.role ?? 'Chưa rõ')}</dd></div>
          ${hero.releaseDate ? `<div><dt>Ra mắt</dt><dd>${escapeHtml(formatReleaseDate(hero.releaseDate))}</dd></div>` : ''}
        </dl>
      </aside>
      <section class="hero-detail-main">
        <header class="page-heading page-heading--compact">
          <p class="portal-eyebrow">${escapeHtml(hero.type === 'soul' ? 'Hồn Tướng' : 'Võ Tướng')}</p>
          ${hero.title ? `<p class="hero-detail-title">${escapeHtml(hero.title)}</p>` : ''}
          <h1>${escapeHtml(hero.name)}</h1>
          ${hero.name_cn ? `<p class="hero-name-cn">${escapeHtml(hero.name_cn)}</p>` : ''}
          <p>${escapeHtml(hero.description ?? '')}</p>
        </header>
        ${renderSkills(hero)}
      </section>
    </article>
  `;
}

export function renderPetPage() {
  const pets = getPets();
  return `
    <section class="page-heading">
      <p class="portal-eyebrow">Danh mục</p>
      <h1>Linh Sủng</h1>
      <p>Kỹ năng xuất chiến, trợ chiến và hiệu ứng theo cấp sao.</p>
    </section>
    <section class="wiki-block">
      <div id="pet-grid"></div>
      ${pets.length ? '' : '<p class="muted-copy">Chưa có dữ liệu Linh Sủng.</p>'}
    </section>
  `;
}

export function renderPlaceholderPage(title, copy) {
  return `
    <section class="page-heading">
      <p class="portal-eyebrow">Đang xây dựng</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(copy)}</p>
    </section>
    <section class="wiki-block">
      <p class="muted-copy">Mục này đã có chỗ trong điều hướng và sẽ được bổ sung dữ liệu ở các lần nhập tiếp theo.</p>
    </section>
  `;
}

export function renderAboutPage() {
  return `
    <section class="page-heading">
      <p class="portal-eyebrow">Thông tin wiki</p>
      <h1>Giới thiệu</h1>
      <p>Website fanmade dùng để ghi chép, tra cứu và Việt hóa dữ liệu game theo cấu trúc dễ mở rộng.</p>
    </section>
    <section class="wiki-block">
      <p class="muted-copy">
        Dữ liệu được chia theo từng nhóm nội dung như Võ tướng, Linh Sủng, Thiện Linh và Thần Binh. Một số dữ liệu nền như hiệu ứng được dùng để hiển thị popup trong nội dung kỹ năng, không cần đưa thành mục công khai riêng.
      </p>
    </section>
  `;
}

function renderEmptyPage(title, copy, backHref) {
  return `
    <section class="wiki-block empty-state">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(copy)}</p>
      <a href="${backHref}">Quay lại</a>
    </section>
  `;
}

function renderHeroDirectoryCard(hero) {
  const thumb = thumbnailFor(hero.image);
  return `
    <a href="#heroes/${escapeAttr(hero.id)}" class="hero-directory-card">
      <span class="hero-directory-card__image-wrap">
        <img src="${escapeAttr(thumb)}" alt="${escapeAttr(fullHeroName(hero))}" loading="lazy" decoding="async" fetchpriority="low"${avatarImageStyle(hero)} />
      </span>
      <span class="hero-directory-card__label">
        ${hero.title ? `<span class="hero-directory-card__title">${escapeHtml(hero.title)}</span>` : ''}
        <span class="hero-directory-card__name">${escapeHtml(hero.name)}</span>
      </span>
    </a>
  `;
}

function thumbnailFor(imagePath) {
  if (!imagePath) return imagePath;
  return String(imagePath).replace('/assets/images/', '/assets/thumbnails/');
}

function avatarImageStyle(hero, mode = 'list') {
  // mode: 'list' dùng hero.avatar, 'detail' dùng hero.avatarDetail (fallback hero.avatar nếu không có),
  //       'huyenVu' dùng hero.huyenVu.avatar.
  let avatar;
  if (mode === 'detail') avatar = hero.avatarDetail ?? hero.avatar;
  else if (mode === 'huyenVu') avatar = hero?.huyenVu?.avatar;
  else avatar = hero.avatar;
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

/** Block ảnh Huyễn Vũ trong aside trang chi tiết tướng (chỉ hiện khi có hero.huyenVu.image). */
function renderHuyenVuBlock(hero) {
  const hv = hero?.huyenVu;
  if (!hv || !hv.image) return '';
  // Lấy tên Huyễn Vũ từ skill huyen_vu nếu có (không lưu lặp ở hero.huyenVu).
  const huyenVuSkill = (hero.skills ?? []).find((s) => s.id?.includes('_huyen_vu'));
  const rawName = huyenVuSkill?.name ?? '';
  const name = rawName.replace(/^Huyễn Vũ\s*[—-]\s*/u, '').trim();
  return `
    <div class="hero-profile__huyen-vu">
      <p class="hero-profile__huyen-vu-label">Huyễn Vũ</p>
      ${name ? `<p class="hero-profile__huyen-vu-name">${escapeHtml(name)}</p>` : ''}
      <div class="hero-profile__huyen-vu-image-wrap">
        <img src="${escapeAttr(hv.image)}" alt="${escapeAttr(name || 'Huyễn Vũ')}" class="hero-profile__huyen-vu-image"${avatarImageStyle(hero, 'huyenVu')} />
      </div>
    </div>
  `;
}

function fullHeroName(hero) {
  return hero.title ? `${hero.title} ${hero.name}` : hero.name;
}

function renderHeroBadge(label, type) {
  if (!label || label === 'Chưa rõ') return '';
  return `<span class="hero-directory-badge hero-directory-badge--${escapeAttr(type)}">${escapeHtml(label)}</span>`;
}

function renderOptions(options, active) {
  return options
    .map((option) => `<option value="${escapeAttr(option.id)}" ${option.id === active ? 'selected' : ''}>${escapeHtml(option.label)}</option>`)
    .join('');
}

function getProfessionOptions() {
  const professions = [...new Set(getHeroes().map((hero) => hero.profession).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'vi')
  );
  return [{ id: 'all', label: 'Chức nghiệp' }, ...professions.map((profession) => ({ id: profession, label: profession }))];
}

function compareHeroesForDirectory(a, b) {
  const qualityCompare = getQualityRank(b.quality) - getQualityRank(a.quality);
  if (qualityCompare !== 0) return qualityCompare;

  const dateA = getReleaseTime(a);
  const dateB = getReleaseTime(b);
  if (dateA !== null && dateB !== null && dateA !== dateB) return dateB - dateA;
  if (dateA !== null && dateB === null) return -1;
  if (dateA === null && dateB !== null) return 1;

  return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'vi', { sensitivity: 'base' });
}

function getQualityRank(quality) {
  const ranks = {
    R: 1,
    SR: 2,
    SSR: 3,
    UR: 4,
  };
  return ranks[quality] ?? 0;
}

function getReleaseTime(hero) {
  const raw =
    hero.releaseDate ??
    hero.release_date ??
    hero.debutDate ??
    hero.debut_date ??
    hero.release ??
    hero.date ??
    null;
  if (!raw) return null;

  const time = new Date(raw).getTime();
  return Number.isNaN(time) ? null : time;
}

function formatReleaseDate(value) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return String(value);

  const date = new Date(time);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
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
