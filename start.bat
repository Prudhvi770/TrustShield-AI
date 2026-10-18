@echo off
setlocal enabledelayedexpansion
title TrustShield AI Server

echo ========================================================
echo         TRUSTSHIELD AI - PRODUCTION LAUNCHER
echo ========================================================
echo.

REM 1. Locate backend directory
set "BACKEND_DIR="
if exist "%~dp0backend\main.py" (
    set "BACKEND_DIR=%~dp0backend"
) else if exist "%~dp0trustshield-ai\backend\main.py" (
    set "BACKEND_DIR=%~dp0trustshield-ai\backend"
) else if exist "backend\main.py" (
    set "BACKEND_DIR=%CD%\backend"
)

if "%BACKEND_DIR%"=="" (
    echo [ERROR] Could not locate backend\main.py!
    echo Please make sure this script is placed in your trustshield-ai project directory.
    pause
    exit /b 1
)

cd /d "%BACKEND_DIR%"
echo [*] Located backend at: "%BACKEND_DIR%"

REM 2. Determine working Python command
set "PY_CMD="

REM Check py launcher
py --version >nul 2>&1
if !ERRORLEVEL! equ 0 (
    set "PY_CMD=py"
    goto :found_python
)

REM Check AppData Python 3.14
if exist "C:\Users\gatta\AppData\Local\Python\pythoncore-3.14-64\python.exe" (
    set "PY_CMD=C:\Users\gatta\AppData\Local\Python\pythoncore-3.14-64\python.exe"
    goto :found_python
)

REM Check python
python --version >nul 2>&1
if !ERRORLEVEL! equ 0 (
    set "PY_CMD=python"
    goto :found_python
)

:found_python
if "%PY_CMD%"=="" (
    echo [ERROR] No working Python executable found.
    echo Please ensure Python 3.10+ is installed and added to PATH.
    pause
    exit /b 1
)

echo [*] Using Python interpreter: %PY_CMD%
echo [*] Launching FastAPI backend + React UI on http://127.0.0.1:8000 ...
echo.

REM Open browser after 2 seconds in background
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8000"

REM Run Uvicorn server
"%PY_CMD%" -m uvicorn main:app --host 0.0.0.0 --port 8000

if !ERRORLEVEL! neq 0 (
    echo.
    echo [ERROR] Server terminated unexpectedly with exit code !ERRORLEVEL!.
    pause
)
