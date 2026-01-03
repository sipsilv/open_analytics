@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Rubik Analytics - Start Docker Server
echo ========================================
echo.

cd /d "%~dp0"

:: -----------------------------------------------------------------------------
:: 1. Detect Docker Compose Command
:: -----------------------------------------------------------------------------
echo [INFO] Detecting Docker Compose version...
set DOCKER_CMD=

docker compose version >nul 2>&1
if !errorlevel! equ 0 (
    set DOCKER_CMD=docker compose
    echo [INFO] Using 'docker compose' ^(V2^)
) else (
    docker-compose --version >nul 2>&1
    if !errorlevel! equ 0 (
        set DOCKER_CMD=docker-compose
        echo [INFO] Using 'docker-compose' ^(V1^)
    ) else (
        echo [ERROR] Neither 'docker compose' nor 'docker-compose' found!
        echo Please allow Docker Desktop to finish starting or install Docker Compose.
        pause
        exit /b 1
    )
)

:: -----------------------------------------------------------------------------
:: 2. Stop Local Windows Servers (Port Conflicts)
:: -----------------------------------------------------------------------------
echo.
echo [INFO] Stopping existing local servers to free ports...
if exist ..\windows\stop-all.bat (
    call ..\windows\stop-all.bat
) else (
    echo [WARNING] ..\windows\stop-all.bat not found. Skipping local cleanup.
)

:: -----------------------------------------------------------------------------
:: 3. Check Docker Engine Status
:: -----------------------------------------------------------------------------
echo.
echo [INFO] Checking Docker Engine status...

set /a retries=0
:RETRY_LOOP
docker info >nul 2>&1
if %errorlevel% equ 0 goto DOCKER_READY

set /a retries+=1
if %retries% geq 5 (
    echo [ERROR] Docker Engine is NOT running!
    echo Please start Docker Desktop and wait for the engine to start.
    pause
    exit /b 1
)
echo [WAIT] Waiting for Docker to start... (Attempt %retries%/5)
timeout /t 5 /nobreak >nul
goto RETRY_LOOP

:DOCKER_READY
echo [OK] Docker is running.

:: -----------------------------------------------------------------------------
:: 4. Start Containers
:: -----------------------------------------------------------------------------
echo.
echo [INFO] Building and starting Docker containers...

REM Tearing down checks to avoid orphans
echo [EXEC] %DOCKER_CMD% down
%DOCKER_CMD% down

echo [EXEC] %DOCKER_CMD% up --build -d
%DOCKER_CMD% up --build -d

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker failed to start. Check the output above for details.
    pause
    exit /b 1
)

:: -----------------------------------------------------------------------------
:: 5. Success
:: -----------------------------------------------------------------------------
echo.
echo [SUCCESS] Docker containers started!
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo To view logs:
echo   cd server\docker
echo   %DOCKER_CMD% logs -f
echo.
echo To stop servers:
echo   cd server\docker
echo   call stop-all.bat
echo.
pause
