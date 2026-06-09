# -*- coding: utf-8 -*-
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

for f in ['gia_cat_dan.json', 'gia_cat_dan_2.json']:
    h = json.load(open(f'data/heroes/{f}', encoding='utf-8'))
    real = [s for s in h.get('skills', []) if (s.get('description') or '').strip()]
    print(f'\n=== {f} ===')
    print(f'name: {h.get("name")} | quality: {h.get("quality")} | image: {h.get("image")}')
    print(f'skills có nội dung: {len(real)}')
    for s in real:
        print(f'  - {s["id"]:<40} {s["name"]}')
