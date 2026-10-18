import sys
import os
import traceback

# Dynamically locate backend directory
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)

# Add all candidate paths to sys.path
for candidate in [
    os.path.join(root_dir, 'backend'),
    os.path.join(root_dir, 'trustshield-ai', 'backend'),
    os.path.join(current_dir, '..', 'backend'),
    os.path.join(current_dir, '..', 'trustshield-ai', 'backend'),
    root_dir
]:
    abs_cand = os.path.abspath(candidate)
    if os.path.exists(abs_cand) and abs_cand not in sys.path:
        sys.path.insert(0, abs_cand)

# Enforce /tmp SQLite database in serverless read-only environment
if os.getenv("VERCEL") or not os.access(root_dir, os.W_OK):
    os.environ["DATABASE_URL"] = "sqlite:////tmp/trustshield.db"

try:
    from main import app
    
    @app.get("/api/health")
    def vercel_health():
        return {"status": "ok", "environment": "vercel-serverless", "version": "1.0.0"}

except Exception as exc:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI(title="TrustShield AI Error Handler")
    err_msg = f"{type(exc).__name__}: {str(exc)}\n{traceback.format_exc()}"
    print(f"[ERROR] Failed to load TrustShield AI on Vercel:\n{err_msg}")
    
    @app.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    def catch_all_error(full_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "FastAPI failed to start on Vercel",
                "path": full_path,
                "details": err_msg
            }
        )
