import fs from 'node:fs';
import path from 'node:path';

const heroDir = path.join(process.cwd(), 'data', 'heroes');

const countries = {
  nguy: ['nguy', 'Ngụy'],
  thuc: ['thuc', 'Thục'],
  ngo: ['ngo', 'Ngô'],
  quan: ['quan-hung', 'Quần Hùng'],
  unknown: ['unknown', 'Chưa rõ'],
};

const qualityCodes = {
  'Lương Tướng': 'R',
  'Danh Tướng': 'SR',
  'Thần Tướng': 'SSR',
  'Hồn Tướng': 'UR',
};

const normalHeroes = {
  // Ngụy
  gia_cat_dan: ['Gia Cát Đản', 'Tấn Công', 'Thần Tướng', 'nguy'],
  tuan_uc: ['Tuân Úc', 'Hỗ Trợ', 'Thần Tướng', 'nguy'],
  nhac_tien: ['Nhạc Tiến', 'Tấn Công', 'Thần Tướng', 'nguy'],
  vu_cam: ['Vu Cấm', 'Phòng Thủ', 'Thần Tướng', 'nguy'],
  tu_ma_su: ['Tư Mã Sư', 'Phòng Thủ', 'Thần Tướng', 'nguy'],
  tan_hien_anh: ['Tân Hiến Anh', 'Hỗ Trợ', 'Thần Tướng', 'nguy'],
  tao_thuc: ['Tào Thực', 'Hỗ Trợ', 'Thần Tướng', 'nguy'],
  tao_chuong: ['Tào Chương', 'Phòng Thủ', 'Thần Tướng', 'nguy'],
  tao_phi: ['Tào Phi', 'Hỗ Trợ', 'Thần Tướng', 'nguy'],
  dang_ngai: ['Đặng Ngải', 'Đột Kích', 'Thần Tướng', 'nguy'],
  chung_hoi: ['Chung Hội', 'Phòng Thủ', 'Thần Tướng', 'nguy'],
  tu_ma_y: ['Tư Mã Ý', 'Phòng Thủ', 'Thần Tướng', 'nguy'],
  tao_thao: ['Tào Tháo', 'Hỗ Trợ', 'Thần Tướng', 'nguy'],
  tao_nhan: ['Tào Nhân', 'Phòng Thủ', 'Thần Tướng', 'nguy'],
  quach_gia: ['Quách Gia', 'Hỗ Trợ', 'Thần Tướng', 'nguy'],
  truong_lieu: ['Trương Liêu', 'Tấn Công', 'Thần Tướng', 'nguy'],
  tuan_du: ['Tuân Du', 'Tấn Công', 'Danh Tướng', 'nguy'],
  ha_hau_uyen: ['Hạ Hầu Uyên', 'Đột Kích', 'Danh Tướng', 'nguy'],
  ha_hau_don: ['Hạ Hầu Đôn', 'Phòng Thủ', 'Danh Tướng', 'nguy'],
  chan_co: ['Chân Cơ', 'Hỗ Trợ', 'Danh Tướng', 'nguy'],
  hua_chu: ['Hứa Chử', 'Phòng Thủ', 'Danh Tướng', 'nguy'],
  dien_vi: ['Điển Vi', 'Đột Kích', 'Danh Tướng', 'nguy'],
  vuong_di: ['Vương Dị', 'Tấn Công', 'Lương Tướng', 'nguy'],
  truong_cap: ['Trương Cáp', 'Đột Kích', 'Lương Tướng', 'nguy'],
  tu_hoang: ['Từ Hoảng', 'Hỗ Trợ', 'Lương Tướng', 'nguy'],

  // Thục
  quan_ngan_binh: ['Quan Ngân Bình', 'Tấn Công', 'Lương Tướng', 'thuc'],
  truong_tinh_thai: ['Trương Tinh Thái', 'Phòng Thủ', 'Lương Tướng', 'thuc'],
  bang_thong: ['Bàng Thống', 'Hỗ Trợ', 'Danh Tướng', 'thuc'],
  hoang_nguyet_anh: ['Hoàng Nguyệt Anh', 'Đột Kích', 'Danh Tướng', 'thuc'],
  hoang_trung: ['Hoàng Trung', 'Tấn Công', 'Danh Tướng', 'thuc'],
  nguy_dien: ['Ngụy Diên', 'Phòng Thủ', 'Danh Tướng', 'thuc'],
  tu_thu: ['Từ Thứ', 'Đột Kích', 'Danh Tướng', 'thuc'],
  luu_bi: ['Lưu Bị', 'Hỗ Trợ', 'Thần Tướng', 'thuc'],
  gia_cat_luong: ['Gia Cát Lượng', 'Đột Kích', 'Thần Tướng', 'thuc'],
  ma_sieu: ['Mã Siêu', 'Đột Kích', 'Thần Tướng', 'thuc'],
  quan_vu: ['Quan Vũ', 'Tấn Công', 'Thần Tướng', 'thuc'],
  ma_luong: ['Mã Lương', 'Hỗ Trợ', 'Thần Tướng', 'thuc'],
  truong_bao: ['Trương Bảo', 'Đột Kích', 'Thần Tướng', 'thuc'],
  quan_hung: ['Quan Hưng', 'Đột Kích', 'Thần Tướng', 'thuc'],
  ma_van_loc: ['Mã Vân Lộc', 'Tấn Công', 'Thần Tướng', 'thuc'],
  gia_cat_qua: ['Gia Cát Quả', 'Hỗ Trợ', 'Thần Tướng', 'thuc'],
  khuong_duy: ['Khương Duy', 'Tấn Công', 'Thần Tướng', 'thuc'],
  ma_dai: ['Mã Đại', 'Đột Kích', 'Thần Tướng', 'thuc'],
  tran_dao: ['Trần Đáo', 'Đột Kích', 'Thần Tướng', 'thuc'],
  bao_tam_nuong: ['Bảo Tam Nương', 'Phòng Thủ', 'Thần Tướng', 'thuc'],
  quan_sach: ['Quan Sách', 'Tấn Công', 'Thần Tướng', 'thuc'],
  trieu_van: ['Triệu Vân', 'Đột Kích', 'Thần Tướng', 'thuc'],
  truong_phi: ['Trương Phi', 'Phòng Thủ', 'Thần Tướng', 'thuc'],
  phap_chinh: ['Pháp Chính', 'Đột Kích', 'Thần Tướng', 'thuc'],
  quan_binh: ['Quan Bình', 'Tấn Công', 'Thần Tướng', 'thuc'],

  // Ngô
  cam_ninh: ['Cam Ninh', 'Tấn Công', 'Lương Tướng', 'ngo'],
  dai_kieu: ['Đại Kiều', 'Chưa rõ', 'Lương Tướng', 'ngo'],
  tieu_kieu: ['Tiểu Kiều', 'Chưa rõ', 'Lương Tướng', 'ngo'],
  bo_luyen_su: ['Bộ Luyện Sư', 'Chưa rõ', 'Danh Tướng', 'ngo'],
  chu_thai: ['Chu Thái', 'Chưa rõ', 'Danh Tướng', 'ngo'],
  thai_su_tu: ['Thái Sử Từ', 'Đột Kích', 'Danh Tướng', 'ngo'],
  ton_kien: ['Tôn Kiên', 'Chưa rõ', 'Danh Tướng', 'ngo'],
  ton_quyen: ['Tôn Quyền', 'Chưa rõ', 'Danh Tướng', 'ngo'],
  chu_du: ['Chu Du', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  chu_nhien: ['Chu Nhiên', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  dinh_phung: ['Đinh Phụng', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  hoang_cai: ['Hoàng Cái', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  lang_thong: ['Lăng Thống', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  lo_tuc: ['Lỗ Túc', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  luc_khang: ['Lục Kháng', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  luc_ton: ['Lục Tốn', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  lu_mong: ['Lữ Mông', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  ton_lo_ban: ['Tôn Lỗ Ban', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  ton_lo_duc: ['Tôn Lỗ Dục', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  ton_nhu: ['Tôn Như', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  ton_sach: ['Tôn Sách', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  ton_thuong_huong: ['Tôn Thượng Hương', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  tu_thinh: ['Từ Thịnh', 'Chưa rõ', 'Thần Tướng', 'ngo'],
  tuong_kham: ['Tưởng Khâm', 'Chưa rõ', 'Thần Tướng', 'ngo'],

  // Quần Hùng
  hoa_man: ['Hoa Man', 'Chưa rõ', 'Thần Tướng', 'quan'],
  am_hau: ['Ẩm Hậu', 'Chưa rõ', 'Thần Tướng', 'quan'],
  vuong_nguyen_co: ['Vương Nguyên Cơ', 'Tấn Công', 'Thần Tướng', 'quan'],
  truong_ky_anh: ['Trương Kỳ Anh', 'Chưa rõ', 'Thần Tướng', 'quan'],
  truong_ninh: ['Trương Ninh', 'Chưa rõ', 'Thần Tướng', 'quan'],
  cao_thuan: ['Cao Thuận', 'Chưa rõ', 'Thần Tướng', 'quan'],
  tran_cung: ['Trần Cung', 'Chưa rõ', 'Thần Tướng', 'quan'],
  dong_bach: ['Đồng Bạch', 'Chưa rõ', 'Thần Tướng', 'quan'],
  cong_ton_toan: ['Công Tôn Toản', 'Chưa rõ', 'Thần Tướng', 'quan'],
  phuc_tho: ['Phục Thọ', 'Tấn Công', 'Thần Tướng', 'quan'],
  thuy_kinh: ['Thủy Kính', 'Chưa rõ', 'Thần Tướng', 'quan'],
  linh_thu: ['Linh Thư', 'Chưa rõ', 'Thần Tướng', 'quan'],
  nhan_luong: ['Nhan Lương', 'Chưa rõ', 'Thần Tướng', 'quan'],
  dieu_thuyen: ['Điêu Thuyền', 'Hỗ Trợ', 'Thần Tướng', 'quan'],
  hoa_da: ['Hoa Đà', 'Chưa rõ', 'Thần Tướng', 'quan'],
  lu_bo: ['Lữ Bố', 'Chưa rõ', 'Thần Tướng', 'quan'],
  ta_tu: ['Tả Từ', 'Chưa rõ', 'Thần Tướng', 'quan'],
  gia_hu: ['Giả Hủ', 'Chưa rõ', 'Thần Tướng', 'quan'],
  vien_thieu: ['Viên Thiệu', 'Chưa rõ', 'Danh Tướng', 'quan'],
  truong_xuan_hoa: ['Trương Xuân Hoa', 'Chưa rõ', 'Danh Tướng', 'quan'],
  chuc_dung: ['Chúc Dung', 'Chưa rõ', 'Danh Tướng', 'quan'],
  lu_linh_khoi: ['Lữ Linh Khởi', 'Chưa rõ', 'Danh Tướng', 'quan'],
  manh_hoach: ['Mạnh Hoạch', 'Chưa rõ', 'Danh Tướng', 'quan'],
  dong_trac: ['Đổng Trác', 'Chưa rõ', 'Lương Tướng', 'quan'],
  thai_van_co: ['Thái Văn Cơ', 'Hỗ Trợ', 'Lương Tướng', 'quan'],
  truong_giac: ['Trương Giác', 'Chưa rõ', 'Lương Tướng', 'quan'],
  hinh_dao_vinh: ['Hình Đạo Vinh', 'Chưa rõ', 'Lương Tướng', 'quan'],
  phan_phung: ['Phan Phụng', 'Chưa rõ', 'Lương Tướng', 'quan'],
};

const soulHeroes = {
  phuong_nghi_vuong_nguyen_co: ['Phượng Nghi Vương Nguyên Cơ', '2026-04-24', 'quan'],
  than_uy_ma_sieu: ['Thần Uy Mã Siêu', '2026-02-14', 'thuc'],
  ngu_hoang_ton_quyen: ['Ngự Hoàng Tôn Quyền', '2025-12-30', 'ngo'],
  himura_kenshin_phi_thon_kiem_tam: ['Himura Kenshin - Phi Thôn Kiếm Tâm', '2025-11-14', 'unknown'],
  chieu_lam_tao_phi: ['Chiêu Lâm Tào Phi', '2025-09-25', 'nguy'],
  hao_lan_khuong_duy: ['Hạo Lân Khương Duy', '2025-06-21', 'thuc'],
  duc_ninh_lu_linh_khoi: ['Dực Ninh Lữ Linh Khởi', '2025-03-26', 'quan'],
  vong_thu_thai_van_co: ['Vọng Thư Thái Văn Cơ', '2025-01-17', 'quan'],
  chieu_hanh_luc_ton: ['Chiêu Hành Lục Tốn', '2024-10-30', 'ngo'],
  ban_cuc_tao_nhan: ['Bàn Cực Tào Nhân', '2024-08-27', 'nguy'],
  dich_than_gia_cat_luong: ['Dịch Thần Gia Cát Lượng', '2024-06-22', 'thuc'],
  quan_dao_dai_kieu: ['Quân Dao Đại Kiều', '2024-04-24', 'ngo'],
  thuong_lan_quan_vu: ['Thương Lan Quan Vũ', '2024-02-10', 'thuc'],
  trach_van_hoa_da: ['Trạch Vân Hoa Đà', '2023-12-19', 'quan'],
  cuong_quy_tu_ma_y: ['Cuống Quỷ Tư Mã Ý', '2023-10-24', 'nguy'],
  lam_duc_luu_bi: ['Lẫm Dục Lưu Bị', '2023-08-26', 'thuc'],
  minh_u_dieu_thuyen: ['Minh U Điêu Thuyền', '2023-06-26', 'quan'],
  huyen_minh_ton_sach: ['Huyên Minh Tôn Sách', '2023-03-16', 'ngo'],
  han_tuyet_truong_lieu: ['Hãn Tuyết Trương Liêu', '2023-01-18', 'nguy'],
  trong_minh_truong_phi: ['Trọng Minh Trương Phi', '2022-11-05', 'thuc'],
  luu_hong_quach_gia: ['Lưu Hồng Quách Gia', '2022-09-02', 'nguy'],
  huyen_uyen_lu_bo: ['Huyền Uyên Lữ Bố', '2022-06-23', 'quan'],
  than_mong_ta_tu: ['Thận Mộng Tả Từ', '2022-04-16', 'quan'],
  dan_linh_ton_thuong_huong: ['Đan Linh Tôn Thượng Hương', '2022-01-29', 'ngo'],
  xich_diem_chu_du: ['Xích Diễm Chu Du', '2021-11-09', 'ngo'],
  hao_nhan_tao_thao: ['Hào Nhận Tào Tháo', '2021-08-26', 'nguy'],
  loi_dinh_trieu_van: ['Lôi Đình Triệu Vân', '2021-06-20', 'thuc'],
};

const fileOverrides = {
  thai_van_co: 'thai-van-co.json',
};

function readHero(id) {
  const file = fileOverrides[id] ?? `${id}.json`;
  const fullPath = path.join(heroDir, file);
  if (!fs.existsSync(fullPath)) return null;
  return { file, fullPath, hero: JSON.parse(fs.readFileSync(fullPath, 'utf8')) };
}

function writeHero(fullPath, hero) {
  fs.writeFileSync(fullPath, `${JSON.stringify(hero, null, 2)}\n`, 'utf8');
}

let updated = 0;
const missing = [];

for (const [id, [name, profession, qualityLabel, countryKey]] of Object.entries(normalHeroes)) {
  const entry = readHero(id);
  if (!entry) {
    missing.push(id);
    continue;
  }

  const [country, faction] = countries[countryKey];
  Object.assign(entry.hero, {
    id,
    name,
    type: 'normal',
    country,
    faction,
    role: 'Võ Tướng',
    profession,
    quality: qualityCodes[qualityLabel],
  });
  if (!entry.hero.description || entry.hero.description.includes('?') || entry.hero.description.includes('chưa có dữ liệu chi tiết')) {
    const professionText = profession === 'Chưa rõ' ? 'chưa rõ chức nghiệp' : `chức nghiệp ${profession}`;
    entry.hero.description = `Võ tướng phe ${faction}, phẩm ${qualityLabel}, ${professionText}. Nội dung kỹ năng sẽ được cập nhật sau.`;
  }
  writeHero(entry.fullPath, entry.hero);
  updated += 1;
}

for (const [id, [name, releaseDate, countryKey]] of Object.entries(soulHeroes)) {
  const entry = readHero(id);
  if (!entry) {
    missing.push(id);
    continue;
  }

  const [country, faction] = countries[countryKey];
  Object.assign(entry.hero, {
    id,
    name,
    type: 'soul',
    country,
    faction,
    role: 'Hồn Tướng',
    profession: 'Chưa rõ',
    quality: 'UR',
    releaseDate,
  });
  if (!entry.hero.description || entry.hero.description.includes('?') || entry.hero.description.includes('chưa có dữ liệu chi tiết')) {
    entry.hero.description = `Hồn tướng ra mắt ngày ${releaseDate.split('-').reverse().join('/')}. Nội dung kỹ năng sẽ được cập nhật sau.`;
  }
  writeHero(entry.fullPath, entry.hero);
  updated += 1;
}

console.log(JSON.stringify({ updated, missing }, null, 2));
