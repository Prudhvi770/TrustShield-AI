@echo off
setlocal enabledelayedexpansion
title TrustShield AI — Streamlit Dashboard

echo ========================================================
echo        TRUSTSHIELD AI - STREAMLIT CLOUD LAUNCHER
echo               (Zero Database Required)
echo ========================================================
echo.

cd /d "%~dp0"

REM Determine Python Command
set "PY_CMD="
py --version >nul 2>&1
if !ERRORLEVEL! equ 0 (
    set "PY_CMD=py"
    goto :found_py
)

if exist "C:\Users\gatta\AppData\Local\Python\pythoncore-3.14-64\python.exe" (
    set "PY_CMD=C:\Users\gatta\AppData\Local\Python\pythoncore-3.14-64\python.exe"
    goto :found_py
)

python --version >nul 2>&1
if !ERRORLEVEL! equ 0 (
    set "PY_CMD=python"
    goto :found_py
)

:found_py
if "%PY_CMD%"=="" (
    echo [ERROR] Python not found. Please install Python 3.10+.
    pause
    exit /b 1
)

echo [*] Using Python: %PY_CMD%
echo [*] Launching Streamlit on http://localhost:8501 ...
echo.

"%PY_CMD%" -m streamlit run streamlit_app.py --server.port 8501 --browser.gatherUsageStats false

pause
