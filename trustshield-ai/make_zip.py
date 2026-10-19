import os, zipfile, shutil

project_root = r"E:\study\sem5\NLP PROJECT\trustshield-ai"
zip_target = os.path.join(project_root, "trustshield-ai.zip")
artifact_dir = r"C:\Users\gatta\.gemini\antigravity\brain\85ca015f-7ece-4bb8-8804-76e43e19dcd1"

# Exclusions
EXCLUDE_DIRS = {"node_modules", "__pycache__", ".git", ".pytest_cache", ".system_generated"}
EXCLUDE_FILES = {"trustshield-ai.zip", "trustshield.db", "Unconfirmed 745606.crdownload"}
EXCLUDE_EXTS = {".pyc", ".log", ".crdownload"}

print("Creating zip archive of TrustShield AI...")
with zipfile.ZipFile(zip_target, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(project_root):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]
        
        for file in files:
            if file in EXCLUDE_FILES or any(file.endswith(ext) for ext in EXCLUDE_EXTS):
                continue
            full_path = os.path.join(root, file)
            # Skip files larger than 15MB from the zip (such as 60MB raw CSVs) to keep zip lightweight
            try:
                if os.path.getsize(full_path) > 15 * 1024 * 1024:
                    continue
            except Exception:
                continue
            rel_path = os.path.relpath(full_path, project_root)
            zf.write(full_path, os.path.join("trustshield-ai", rel_path))

zip_size_mb = os.path.getsize(zip_target) / (1024 * 1024)
print(f"Zip created successfully at: {zip_target} ({zip_size_mb:.2f} MB)")

# Copy to brain artifact directory
os.makedirs(artifact_dir, exist_ok=True)
artifact_zip = os.path.join(artifact_dir, "trustshield-ai.zip")
shutil.copy2(zip_target, artifact_zip)
print(f"Copied zip to artifact directory: {artifact_zip}")

