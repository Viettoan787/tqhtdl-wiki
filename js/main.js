/**
 * App entry - Tam Quốc Wiki portal.
 */

import { loadData } from './data/loader.js';
import { initEffectPopup, hideEffectPopup } from './components/effectPopup.js';
import { initPetGrid } from './components/petGrid.js';
import {
  bindHeroListPage,
  renderAboutPage,
  renderHeroDetailPage,
  renderHeroListPage,
  renderHomePage,
  renderPetPage,
  renderPlaceholderPage,
} from './components/wikiPages.js';

let appEl = null;
let sidebarEl = null;
let sidebarBackdropEl = null;
let sidebarToggleEl = null;

async function init() {
  appEl = document.getElementById('app');
  sidebarEl = document.getElementById('wiki-sidebar');
  sidebarBackdropEl = document.getElementById('sidebar-backdrop');
  sidebarToggleEl = document.getElementById('sidebar-toggle');

  try {
    await loadData();
    initEffectPopup();
    bindShellEvents();
    renderCurrentRoute();
  } catch (err) {
    console.error(err);
    if (appEl) {
      appEl.innerHTML = `
        <section class="wiki-block empty-state">
          <h1>Lỗi tải dữ liệu</h1>
          <p>${escapeHtml(err.message)}. Hãy chạy qua local server, không mở file trực tiếp bằng file://.</p>
        </section>
      `;
    }
  }
}

function bindShellEvents() {
  sidebarToggleEl?.addEventListener('click', openSidebar);
  document.getElementById('sidebar-close')?.addEventListener('click', closeSidebar);
  sidebarBackdropEl?.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSidebar();
  });

  document.getElementById('wiki-search')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('wiki-search-input');
    const value = input?.value?.trim() ?? '';
    window.location.hash = value ? `heroes?search=${encodeURIComponent(value)}` : 'heroes';
    closeSidebar();
  });

  window.addEventListener('hashchange', renderCurrentRoute);

  sidebarEl?.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', closeSidebar);
  });
}

function renderCurrentRoute() {
  if (!appEl) return;

  hideEffectPopup();
  const route = parseRoute();
  let html = '';

  if (route.name === 'home') {
    html = renderHomePage();
  } else if (route.name === 'admin') {
    mountAdmin(route);
    return;
  } else if (route.name === 'heroes' && route.id) {
    html = renderHeroDetailPage(route.id);
  } else if (route.name === 'heroes') {
    html = renderHeroListPage(route.params);
  } else if (route.name === 'pets') {
    html = renderPetPage();
  } else if (route.name === 'thien-linh') {
    html = renderPlaceholderPage('Thiện Linh', 'Danh mục Thiện Linh sẽ được bổ sung khi có dữ liệu chuẩn.');
  } else if (route.name === 'than-binh') {
    html = renderPlaceholderPage('Thần Binh', 'Khu vực tra cứu Thần Binh, chỉ số và ghi chú sử dụng.');
  } else if (route.name === 'events') {
    html = renderPlaceholderPage('Sự Kiện', 'Nơi tổng hợp bài đăng về sự kiện, cập nhật và lịch ghi chú trong game.');
  } else if (route.name === 'features') {
    html = renderPlaceholderPage('Các tính năng khác', 'Khu vực dành cho các hệ thống phụ trợ chưa tách thành mục riêng.');
  } else if (route.name === 'about') {
    html = renderAboutPage();
  } else {
    html = renderHomePage();
  }

  appEl.innerHTML = html;
  bindRouteEvents(route);
  updateActiveNav(route.name);
  appEl.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function bindRouteEvents(route) {
  if (!appEl) return;

  if (route.name === 'heroes' && !route.id) {
    bindHeroListPage(appEl);
  }

  if (route.name === 'pets') {
    initPetGrid(appEl.querySelector('#pet-grid'));
  }
}

function mountAdmin(route) {
  if (!appEl) return;
  appEl.innerHTML = '<p class="wiki-loading">Đang tải công cụ admin...</p>';
  updateActiveNav('admin');
  import('./admin/adminApp.js')
    .then((m) => m.mountAdmin(appEl, route))
    .catch((err) => {
      console.error(err);
      appEl.innerHTML = `
        <section class="wiki-block empty-state">
          <h1>Không tải được công cụ admin</h1>
          <p>${escapeHtml(err.message)}</p>
        </section>
      `;
    });
}

function parseRoute() {
  const rawHash = window.location.hash.replace(/^#/, '') || 'home';
  const [pathPart, queryPart = ''] = rawHash.split('?');
  const parts = pathPart.split('/').filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(queryPart));

  return {
    name: parts[0] || 'home',
    id: parts[1] ? decodeURIComponent(parts[1]) : null,
    params,
  };
}

function updateActiveNav(routeName) {
  document.querySelectorAll('[data-nav-route]').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.navRoute === routeName);
  });
}

function openSidebar() {
  sidebarEl?.classList.add('is-open');
  sidebarBackdropEl?.classList.remove('hidden');
  sidebarToggleEl?.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
  sidebarEl?.classList.remove('is-open');
  sidebarBackdropEl?.classList.add('hidden');
  sidebarToggleEl?.setAttribute('aria-expanded', 'false');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', init);
