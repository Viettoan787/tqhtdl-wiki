# Task List

## Đã làm (đợt ảnh phụ + khung kỹ năng)

- [x] Sửa lỗi lưu admin `state had changed since it was read from disk` trong `fsStore.js` (refresh handle + retry 1 lần).
- [x] Avatar editor: thêm target thứ ba "Ảnh Huyễn Vũ" (có ô nhập đường dẫn ảnh), lưu vào `hero.huyenVu = { image, avatar }`.
- [x] Trang chi tiết tướng: render block ảnh Huyễn Vũ trong aside, dưới ảnh tướng (phương án B), chỉ hiện khi có `hero.huyenVu.image`.
- [x] Khung phân loại kỹ năng: mỗi loại có border-left màu riêng + badge chữ Hán góc card (普 怒 魂 被 觉 缘 幻 命).
- [x] `skillRenderer` đọc `skill.image` làm icon tròn ở header card (optional).
- [x] `effectPopup` + `effectParser` đọc `effect.icon` (đã có sẵn) — thêm CSS icon vuông cho popup.
- [x] Tạo thư mục ảnh phụ: `assets/huyen-vu/`, `assets/skill-icons/`, `assets/effect-icons/` (kèm .gitkeep ghi chú quy ước tên).
- [x] `heroEditor.buildEntity` giữ lại `avatarDetail` và `huyenVu` khi lưu (tránh mất field).
- [x] Dữ liệu mẫu trong `tao_phi.json`: `avatarDetail` + `huyenVu` (ảnh tạm trỏ ảnh tướng — cần thay bằng ảnh Huyễn Vũ thật).

## Còn nợ từ đợt này

- [ ] Thêm ô nhập "Đường dẫn icon kỹ năng" (`skill.image`) cho từng slot trong `heroEditor.js` (đang để nhập tay JSON).
- [ ] Làm UI sửa `effect.icon` cho hiệu ứng (hiện thêm tay vào `data/effects.json`).
- [ ] Thay ảnh Huyễn Vũ thật cho `tao_phi.json` (đang dùng ảnh tướng làm placeholder).
- [ ] Thêm ảnh icon thật vào `assets/skill-icons/` và `assets/effect-icons/`.

## Ưu tiên gần

- [ ] Kiểm tra lại toàn bộ giao diện portal sau khi đổi trang chủ sang dạng bài đăng.
- [ ] Kiểm tra trang danh sách Võ tướng ở nhiều kích thước màn hình.
- [ ] Kiểm tra trang chi tiết Võ tướng sau khi mở rộng layout và tăng kích thước ảnh.
- [ ] Rà lại ảnh tướng trong danh sách: ảnh nào bị mờ, vỡ, lệch mặt hoặc quá toàn thân.
- [ ] Thiết kế hướng avatar/crop cho thẻ tướng nhỏ.
- [ ] Xác định cấu trúc JSON cho avatar tướng, ví dụ `avatar`, `thumbnail`, `objectPosition`, `zoom`.
- [ ] Làm bản thử nghiệm công cụ admin chỉnh avatar cho tướng.
- [ ] Thêm chế độ ẩn/khóa admin trước khi web mở cho cộng đồng.

## Dữ liệu

- [ ] Tiếp tục bổ sung dữ liệu Võ tướng theo từng phẩm.
- [ ] Tiếp tục bổ sung dữ liệu Linh Sủng theo cấu trúc một Linh Sủng một file JSON.
- [ ] Giữ hiệu ứng chung trong `data/effects.json`, không đưa thành trang công khai.
- [ ] Rà lại các hiệu ứng riêng trong từng tướng/Linh Sủng để tránh trùng hoặc nhập sai popup.
- [ ] Chuẩn hóa tên file ảnh không dấu, chữ thường, dùng gạch nối nếu cần.

## UI / UX

- [ ] Trang chủ chỉ dùng cho bài đăng, cập nhật, hướng dẫn và nội dung nổi bật.
- [ ] Không hiển thị thống kê số lượng tướng, Linh Sủng, hiệu ứng ở trang chủ.
- [ ] Không hiển thị trang Hiệu ứng trong menu chính.
- [ ] Sidebar chỉ giữ: Trang chủ, Võ tướng, Linh Sủng, Thiện Linh, Thần Binh, Sự Kiện, Các tính năng khác, Giới thiệu.
- [ ] Cân lại kích thước thẻ tướng trong danh sách sau khi có avatar/crop.
- [ ] Cân lại ảnh chi tiết tướng: ảnh chi tiết nên đẹp toàn thân, còn danh sách nên ưu tiên rõ mặt.

## Kỹ thuật

- [ ] Thêm route admin nội bộ, ví dụ `#admin/avatar-editor`, khi thật sự bắt đầu làm công cụ chỉnh avatar.
- [ ] Công cụ avatar editor nên cho chọn tướng, kéo vị trí ảnh, chỉnh zoom và copy cấu hình JSON.
- [ ] Cân nhắc tạo thumbnail/avatar riêng để tránh browser co ảnh lớn quá mạnh.
- [ ] Sau này có thể dùng `srcset` để danh sách dùng ảnh nhỏ, trang chi tiết dùng ảnh lớn.
- [ ] Trước khi deploy Cloudflare, kiểm tra không deploy nhầm cả `.git` hoặc thư mục gốc quá rộng.

