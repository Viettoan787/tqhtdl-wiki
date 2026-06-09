import fs from 'node:fs';
import path from 'node:path';

const heroDir = path.join(process.cwd(), 'data', 'heroes');

// id -> [danh hiệu (title), tên gốc (name)]
// Himura Kenshin (collab) giữ nguyên tên đầy đủ, không tách title.
const soulTitles = {
  phuong_nghi_vuong_nguyen_co: ['Phượng Nghi', 'Vương Nguyên Cơ'],
  than_uy_ma_sieu: ['Thần Uy', 'Mã Siêu'],
  ngu_hoang_ton_quyen: ['Ngự Hoàng', 'Tôn Quyền'],
  chieu_lam_tao_phi: ['Chiêu Lâm', 'Tào Phi'],
  hao_lan_khuong_duy: ['Hạo Lân', 'Khương Duy'],
  duc_ninh_lu_linh_khoi: ['Dực Ninh', 'Lữ Linh Khởi'],
  vong_thu_thai_van_co: ['Vọng Thư', 'Thái Văn Cơ'],
  chieu_hanh_luc_ton: ['Chiêu Hành', 'Lục Tốn'],
  ban_cuc_tao_nhan: ['Bàn Cực', 'Tào Nhân'],
  dich_than_gia_cat_luong: ['Dịch Thần', 'Gia Cát Lượng'],
  quan_dao_dai_kieu: ['Quân Dao', 'Đại Kiều'],
  thuong_lan_quan_vu: ['Thương Lan', 'Quan Vũ'],
  trach_van_hoa_da: ['Trạch Vân', 'Hoa Đà'],
  cuong_quy_tu_ma_y: ['Cuống Quỷ', 'Tư Mã Ý'],
  lam_duc_luu_bi: ['Lẫm Dục', 'Lưu Bị'],
  minh_u_dieu_thuyen: ['Minh U', 'Điêu Thuyền'],
  huyen_minh_ton_sach: ['Huyên Minh', 'Tôn Sách'],
  han_tuyet_truong_lieu: ['Hãn Tuyết', 'Trương Liêu'],
  trong_minh_truong_phi: ['Trọng Minh', 'Trương Phi'],
  luu_hong_quach_gia: ['Lưu Hồng', 'Quách Gia'],
  huyen_uyen_lu_bo: ['Huyền Uyên', 'Lữ Bố'],
  than_mong_ta_tu: ['Thận Mộng', 'Tả Từ'],
  dan_linh_ton_thuong_huong: ['Đan Linh', 'Tôn Thượng Hương'],
  xich_diem_chu_du: ['Xích Diễm', 'Chu Du'],
  hao_nhan_tao_thao: ['Hào Nhận', 'Tào Tháo'],
  loi_dinh_trieu_van: ['Lôi Đình', 'Triệu Vân'],
};

let updated = 0;
const missing = [];

for (const [id, [title, baseName]] of Object.entries(soulTitles)) {
  const fullPath = path.join(heroDir, `${id}.json`);
  if (!fs.existsSync(fullPath)) {
    missing.push(id);
    continue;
  }
  const hero = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  hero.title = title;
  hero.name = baseName;
  fs.writeFileSync(fullPath, `${JSON.stringify(hero, null, 2)}\n`, 'utf8');
  updated += 1;
}

console.log(JSON.stringify({ updated, missing }, null, 2));
