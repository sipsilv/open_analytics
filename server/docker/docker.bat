@echo off
REM Rubik Analytics - Docker Management Script (Windows)
REM Single script to handle all Docker operations

setlocal enabledelayedexpansion

cd /d "%~dp0"

:: Check if Docker Compose is available
set COMPOSE_CMD=
docker compose version >nul 2>&1
if !errorlevel! equ 0 (
    set COMPOSE_CMD=docker compose
) else (
    docker-compose --version >nul 2>&1
    if !errorlevel! equ 0 (
        set COMPOSE_CMD=docker-compose
    ) else (
        echo [ERROR] Docker Compose not found!
        echo Please install Docker Desktop.
        pause
        exit /b 1
    )
)

:: Function to check Docker status
:CHECK_DOCKER
docker info >nul 2>&1
if !errorlevel! neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)
goto :eof

:: Function to start services
:START_SERVICES
call :CHECK_DOCKER
echo ===========================================
echo   Starting Rubik Analytics Services
echo ===========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [INFO] .env file not found.
    if exist .env.example (
        echo [INFO] Creating .env from .env.example...
        copy .env.example .env >nul
        echo [WARNING] Please edit .env file with your configuration!
        echo [WARNING] Especially update JWT_SECRET_KEY, JWT_SYSTEM_SECRET_KEY, and ENCRYPTION_KEY
        echo.
    )
)

echo [INFO] Building and starting services...
%COMPOSE_CMD% up -d --build

if !errorlevel! neq 0 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo.
echo ===========================================
echo   Services Started Successfully
echo ===========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Use 'docker.bat logs' to view logs
echo Use 'docker.bat stop' to stop services
echo.
goto :eof

:: Function to stop services
:STOP_SERVICES
echo ===========================================
echo   Stopping Rubik Analytics Services
echo ===========================================
echo.

echo [INFO] Stopping services...
%COMPOSE_CMD% down

if !errorlevel! equ 0 (
    echo.
    echo [OK] All services stopped successfully
) else (
    echo.
    echo [WARNING] Some services may not have stopped properly
)
echo.
goto :eof

:: Function to restart services
:RESTART_SERVICES
call :CHECK_DOCKER
echo ===========================================
echo   Restarting Rubik Analytics Services
echo ===========================================
echo.

echo [INFO] Stopping services...
%COMPOSE_CMD% down

echo.
echo [INFO] Starting services...
%COMPOSE_CMD% up -d --build

if !errorlevel! equ 0 (
    echo.
    echo ===========================================
    echo   Services Restarted Successfully
    echo ===========================================
    echo.
    echo Backend:  http://localhost:8000
    echo Frontend: http://localhost:3000
    echo API Docs: http://localhost:8000/docs
) else (
    echo.
    echo [ERROR] Failed to restart services
)
echo.
goto :eof

:: Function to show status
:SHOW_STATUS
echo ===========================================
echo   Rubik Analytics - Service Status
echo ===========================================
echo.

%COMPOSE_CMD% ps

echo.
goto :eof

:: Function to show logs
:SHOW_LOGS
if "%2"=="" (
    echo ===========================================
    echo   Rubik Analytics - All Logs
    echo ===========================================
    echo.
    echo [INFO] Press Ctrl+C to exit logs view
    echo.
    %COMPOSE_CMD% logs -f
) else (
    echo ===========================================
    echo   Rubik Analytics - %2 Logs
    echo ===========================================
    echo.
    echo [INFO] Press Ctrl+C to exit logs view
    echo.
    %COMPOSE_CMD% logs -f %2
)
goto :eof

:: Function to rebuild services
:REBUILD_SERVICES
call :CHECK_DOCKER
echo ===========================================
echo   Rebuilding Rubik Analytics Services
echo ===========================================
echo.

echo [INFO] Stopping services...
%COMPOSE_CMD% down

echo.
echo [INFO] Rebuilding services (no cache)...
%COMPOSE_CMD% build --no-cache

echo.
echo [INFO] Starting services...
%COMPOSE_CMD% up -d

if !errorlevel! equ 0 (
    echo.
    echo ===========================================
    echo   Services Rebuilt and Started
    echo ===========================================
    echo.
    echo Backend:  http://localhost:8000
    echo Frontend: http://localhost:3000
) else (
    echo.
    echo [ERROR] Failed to rebuild services
)
echo.
goto :eof

:: Function to show help
:SHOW_HELP
echo ===========================================
echo   Rubik Analytics - Docker Management
echo ===========================================
echo.
echo Usage: docker.bat [command]
echo.
echo Commands:
echo   start       - Start all services
echo   stop        - Stop all services
echo   restart     - Restart all services
echo   status      - Show service status
echo   logs        - Show logs (all services)
echo   logs [name] - Show logs for specific service (backend/frontend)
echo   rebuild     - Rebuild services without cache
echo   help        - Show this help message
echo.
echo Examples:
echo   docker.bat start
echo   docker.bat logs backend
echo   docker.bat restart
echo.
goto :eof

:: Main script logic
if "%1"=="" goto :SHOW_MENU
if /i "%1"=="start" goto :START_SERVICES
if /i "%1"=="stop" goto :STOP_SERVICES
if /i "%1"=="restart" goto :RESTART_SERVICES
if /i "%1"=="status" goto :SHOW_STATUS
if /i "%1"=="logs" goto :SHOW_LOGS
if /i "%1"=="rebuild" goto :REBUILD_SERVICES
if /i "%1"=="help" goto :SHOW_HELP

echo [ERROR] Unknown command: %1
echo.
goto :SHOW_HELP

:: Interactive menu
:SHOW_MENU
:MAIN_MENU
cls
echo ===========================================
echo   Rubik Analytics - Docker Management
echo ===========================================
echo.
echo 1. Start Services
echo 2. Stop Services
echo 3. Restart Services
echo 4. Show Status
echo 5. View Logs (All)
echo 6. View Logs (Backend)
echo 7. View Logs (Frontend)
echo 8. Rebuild Services
echo 9. Exit
echo.
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" (
    call :START_SERVICES
    pause
    goto :MAIN_MENU
)
if "%choice%"=="2" (
    call :STOP_SERVICES
    pause
    goto :MAIN_MENU
)
if "%choice%"=="3" (
    call :RESTART_SERVICES
    pause
    goto :MAIN_MENU
)
if "%choice%"=="4" (
    call :SHOW_STATUS
    pause
    goto :MAIN_MENU
)
if "%choice%"=="5" (
    call :SHOW_LOGS
    goto :MAIN_MENU
)
if "%choice%"=="6" (
    call :SHOW_LOGS backend
    goto :MAIN_MENU
)
if "%choice%"=="7" (
    call :SHOW_LOGS frontend
    goto :MAIN_MENU
)
if "%choice%"=="8" (
    call :REBUILD_SERVICES
    pause
    goto :MAIN_MENU
)
if "%choice%"=="9" (
    exit /b 0
)

echo [ERROR] Invalid choice. Please select 1-9.
timeout /t 2 >nul
goto :MAIN_MENU

