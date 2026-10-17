import os, glob

services_dir = r'C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai\backend\services'
for py_file in glob.glob(os.path.join(services_dir, '*.py')):
    with open(py_file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    orig = content
    # Replace broken ? in regex patterns
    content = content.replace(r"?\s?\d{4,}", r"(?:\u20B9|Rs|\$)\s?\d{4,}")
    content = content.replace(r"?\s?\d", r"(?:\u20B9|Rs|\$)\s?\d")
    content = content.replace(r"r'^[?$", r"r'^[a-zA-Z0-9\u20B9$")
    content = content.replace("? in text", "'\u20B9' in text")
    content = content.replace(r"r'[?$€£]?", r"r'[\u20B9\$€£]?")
    content = content.replace(r"r'^[?$€£]?", r"r'^[\u20B9\$€£]?")
    
    # Also check if any standalone ? is followed by \s? in a regex
    content = content.replace(r"r'?\s?", r"r'[\u20B9\$]?\s?")
    content = content.replace(r"'(?:?|Rs", r"'(?:[\u20B9\$]|Rs")
    
    if orig != content:
        with open(py_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated:", os.path.basename(py_file))
print("Sanitization complete.")
