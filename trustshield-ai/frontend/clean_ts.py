import os, glob, re

fe_src = r"C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai\frontend\src"

for root, dirs, files in os.walk(fe_src):
    for fname in files:
        if fname.endswith((".jsx", ".js")):
            fpath = os.path.join(root, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                c = f.read()

            orig = c
            # Remove interface declarations
            c = re.sub(r'interface\s+[A-Za-z0-9_]+\s*\{[^}]*\}', '', c)
            # Remove type imports
            c = re.sub(r'import\s+[^;]*from\s+[\'"].*types.*[\'"];\s*', '', c)
            # Remove : React.FC<...> or : React.FC
            c = re.sub(r':\s*React\.FC<[^>]+>', '', c)
            c = re.sub(r':\s*React\.FC', '', c)
            # Remove type assertions: as 'done' | 'running' | 'pending' or as HTMLElement
            c = re.sub(r'\s+as\s+[A-Za-z0-9_|\'\"\[\]\s<>]+(?=[,);}\s])', '', c)
            # Remove ({ foo, bar }: Props)
            c = re.sub(r'\(\s*\{([^}]+)\}\s*:\s*[A-Za-z0-9_]+\s*\)', r'({ \1 })', c)
            # Remove useState<Type>
            c = re.sub(r'useState<[^>]+>', 'useState', c)
            # Remove (props: any)
            c = re.sub(r'\(props:\s*any\)', '(props)', c)
            # Remove parameter types like (id: string) -> (id)
            c = re.sub(r'\(([A-Za-z0-9_]+)\s*:\s*[A-Za-z0-9_\[\]|<>\"\'\s]+\)', r'(\1)', c)

            if c != orig:
                with open(fpath, "w", encoding="utf-8") as f:
                    f.write(c)
                print("Sanitized TS in:", fname)

print("All JSX files cleaned of TypeScript syntax.")
