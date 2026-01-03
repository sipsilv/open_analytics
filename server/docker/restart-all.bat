@echo off
echo ========================================
echo Rubik Analytics - Restart Docker Server
echo ========================================
echo.

cd /d "%~dp0"

echo [INFO] Stopping...
call stop-all.bat
if %errorlevel% neq 0 (
    echo [WARNING] Stop script encountered errors, but attempting start anyway...
)

echo.
echo [INFO] Starting...
call start-all.bat
