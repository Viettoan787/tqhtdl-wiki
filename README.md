# Wiki Tam Quốc — Việt hóa (MVP)

Static wiki tra cứu tướng, kỹ năng và hiệu ứng cho game Tam Quốc.

## Stack

- HTML + TailwindCSS (CDN)
- Vanilla JavaScript (ES Modules)
- JSON tĩnh (`data/`)

## Chạy local

ES Modules cần HTTP server (không mở `file://` trực tiếp):

```bash
# Python
python -m http.server 8080

# hoặc npx
npx serve .
```

Mở `http://localhost:8080`

## Cấu trúc

```
├── index.html
├── css/custom.css
├── data/
│   ├── heroes.json
│   ├── skills.json
│   └── effects.json
├── js/
│   ├── main.js
│   ├── data/loader.js
│   ├── utils/effectParser.js
│   └── components/
│       ├── heroGrid.js
│       ├── heroModal.js
│       ├── skillRenderer.js
│       └── effectPopup.js
└── assets/images/
```

## Hiệu ứng trong mô tả kỹ năng

Dùng cụm `[Tên hiệu ứng]` trong mô tả kỹ năng (`skills.json`). Tên phải khớp `name` trong `effects.json`. Click/tap mở popover giải nghĩa (chỉ `name` + `description`).

## Deploy (Cloudflare Pages)

Site tĩnh, **không cần build**.

| Cài đặt | Giá trị |
|--------|---------|
| Framework preset | None |
| Build command | *(để trống)* |
| Build output directory | `.` hoặc `/` (root repo) |
| Root directory | *(để trống)* |

Sau khi connect GitHub, mỗi push lên nhánh production sẽ deploy tự động.

**Lưu ý:** Tailwind load qua CDN (`cdn.tailwindcss.com`) — cần internet; không chặn domain đó trên mạng người dùng.

### Kiểm tra local trước khi push

```powershell
cd "d:\Documents\Sách đọc thêm\Project Folder"
python -m http.server 8080
```

Mở `http://localhost:8080` — grid tướng, modal, popup `[Hiệu ứng]`, ảnh SVG phải hoạt động.
