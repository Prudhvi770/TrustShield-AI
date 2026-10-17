import os, glob

fe_dir = r"C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai\frontend"
src_dir = os.path.join(fe_dir, "src")

# 1. Update package.json to pure React.js
pkg_json = """{
  "name": "trustshield-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.454.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "vite": "^5.4.10"
  }
}
"""
with open(os.path.join(fe_dir, "package.json"), "w", encoding="utf-8") as f:
    f.write(pkg_json)

# 2. Remove tsconfig files
for ts_cfg in ["tsconfig.json", "tsconfig.node.json", "vite.config.ts"]:
    p = os.path.join(fe_dir, ts_cfg)
    if os.path.exists(p):
        os.remove(p)
        print("Removed", ts_cfg)

# 3. Create vite.config.js
vite_js = """import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      }
    }
  }
});
"""
with open(os.path.join(fe_dir, "vite.config.js"), "w", encoding="utf-8") as f:
    f.write(vite_js)

# 4. Update index.html
index_html = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/shield.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TrustShield AI — Verification Platform</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#F8FAFC] text-[#0F172A] antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"""
with open(os.path.join(fe_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write(index_html)

print("Base config converted to pure React.js")
