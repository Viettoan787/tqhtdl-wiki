/**
 * Lưu file không cần backend.
 * Ưu tiên File System Access API (ghi thẳng vào thư mục dự án),
 * fallback: tạo nội dung để tải/copy thủ công.
 */

let rootHandle = null;

export function supportsFsAccess() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export function hasRoot() {
  return rootHandle != null;
}

/** Người dùng chọn thư mục gốc dự án (chứa thư mục data/). */
export async function pickRoot() {
  if (!supportsFsAccess()) throw new Error('Trình duyệt không hỗ trợ ghi file trực tiếp.');
  rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
  return rootHandle;
}

async function ensurePermission(handle) {
  const opts = { mode: 'readwrite' };
  if ((await handle.queryPermission(opts)) === 'granted') return true;
  return (await handle.requestPermission(opts)) === 'granted';
}

/** Ghi object thành JSON (UTF-8 không BOM, indent 2) vào data/<subdir>/<filename>. */
export async function writeJson(subdir, filename, obj) {
  if (!rootHandle) throw new Error('Chưa chọn thư mục dự án.');
  if (!(await ensurePermission(rootHandle))) throw new Error('Chưa được cấp quyền ghi.');

  const json = `${JSON.stringify(obj, null, 2)}\n`;
  const data = new TextEncoder().encode(json); // UTF-8, không BOM

  const doWrite = async () => {
    const dataDir = await rootHandle.getDirectoryHandle('data');
    const targetDir = await dataDir.getDirectoryHandle(subdir);
    const fileHandle = await targetDir.getFileHandle(filename, { create: true });

    // Ghi đè trực tiếp. Tránh gọi getFile() trước createWritable() vì Chrome/Edge
    // có thể coi snapshot vừa đọc là stale nếu file đã đổi ngoài luồng.
    const writable = await fileHandle.createWritable({ keepExistingData: false });
    await writable.write(data);
    await writable.close();
  };

  try {
    await doWrite();
  } catch (err) {
    const msg = String(err?.message ?? err);
    const stale = /state had changed|state cached|InvalidState/i.test(msg);
    if (!stale) throw err;
    // Đợi một nhịp rồi thử lại đúng 1 lần với handle mới.
    await new Promise((r) => setTimeout(r, 80));
    try {
      await doWrite();
    } catch (err2) {
      throw new Error(
        'Không ghi được file do trình duyệt giữ trạng thái thư mục cũ. ' +
          'Thử bấm lại "Chọn thư mục dự án", hoặc F5 trang rồi chọn lại thư mục project. ' +
          `Chi tiết: ${err2.message ?? err2}`
      );
    }
  }
}

/** Ghi file nhị phân vào một đường dẫn trong project, ví dụ assets/skill-icons/a.png. */
export async function writeBinary(relativePath, blob) {
  if (!rootHandle) throw new Error('Chưa chọn thư mục dự án.');
  if (!(await ensurePermission(rootHandle))) throw new Error('Chưa được cấp quyền ghi.');

  const parts = String(relativePath).replace(/^\/+/, '').split('/').filter(Boolean);
  if (parts.length < 2) throw new Error('Đường dẫn file không hợp lệ.');

  let dir = rootHandle;
  for (const part of parts.slice(0, -1)) {
    dir = await dir.getDirectoryHandle(part, { create: true });
  }

  const fileHandle = await dir.getFileHandle(parts.at(-1), { create: true });
  const writable = await fileHandle.createWritable({ keepExistingData: false });
  await writable.write(blob);
  await writable.close();
}

/** Fallback: tải file JSON về máy. */
export function downloadJson(filename, obj) {
  const json = `${JSON.stringify(obj, null, 2)}\n`;
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
