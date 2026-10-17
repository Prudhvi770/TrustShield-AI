import os, re

fe_src = r"C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai\frontend\src"

for root, dirs, files in os.walk(fe_src):
    for fname in files:
        if fname.endswith(".jsx"):
            p = os.path.join(root, fname)
            with open(p, "r", encoding="utf-8") as f:
                c = f.read()
            orig = c
            # Remove (e: React.FormEvent) or (e: any)
            c = re.sub(r'\(([a-zA-Z0-9_]+)\s*:\s*React\.[A-Za-z0-9_<>]+(?:\s*\|\s*[A-Za-z0-9_<>]+)*\)', r'(\1)', c)
            # Remove (demoRole: 'analyst' | 'auditor') or (foo: string)
            c = re.sub(r'\(([a-zA-Z0-9_]+)\s*:\s*(?:\'[^\']*\'|\"[^\"]*\"|[A-Za-z0-9_<>]+)(?:\s*\|\s*(?:\'[^\']*\'|\"[^\"]*\"|[A-Za-z0-9_<>]+))*\)', r'(\1)', c)
            # Remove : Props at end of component declaration
            c = re.sub(r'const\s+([A-Za-z0-9_]+)\s*:\s*React\.FC<[^>]+>\s*=', r'const \1 =', c)
            c = re.sub(r'const\s+([A-Za-z0-9_]+)\s*:\s*React\.FC\s*=', r'const \1 =', c)
            
            if c != orig:
                with open(p, "w", encoding="utf-8") as f:
                    f.write(c)
                print("Cleaned types in", fname)

print("Parameter type cleaning done.")
