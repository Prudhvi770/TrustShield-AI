import os

main_path = r'C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai\backend\main.py'
with open(main_path, 'r', encoding='utf-8') as f:
    c = f.read()

mount_code = """
from fastapi.staticfiles import StaticFiles

dist_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'dist')
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")
"""

if 'StaticFiles' not in c:
    c += mount_code
    with open(main_path, 'w', encoding='utf-8') as f:
        f.write(c)
    print("StaticFiles mounted in main.py")
else:
    print("StaticFiles already present")
