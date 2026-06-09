# -*- coding: utf-8 -*-
import io, json, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('scripts/_summary.txt', encoding='utf-16') as f:
    for line in f:
        line = line.strip()
        if line.startswith('{'):
            try:
                d = json.loads(line)
                tag = '⚠️ EXISTING' if d['existing_has_real'] else ''
                print(f"R{d['row']:>2}  {d['name']:<28}  skills={d['skills']:>2}  {tag}")
            except Exception:
                pass
