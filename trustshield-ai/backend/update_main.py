import os

main_path = r'C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai\backend\main.py'
with open(main_path, 'r', encoding='utf-8') as f:
    code = f.read()

dataset_endpoints = """
# ----------------- DATASET & CODE DOWNLOAD ENDPOINTS -----------------
@app.get("/api/dataset")
def get_dataset():
    dataset_path = os.path.join(os.path.dirname(__file__), "data", "claims_dataset.json")
    if os.path.exists(dataset_path):
        import json
        with open(dataset_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@app.get("/api/download-code")
def download_code_zip():
    zip_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "trustshield-ai.zip")
    if not os.path.exists(zip_path):
        # Generate on the fly if needed
        import shutil
        root_dir = os.path.dirname(os.path.dirname(__file__))
        shutil.make_archive(os.path.join(root_dir, "trustshield-ai"), "zip", root_dir)
    from fastapi.responses import FileResponse
    return FileResponse(
        path=zip_path,
        filename="trustshield-ai-reactjs.zip",
        media_type="application/zip"
    )
"""

if "/api/dataset" not in code:
    # Insert before StaticFiles mount or at bottom
    if "from fastapi.staticfiles import StaticFiles" in code:
        idx = code.find("from fastapi.staticfiles import StaticFiles")
        code = code[:idx] + dataset_endpoints + "\n" + code[idx:]
    else:
        code += "\n" + dataset_endpoints
    with open(main_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Added /api/dataset and /api/download-code to main.py")
else:
    print("Dataset endpoints already present")
