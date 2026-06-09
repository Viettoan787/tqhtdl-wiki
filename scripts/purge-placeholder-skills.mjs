/**
 * Xóa các skill placeholder bị hỏng dấu (kiểu "Ph? C?ng") khỏi mọi tướng.
 * Chỉ xóa skill có description rỗng, "Mô tả mẫu." hoặc chuỗi placeholder.
 * Skill có dữ liệu thật (Tào Phi, Vương Nguyên Cơ, ...) được giữ nguyên.
 */

import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'data', 'heroes');
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));

function isPlaceholder(skill) {
  const d = (skill.description ?? '').trim();
  if (!d) return true;
  if (d === 'Mô tả mẫu.') return true;
  if (d.includes('dữ liệu chi tiết sẽ được cập nhật sau')) return true;
  return false;
}

let touched = 0;
let removed = 0;

for (const file of manifest) {
  const full = path.join(dir, file);
  const hero = JSON.parse(fs.readFileSync(full, 'utf8'));
  const before = (hero.skills ?? []).length;
  const kept = (hero.skills ?? []).filter((s) => !isPlaceholder(s));
  if (kept.length !== before) {
    hero.skills = kept;
    fs.writeFileSync(full, `${JSON.stringify(hero, null, 2)}\n`, 'utf8');
    touched += 1;
    removed += before - kept.length;
  }
}

console.log(JSON.stringify({ touched, removed }, null, 2));
