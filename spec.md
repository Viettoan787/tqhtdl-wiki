# SPEC — Wiki Game Tam Quốc Việt Hóa

## 1. Mục tiêu dự án

Xây dựng một website wiki/game database cho game Tam Quốc tiếng Trung, phục vụ cộng đồng nhỏ.

Website dùng để:

- Tra cứu tướng
- Tra cứu kỹ năng
- Tra cứu hiệu ứng
- Dịch nội dung game sang tiếng Việt
- Hiển thị tooltip/popup hiệu ứng khi click vào từ khóa trong mô tả kỹ năng

Dự án là static wiki, không phải SaaS, social network, app realtime hay hệ thống có đăng nhập.

---

## 2. Stack kỹ thuật

Dùng:

- HTML
- CSS / TailwindCSS
- Vanilla JavaScript
- ES Modules
- JSON static data
- GitHub
- Cloudflare Pages

Không dùng trong MVP:

- React
- Next.js
- Vue
- Supabase
- Firebase
- Database
- Backend server
- Login system
- API riêng

---

## 3. Kiến trúc tổng thể

Dữ liệu gốc nằm trong Notion.

Workflow:

```txt
Notion
  ↓
Export JSON
  ↓
Static website
  ↓
Cloudflare Pages