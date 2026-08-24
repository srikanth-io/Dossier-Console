@echo off
REM Dossier Admin - Backend Service Launcher (Windows Batch)
REM This runs Supabase in the background and keeps it alive

setlocal EnableDelayedExpansion

set PROJECT_NAME=Dossier_Admin
set LOG_DIR=%~dp0..\.logs
set LOG_FILE=%LOG_DIR%\backend.log

REM Create logs directory
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo [%date% %time%] Starting backend services... >> "%LOG_FILE%"

REM Check if services are already running
docker ps --filter "name=%PROJECT_NAME%" --format "{{.Names}}" 2>nul | findstr /r "." >nul
if %errorlevel% equ 0 (
    echo Services are already running.
    goto :show_status
)

echo Stopping any existing services...
npx supabase stop >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting Supabase services...
start "Supabase Backend" /min cmd /c "cd /d "%~dp0.." && npx supabase start > "%LOG_DIR%\supabase-output.log" 2>&1"

echo Waiting for services to initialize...
timeout /t 15 /nobreak >nul

:show_status
echo.
echo ========================================
echo   Dossier Admin - Backend Services
echo ========================================
echo.

REM Check running containers
docker ps --filter "name=%PROJECT_NAME%" --format "  ✓ {{.Names}} - {{.Status}}" 2>nul

echo.
echo ========================================
echo.
echo Endpoints:
echo   Studio:    http://127.0.0.1:54323
echo   API:       http://127.0.0.1:19001
echo   Mailpit:   http://127.0.0.1:54324
echo   Database:  postgresql://postgres:postgres@127.0.0.1:54322/postgres
echo.
echo Services will continue running after this window closes.
echo To stop: npm run backend:stop
echo.

pause
