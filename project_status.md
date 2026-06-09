# Project Status

## Tổng quan

Dự án là website wiki game tĩnh, dùng HTML, CSS, JavaScript và JSON data. Web đang được thiết kế lại theo hướng cổng thông tin wiki: trang chủ là nơi đăng bài viết/cập nhật/hướng dẫn, còn các phần tra cứu như Võ tướng và Linh Sủng nằm ở trang riêng.

## Trạng thái giao diện hiện tại

- Header có nút menu 3 gạch ở góc trái.
- Sidebar điều hướng chính hiện gồm:
  - Trang chủ
  - Võ tướng
  - Linh Sủng
  - Thiện Linh
  - Thần Binh
  - Sự Kiện
  - Các tính năng khác
  - Giới thiệu
- Trang chủ không còn hiển thị toàn bộ danh sách tướng.
- Trang chủ không còn hiển thị số lượng tướng, Linh Sủng hoặc hiệu ứng.
- Hiệu ứng là dữ liệu ẩn, chỉ dùng cho popup trong nội dung kỹ năng.
- Trang danh sách Võ tướng là trang riêng.
- Trang chi tiết Võ tướng là trang riêng.
- Trang Linh Sủng là trang riêng.

## Quyết định về hiệu ứng

- Không tạo trang công khai riêng cho hiệu ứng.
- `data/effects.json` vẫn giữ vai trò kho hiệu ứng chung để popup kỹ năng tra cứu.
- Hiệu ứng riêng của Linh Sủng hoặc tướng có thể nằm trong file JSON riêng nếu cần ngữ cảnh riêng.
- Popup hiệu ứng vẫn là chức năng cần giữ, nhưng không đưa mục "Hiệu ứng" vào menu chính.

## Quyết định về ảnh tướng

Ảnh tướng hiện có chất lượng cao, khi thu nhỏ quá mạnh trong danh sách có thể tạo cảm giác mờ hoặc bệt chi tiết. Hướng xử lý đã thống nhất:

- Ảnh toàn thân nên dùng cho trang chi tiết.
- Danh sách tướng nên dùng avatar/crop mặt hoặc thumbnail riêng.
- Không nên chỉnh phá ảnh gốc.
- Nên thêm cấu hình avatar trong JSON tướng, ví dụ:

```json
{
  "avatar": {
    "objectPosition": "50% 22%",
    "zoom": 1.35
  }
}
```

- Về lâu dài nên có công cụ admin chỉnh avatar:
  - Chọn tướng.
  - Xem preview thẻ nhỏ.
  - Kéo vị trí ảnh.
  - Chỉnh zoom.
  - Copy hoặc lưu cấu hình JSON.
- Khi web mở cho cộng đồng, route admin sẽ bị ẩn hoặc khóa.

## Layout chi tiết tướng

Đã thống nhất hướng layout:

- Mở rộng vùng nội dung chính để giảm nền xanh thừa hai bên.
- Tăng kích thước cột ảnh tướng.
- Ảnh chi tiết dùng tỉ lệ gần `4 / 5` để nhìn rõ hơn.
- Phần kỹ năng không nên kéo ngang quá dài, cần giữ độ rộng đọc tốt.

## Module Linh Sủng

Hướng dữ liệu Linh Sủng:

- Một Linh Sủng là một file JSON riêng trong `data/pets/`.
- `data/pets/index.json` là manifest.
- File Linh Sủng chứa metadata, kỹ năng theo sao và hiệu ứng riêng nếu có.
- Hiệu ứng tăng theo cấp sao nên hiển thị đúng theo cấp sao đang xem, không gộp nhiều chỉ số thành một dòng khó đọc.
- Popup Linh Sủng ưu tiên hiệu ứng local trước, sau đó mới fallback sang hiệu ứng chung.

## Ghi chú triển khai

- Project hiện còn một số thay đổi local chưa commit.
- Trước khi đẩy GitHub/Cloudflare cần kiểm tra lại `git status`.
- Cloudflare từng lỗi do deploy nhầm cả repo root, bao gồm `.git`; cần bảo đảm cấu hình deploy chỉ lấy đúng asset cần thiết.
- Khi chạy local nên đứng đúng thư mục project:

```powershell
cd "D:\Documents\Sách đọc thêm\Project Folder"
python -m http.server 8080 --bind 127.0.0.1
```


## Hệ thống ảnh trong trang chi tiết (mới)

Đã thống nhất 4 loại ảnh và schema dùng chung, tất cả field ảnh đều optional (không có thì render như cũ):

- Ảnh tướng: `hero.image` + `hero.avatar` (thẻ danh sách) + `hero.avatarDetail` (trang chi tiết).
- Ảnh Huyễn Vũ: `hero.huyenVu = { image, avatar: { objectPosition, zoom } }`. Hiển thị trong aside trang chi tiết, ngay dưới ảnh tướng (phương án B). Tên Huyễn Vũ lấy từ skill `_huyen_vu`, không lưu lặp.
- Icon kỹ năng (tròn): `skill.image` — render ở bên PHẢI mỗi ô mô tả kỹ năng, badge chữ Hán overlay lên góc trên-phải của icon (giống bố cục game gốc). Card không có icon thì badge nổi ở góc trên-phải card.
- Icon hiệu ứng (vuông): `effect.icon` trong `data/effects.json` — render trong popup `[Hiệu ứng]` và inline token.

Thư mục ảnh phụ đã tạo: `assets/huyen-vu/`, `assets/skill-icons/`, `assets/effect-icons/`.

## Khung phân loại kỹ năng (mới)

Mỗi loại kỹ năng có nhận diện trực quan: border-left màu riêng + badge chữ Hán ở góc card.

- Phổ Công 普 (xanh ngọc), Nộ Công 怒 (đỏ), Long Hồn Kỹ 魂 (lam tím), Bị động 被 (vàng nâu), Vô Song 觉 (tím), Duyên Phận 缘 (hồng cam), Huyễn Vũ 幻 (xám đen), Mệnh Hồn Đỏ 命 (đỏ thẫm).
- Map ở `skillRenderer.js` (`SLOT_BADGE_HAN`) + CSS `.skill-slot--<key>`.

## Sửa lỗi admin

- `fsStore.writeJson` từng lỗi "state had changed since it was read from disk" (File System Access API giữ handle cũ). Đã thêm refresh handle qua `getFile()` trước khi ghi + retry 1 lần, kèm thông báo gợi ý chọn lại thư mục nếu vẫn fail.
- `heroEditor` khi lưu nay giữ lại `avatarDetail` và `huyenVu` (trước đây chỉ giữ `avatar`, dễ mất cấu hình ảnh).

## Kiểm thử đã chạy

- `node --check` toàn bộ JS module: OK.
- Render test (Node, hero Tào Phi): badge Hán đúng từng slot, icon tròn skill, nhóm Vô Song/Mệnh Hồn Đỏ, block Huyễn Vũ — PASS.
- mergeAvatar test: 3 target (list/detail/huyenVu) ghi đúng field, không xóa nhầm field khác — PASS.
