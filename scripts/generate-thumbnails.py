# -*- coding: utf-8 -*-
"""
Tạo thumbnail cho ảnh tướng trong assets/images/.
Giữ nguyên tỉ lệ ảnh gốc (chỉ resize), output sang assets/thumbnails/.
List view dùng thumbnail (~30-80KB), trang chi tiết vẫn dùng ảnh gốc.

Chạy lại an toàn: chỉ tạo lại nếu thumbnail cũ cũ hơn ảnh gốc.
"""
import argparse
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets' / 'images'
DST = ROOT / 'assets' / 'thumbnails'

# Ảnh gốc thường rất lớn; thumbnail rộng tối đa 480px là đủ cho thẻ ~10rem
MAX_WIDTH = 480


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--force', action='store_true', help='Tạo lại tất cả dù đã có.')
    parser.add_argument('--quality', type=int, default=82, help='Chất lượng JPEG/WEBP (mặc định 82).')
    args = parser.parse_args()

    DST.mkdir(parents=True, exist_ok=True)
    src_files = sorted(p for p in SRC.iterdir() if p.suffix.lower() in {'.png', '.jpg', '.jpeg'})

    created = 0
    skipped = 0
    errors = []

    for src in src_files:
        dst = DST / f'{src.stem}.png'
        if not args.force and dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
            skipped += 1
            continue

        try:
            with Image.open(src) as im:
                im = im.convert('RGBA' if src.suffix.lower() == '.png' else 'RGB')
                w, h = im.size
                if w > MAX_WIDTH:
                    new_h = int(h * MAX_WIDTH / w)
                    im = im.resize((MAX_WIDTH, new_h), Image.LANCZOS)
                im.save(dst, optimize=True)
            created += 1
        except Exception as e:
            errors.append((src.name, str(e)))

    print(f'Created: {created} | Skipped: {skipped} | Errors: {len(errors)}')
    if errors:
        for name, err in errors:
            print(f'  ! {name}: {err}')


if __name__ == '__main__':
    main()
