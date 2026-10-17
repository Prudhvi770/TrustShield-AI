@echo off
echo ===================================================
echo   TrustShield AI - Production Startup (Windows)
echo ===================================================
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
pause
