
# Hướng dẫn dùng AI để nhập tướng từ PDF

Mục tiêu: bạn dán **toàn bộ nội dung này** vào AI (Claude / ChatGPT / Gemini) cùng với PDF/ảnh tướng, AI sẽ trả về một file JSON đúng cấu trúc để bạn dán vào `data/heroes/<id>.json`. Có thể trả thêm danh sách hiệu ứng mới để thêm vào `data/effects.json`.

## 1. Bối cảnh

Đây là wiki Tam Quốc Chí, chạy bằng web tĩnh. Mỗi tướng = 1 file JSON trong `data/heroes/`. Hiệu ứng dùng chung trong `data/effects.json`. Renderer suy slot kỹ năng từ chuỗi trong `skill.id`, **sai id thì kỹ năng biến mất khỏi trang**, nên phải bám đúng quy ước.

## 2. Hai loại tướng

Có **2 loại duy nhất** với bộ slot kỹ năng KHÁC NHAU. Đừng trộn.

### A) Tướng thường (Lương / Danh / Thần Tướng)

- `type: "normal"`, `role: "Võ Tướng"`, `quality: "R" | "SR" | "SSR"`.
- Không có `title`, không có `releaseDate`.
- Slot kỹ năng (theo thứ tự xuất hiện trên web):
  1. Phổ Công
  2. Nộ Công
  3. Bị động 3 sao
  4. Bị động 5 sao
  5. Vô Song 1, Vô Song 3, Vô Song 5
  6. Duyên Phận (1 mốc duy nhất)
  7. Huyễn Vũ (gồm 3 đoạn nội tại đặc biệt — xem mục 5)
  8. Mệnh Hồn Đỏ 1, Mệnh Hồn Đỏ 3, Mệnh Hồn Đỏ 5
- Bị động 2 sao và 4 sao chỉ tăng HP/ATK, **bỏ qua**, không cần ghi.
- Một tướng thường có thể **thiếu** Huyễn Vũ và/hoặc Mệnh Hồn Đỏ; nếu không có thì bỏ object đó khỏi mảng `skills`, đừng để rỗng.
- Mẫu chuẩn: `data/heroes/tao_phi.json`.

### B) Hồn Tướng (UR)

- `type: "soul"`, `role: "Hồn Tướng"`, `quality: "UR"`.
- BẮT BUỘC có `title` (danh hiệu, ví dụ "Phượng Nghi") và `releaseDate` (YYYY-MM-DD).
- Slot kỹ năng:
  1. Phổ Công
  2. Nộ Công
  3. Long Hồn Kỹ
  4. Vô Song 1, Vô Song 3, Vô Song 5
  5. Duyên Phận 1 và Duyên Phận 2 (mỗi cái GẮN với một Hộ pháp khác nhau, ghi rõ trong tên)
- KHÔNG có Huyễn Vũ, KHÔNG có Mệnh Hồn Đỏ, KHÔNG có bị động sao.
- Mẫu chuẩn: `data/heroes/phuong_nghi_vuong_nguyen_co.json`.

## 3. Quy ước id và đặt tên

`id` của tướng = tên không dấu, chữ thường, dùng gạch dưới. Ví dụ:
- "Tào Phi" → `tao_phi`
- "Phượng Nghi Vương Nguyên Cơ" → `phuong_nghi_vuong_nguyen_co`

Hồn tướng: `name` chỉ chứa tên gốc ("Vương Nguyên Cơ"), danh hiệu để riêng vào `title` ("Phượng Nghi"). `id` thì lấy nguyên tên đầy đủ không dấu.

`skill.id` LUÔN bắt đầu bằng `<id_tướng>_` rồi nối hậu tố:

| Slot                | Hậu tố id          | `skill.name` mẫu                     | `skill.type` |
|---------------------|--------------------|--------------------------------------|--------------|
| Phổ Công            | `_pho_cong`        | `Phổ Công — <tên>`                  | `active`     |
| Nộ Công             | `_no_cong`         | `Nộ Công — <tên>`                   | `active`     |
| Long Hồn Kỹ (soul)  | `_long_hon_ky`     | `Long Hồn Kỹ — <tên>`               | `active`     |
| Bị động 3 sao       | `_bi_dong_3_sao`   | `Bị động 3 sao — <tên>`             | `passive`    |
| Bị động 5 sao       | `_bi_dong_5_sao`   | `Bị động 5 sao — <tên>`             | `passive`    |
| Vô Song 1/3/5       | `_vo_song_1`/`_3`/`_5` | `Vô Song 1` / `Vô Song 3` / `Vô Song 5` (KHÔNG kèm tên) | `ultimate` |
| Duyên Phận thường   | `_duyen_phan_1`    | `Duyên Phận — <tên>`                | `passive`    |
| Duyên Phận hồn 1    | `_duyen_phan_1`    | `Duyên Phận — <tên> (Hộ pháp: <tên hộ pháp>)` | `passive` |
| Duyên Phận hồn 2    | `_duyen_phan_2`    | `Duyên Phận — <tên> (Hộ pháp: <tên hộ pháp>)` | `passive` |
| Huyễn Vũ            | `_huyen_vu`        | `Huyễn Vũ — <tên>`                  | `passive`    |
| Mệnh Hồn Đỏ 1/3/5   | `_menh_hon_do_1`/`_3`/`_5` | `Mệnh Hồn Đỏ — <Tên Đại Cảnh> 1/3/5` | `ultimate` |

Tên các bậc Mệnh Hồn Đỏ phải dùng CHUNG một "Tên Đại Cảnh" (vd "Đại Hán Xưng Đế"), chỉ khác con số bậc cuối.

`cooldown` đặt là `null` cho tất cả (không dùng).

## 4. Trận doanh và phẩm cấp (giá trị hợp lệ)

- `country` (chỉ dùng đúng): `"nguy"`, `"thuc"`, `"ngo"`, `"quan-hung"`. Không bao giờ là `"unknown"`.
- `faction` là phiên bản hiển thị: `"Ngụy"`, `"Thục"`, `"Ngô"`, `"Quần Hùng"`. Phải khớp `country`.
- `quality`: `"R"` (Lương), `"SR"` (Danh), `"SSR"` (Thần), `"UR"` (Hồn — chỉ Hồn Tướng).
- `profession`: chọn 1 trong `"Tấn Công"`, `"Đột Kích"`, `"Hỗ Trợ"`, `"Phòng Thủ"`. Nếu PDF không nói rõ thì để `"Chưa rõ"`.

## 5. Huyễn Vũ — định dạng đặc biệt 3 đoạn

Tướng thường thường có Huyễn Vũ kèm 3 đoạn nội tại đặc biệt:

1. **Lược Hữu Tiểu Thành** — kích hoạt khi trang bị Huyễn Vũ lên tướng.
2. **Lư Hỏa Thuần Thanh** — kích hoạt khi Hộ hữu thêm 1 Huyễn Vũ Cam bất kỳ.
3. **Thần Hồ Kỳ Kỹ** — kích hoạt khi Hộ hữu thêm 1 Huyễn Vũ Chuyên thuộc + 1 Huyễn Vũ Cam bất kỳ.

Tất cả gộp vào MỘT skill object duy nhất (`<id>_huyen_vu`), và `description` viết liền nhau dạng:

```
**Lược Hữu Tiểu Thành**: <mô tả>. (Kích hoạt khi trang bị lên ...).

**Lư Hỏa Thuần Thanh**: <mô tả>. (Kích hoạt khi Hộ hữu thêm 1 Huyễn Vũ Cam bất kỳ).

**Thần Hồ Kỳ Kỹ**: <mô tả>. (Kích hoạt khi Hộ hữu thêm 1 Huyễn Vũ Chuyên thuộc + 1 Huyễn Vũ Cam bất kỳ).
```

Dùng đúng `**Tên Đoạn**:` (đôi dấu sao + tên + dấu hai chấm) — công cụ dựa vào marker này để tách 3 ô khi sửa.

## 6. Hiệu ứng `[Tên Hiệu Ứng]` — token đặc biệt

Trong `description` của bất kỳ skill nào, các thuật ngữ chuyên biệt cần được **bao trong dấu ngoặc vuông**, ví dụ `[Cử Nghĩa]`, `[Linh Dụ]`, `[Kim Lũ]`. Khi đó web sẽ render thành nút bấm mở popup mô tả.

Để popup có nội dung, hiệu ứng PHẢI tồn tại trong `data/effects.json` (kho hiệu ứng dùng chung). Khi nhập tướng mới, AI cần kèm theo một danh sách hiệu ứng MỚI (nếu có) để bạn thêm vào `data/effects.json`.

Format hiệu ứng:

```json
{
  "id": "ten_hieu_ung_khong_dau",
  "name": "Tên Hiệu Ứng",
  "description": "Mô tả ngắn gọn cơ chế hiệu ứng."
}
```

`id` không dấu, chữ thường, gạch dưới. `name` PHẢI khớp đúng (tính cả dấu, viết hoa) với token `[Tên]` trong mô tả skill — popup khớp theo `name`.

## 7. Yêu cầu đầu ra cho AI

Khi đọc PDF và sinh dữ liệu, AI hãy trả về **theo đúng cấu trúc 2 phần** này:

````
### File: data/heroes/<id>.json

```json
{ ...JSON đầy đủ của tướng... }
```

### Hiệu ứng mới cần thêm vào data/effects.json

```json
[
  { "id": "...", "name": "...", "description": "..." }
]
```

(Nếu không có hiệu ứng mới thì để mảng rỗng `[]` và ghi rõ "Không có hiệu ứng mới".)
````

Quy tắc bắt buộc:

- JSON hợp lệ, indent 2 dấu cách, UTF-8 không BOM.
- Giữ NGUYÊN dấu tiếng Việt (Ả, Ấ, Ỡ, ...). Tuyệt đối không dùng `?` hay `Ã`/`á»` trong nội dung.
- Không thêm trường lạ ngoài mẫu.
- Nếu PDF thiếu thông tin một slot, **bỏ object đó khỏi `skills`** chứ không tạo skill rỗng / placeholder.
- `skills` không có thứ tự bắt buộc trong JSON, nhưng nên xếp theo thứ tự ở mục 2.

## 8. Hai mẫu thực tế để AI tham khảo

Lấy nguyên văn từ:

- **Tướng thường**: `data/heroes/tao_phi.json` — có Phổ Công, Nộ Công, Bị động 3+5 sao, Vô Song 1/3/5, Duyên Phận, Huyễn Vũ (3 đoạn `**Lược Hữu**`/`**Lư Hỏa**`/`**Thần Hồ**`), Mệnh Hồn Đỏ 1/3/5 (tên đại cảnh "Đại Hán Xưng Đế").
- **Hồn Tướng**: `data/heroes/phuong_nghi_vuong_nguyen_co.json` — có `title: "Phượng Nghi"`, `releaseDate: "2026-04-24"`, Phổ Công, Nộ Công, Long Hồn Kỹ, Vô Song 1/3/5, 2 Duyên Phận với Hộ pháp khác nhau.

Đây là 2 file mẫu **đã chạy đúng** trên web. AI nên bắt chước cấu trúc của chúng.

## 9. Quy trình sau khi nhận output từ AI

1. Lưu nội dung khối JSON đầu vào `data/heroes/<id>.json` (file có thể đã tồn tại, ghi đè).
2. Mở `data/effects.json`, **chèn các hiệu ứng mới vào cuối mảng** (đừng xóa cái cũ, đừng đổi thứ tự).
3. Mở `data/heroes/index.json` — nếu file vừa tạo là tướng MỚI, thêm tên file vào mảng manifest. (Tướng đã có thì bỏ qua.)
4. F5 trang `#heroes/<id>` để kiểm tra. Nếu kỹ năng không hiện → kiểm tra `skill.id` có khớp bảng ở mục 3 không. Nếu token `[Tên]` hiện màu xám (unknown) → hiệu ứng chưa có trong `effects.json`.
