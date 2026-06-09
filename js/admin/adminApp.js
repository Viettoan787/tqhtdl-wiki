/**
 * Admin entry — route #admin (ẩn khỏi sidebar).
 */

import { mountAvatarEditor } from './avatarEditor.js';
import { mountHeroEditor } from './heroEditor.js';

export function mountAdmin(appEl, route) {
  const sub = route?.id ?? 'hero';
  appEl.innerHTML = `
    <section class="admin-shell">
      <header class="admin-shell__header">
        <p class="portal-eyebrow">Công cụ admin (nội bộ)</p>
        <h1>Quản trị dữ liệu</h1>
        <p class="muted-copy">
          Chạy local. Chỉnh sửa được lưu thẳng vào thư mục <code>data/</code> qua
          File System Access API. Trình duyệt sẽ hỏi quyền truy cập thư mục dự án lần đầu lưu.
        </p>
        <nav class="admin-shell__nav">
          <a href="#admin/hero" class="${sub === 'hero' ? 'is-active' : ''}">Tướng (metadata + kỹ năng)</a>
          <a href="#admin/avatar" class="${sub === 'avatar' ? 'is-active' : ''}">Avatar (crop/zoom)</a>
        </nav>
      </header>
      <div id="admin-body"></div>
    </section>
  `;

  const body = appEl.querySelector('#admin-body');
  if (sub === 'avatar') mountAvatarEditor(body);
  else mountHeroEditor(body);
}
