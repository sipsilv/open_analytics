@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Rubik Analytics - Stop Docker Server
echo ========================================
echo.

cd /d "%~dp0"

:: -----------------------------------------------------------------------------
:: 1. Detect Docker Compose Command
:: -----------------------------------------------------------------------------
set DOCKER_CMD=
docker compose version >nul 2>&1
if !errorlevel! equ 0 (
    set DOCKER_CMD=docker compose
) else (
    docker-compose --version >nul 2>&1
    if !errorlevel! equ 0 (
        set DOCKER_CMD=docker-compose
    ) else (
        echo [ERROR] Neither 'docker compose' nor 'docker-compose' found!
        echo Cannot stop containers properly via Docker Compose.
        pause
        exit /b 1
    )
)

echo [INFO] Stopping Docker containers using '%DOCKER_CMD%'...
%DOCKER_CMD% down

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to stop containers.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Docker environment stopped.
echo.
pause
