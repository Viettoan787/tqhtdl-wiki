# Prompt Cho Claude Kiểm Tra Project

Bạn đang kiểm tra một project website wiki game tĩnh tại:

```text
D:\Documents\Sách đọc thêm\Project Folder
```

## Bối cảnh dự án

Đây là web wiki game dùng:

- HTML
- CSS
- JavaScript module
- JSON data
- Ảnh local trong `assets/`
- Chạy local bằng static server, ví dụ:

```powershell
cd "D:\Documents\Sách đọc thêm\Project Folder"
npx serve . -l 8080
```

hoặc:

```powershell
cd "D:\Documents\Sách đọc thêm\Project Folder"
python -m http.server 8080 --bind 127.0.0.1
```

Mục tiêu dài hạn là xây website wiki game theo hướng cổng thông tin, có trang chủ dạng bài đăng/cập nhật, các trang tra cứu riêng cho Võ tướng, Linh Sủng và các module khác.

## Những quyết định đã thống nhất

### Trang chủ / điều hướng

- Trang chủ chỉ dùng cho bài viết, cập nhật, hướng dẫn hoặc bài nổi bật sau này.
- Trang chủ không hiển thị toàn bộ danh sách Võ tướng.
- Trang chủ không hiển thị số lượng Võ tướng, Linh Sủng, hiệu ứng.
- Sidebar menu hiện nên có:
  - Trang chủ
  - Võ tướng
  - Linh Sủng
  - Thiện Linh
  - Thần Binh
  - Sự Kiện
  - Các tính năng khác
  - Giới thiệu
- Không có trang công khai riêng cho Hiệu ứng.
- Hiệu ứng vẫn là dữ liệu nền cho popup kỹ năng.

### Võ tướng

- Dữ liệu Võ tướng nằm trong `data/heroes/`.
- `data/heroes/index.json` là manifest.
- Mỗi Võ tướng nên là một file JSON riêng.
- Danh sách Võ tướng hiện cần hiển thị:
  - ảnh
  - tên
  - phẩm chất
  - chức nghiệp
  - trận doanh
  - ngày ra mắt nếu có
- Bộ lọc danh sách dùng nhãn:
  - `Trận doanh`
  - `Phẩm chất`
  - `Chức nghiệp`
- Sắp xếp danh sách theo phẩm chất:
  - Hồn Tướng / UR
  - Thần Tướng / SSR
  - Danh Tướng / SR
  - Lương Tướng / R
- Trong cùng phẩm chất:
  - nếu có `releaseDate` thì sắp theo ngày ra mắt mới hơn trước
  - nếu không có ngày ra mắt thì sắp theo tên A-Z tiếng Việt

### Tướng SP / Hồn Tướng

Nhóm SP là Hồn Tướng:

- `type: "soul"`
- `role: "Hồn Tướng"`
- `quality: "UR"`
- có thêm `releaseDate`

Các tướng SP đã được bổ sung ngày ra mắt theo ảnh người dùng gửi, ví dụ:

- Phượng Nghi Vương Nguyên Cơ: `2026-04-24`
- Thần Uy Mã Siêu: `2026-02-14`
- Ngự Hoàng Tôn Quyền: `2025-12-30`
- Chiêu Lâm Tào Phi: `2025-09-25`
- Hạo Lân Khương Duy: `2025-06-21`
- và các SP khác trong `scripts/repair-hero-metadata.mjs`

### Ảnh tướng

- Ảnh tướng nằm trong `assets/images/`.
- Tên ảnh tướng đã được đổi sang không dấu, chữ thường, dùng gạch nối.
- Cần kiểm tra lại không còn ảnh có dấu trong `assets/images`.
- `assets/pet-images/` hiện vẫn có thể còn ảnh có dấu, chưa phải ưu tiên ở lượt kiểm tra Võ tướng.
- Có một file trùng nội dung được đổi thành `than-uy-ma-sieu-2.png`; hãy kiểm tra xem có cần giữ không.

### Encoding / lỗi font

Đây là rủi ro quan trọng.

PowerShell từng làm hỏng tiếng Việt khi truyền script trực tiếp, khiến tên tướng bị thành dấu `?`.

Đã tạo script:

```text
scripts/repair-hero-metadata.mjs
```

Script này được tạo bằng file UTF-8 để sửa metadata tiếng Việt cho tướng. Nếu cần cập nhật nhiều tiếng Việt, ưu tiên sửa bằng file UTF-8 hoặc editor, không truyền chuỗi tiếng Việt trực tiếp qua PowerShell heredoc.

Hãy kiểm tra kỹ:

- `name`
- `faction`
- `profession`
- `role`
- `description`

Không được có ký tự lỗi như:

```text
?
Ã
á»
Ä
Æ
�
```

Lưu ý: PowerShell có thể hiển thị sai dù file thật đúng UTF-8. Khi kiểm tra encoding, nên dùng Node/Python đọc file UTF-8 và kiểm tra codepoint hoặc chuỗi thực.

### Linh Sủng

Module Linh Sủng hướng theo cấu trúc:

- `data/pets/index.json`
- mỗi Linh Sủng một file JSON riêng trong `data/pets/`
- hiệu ứng chung nằm trong `data/effects.json`
- hiệu ứng riêng nằm trong `localEffects` của file Linh Sủng
- popup hiệu ứng ưu tiên `localEffects` trước, sau đó fallback sang `data/effects.json`
- hiệu ứng tăng theo sao nên hiển thị đúng theo sao đang xem, không gộp chỉ số khó đọc

Ví dụ đã có: Phu Chư với hiệu ứng `[Thủy Thuẫn]`.

## Các file quan trọng cần đọc

Hãy đọc các file sau trước khi nhận xét:

```text
index.html
css/custom.css
js/main.js
js/data/loader.js
js/components/wikiPages.js
js/components/skillRenderer.js
js/components/petGrid.js
js/components/effectPopup.js
js/utils/effectParser.js
data/heroes/index.json
data/pets/index.json
data/effects.json
task.md
project_status.md
scripts/repair-hero-metadata.mjs
```

## Việc cần Claude kiểm tra

### 1. Kiểm tra cấu trúc và tiến độ

Hãy tóm tắt:

- Project hiện đang có những module nào.
- Trang nào đã có route.
- Trang nào chỉ là placeholder.
- Dữ liệu nào đã tương đối ổn.
- Dữ liệu nào còn thiếu hoặc cần người dùng bổ sung.

### 2. Kiểm tra Võ tướng

Kiểm tra:

- `data/heroes/index.json` có trỏ tới file không tồn tại không.
- Có file JSON nào không nằm trong manifest không.
- Có trùng `id` không.
- Mỗi JSON có ảnh tồn tại không.
- `name`, `faction`, `profession`, `role` có lỗi font hoặc dấu `?` không.
- SP/Hồn Tướng có đúng `type`, `role`, `quality`, `releaseDate` không.
- Các tướng thường có đúng `type: "normal"` và phẩm chất/chức nghiệp/trận doanh hợp lý không.
- Có tướng nào đang `profession: "Chưa rõ"` thì liệt kê để người dùng bổ sung sau.

### 3. Kiểm tra UI danh sách Võ tướng

Kiểm tra route:

```text
#heroes
#heroes?quality=UR
#heroes?quality=SSR
#heroes?country=thuc
```

Cần xem:

- Card có ảnh + tên + badge phẩm chất/chức nghiệp/trận doanh không.
- Tướng SP có hiện ngày ra mắt không.
- Bộ lọc hiển thị đúng nhãn không.
- Sort có đúng thứ tự không.
- Layout mobile có vỡ không.
- Ảnh có bị co/crop xấu quá không.

### 4. Kiểm tra trang chi tiết tướng

Kiểm tra:

- Trang chi tiết mở được bằng `#heroes/<id>`.
- Metadata có hiện phe/phẩm/nghề/ra mắt nếu có.
- Layout ảnh và kỹ năng không quá lệch.
- Kỹ năng trống không render thẻ rác.
- Popup hiệu ứng trong kỹ năng vẫn hoạt động.

### 5. Kiểm tra Linh Sủng

Kiểm tra route:

```text
#pets
```

Cần xem:

- Danh sách Linh Sủng có hiện đúng không.
- Ảnh Phu Chư có đúng không.
- Bảng kỹ năng theo sao có đúng không.
- Popup `[Thủy Thuẫn]` có hiện đúng theo sao không.
- Popup không còn ô tăng trưởng thừa nếu người dùng đã yêu cầu bỏ.

### 6. Kiểm tra data và encoding bằng lệnh

Đề xuất chạy các kiểm tra kiểu sau:

```powershell
node --check js/main.js
node --check js/components/wikiPages.js
node --check js/components/skillRenderer.js
node --check js/components/petGrid.js
node --check scripts/repair-hero-metadata.mjs
```

Kiểm tra JSON:

```powershell
python - <<'PY'
import json
from pathlib import Path
for p in Path('data').rglob('*.json'):
    json.loads(p.read_text(encoding='utf-8-sig'))
print('json ok')
PY
```

Nếu không có Python, dùng Node:

```powershell
node -e "const fs=require('fs'), path=require('path'); function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f); if(fs.statSync(p).isDirectory()) walk(p); else if(p.endsWith('.json')) JSON.parse(fs.readFileSync(p,'utf8'));}} walk('data'); console.log('json ok')"
```

Kiểm tra ảnh tướng còn dấu:

```powershell
node -e "const fs=require('fs'), path=require('path'); const bad=fs.readdirSync(path.join('assets','images')).filter(f=>/[^\x00-\x7F]/.test(f)); console.log(bad)"
```

Kiểm tra manifest, ảnh thiếu, trùng id:

```powershell
node -e "const fs=require('fs'), path=require('path'); const root=process.cwd(); const dir=path.join(root,'data','heroes'); const manifest=JSON.parse(fs.readFileSync(path.join(dir,'index.json'),'utf8')); const ids=new Map(), missingJson=[], missingImage=[], dup=[]; for(const file of manifest){const full=path.join(dir,file); if(!fs.existsSync(full)){missingJson.push(file); continue;} const h=JSON.parse(fs.readFileSync(full,'utf8')); if(ids.has(h.id)) dup.push([h.id, ids.get(h.id), file]); ids.set(h.id,file); if(h.image && !fs.existsSync(path.join(root,h.image.replace(/^\//,'')))) missingImage.push([file,h.image]);} console.log(JSON.stringify({count:manifest.length,missingJson,missingImage,dup},null,2));"
```

Kiểm tra lỗi dấu `?` trong metadata:

```powershell
node -e "const fs=require('fs'), path=require('path'); const manifest=JSON.parse(fs.readFileSync('data/heroes/index.json','utf8')); const bad=[]; for(const f of manifest){const h=JSON.parse(fs.readFileSync(path.join('data','heroes',f),'utf8')); for(const k of ['name','faction','profession','role']) if(String(h[k]??'').includes('?')) bad.push([f,k,h[k]]);} console.log(JSON.stringify(bad,null,2));"
```

## Yêu cầu đầu ra của Claude

Hãy trả lời bằng tiếng Việt, theo cấu trúc:

1. Tóm tắt tình trạng project hiện tại.
2. Danh sách lỗi nghiêm trọng nếu có.
3. Danh sách lỗi dữ liệu/encoding nếu có.
4. Danh sách thiếu sót cần người dùng bổ sung.
5. Đề xuất thứ tự việc làm tiếp theo.
6. Không tự ý sửa code trước khi báo cáo, trừ khi người dùng yêu cầu sửa.

Nếu phát hiện lỗi có thể sửa nhỏ và an toàn, hãy nêu rõ file/dòng và đề xuất cách sửa, nhưng chưa sửa ngay.

