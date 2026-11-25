@echo off
setlocal enabledelayedexpansion
title Jobbly SaaS Application Launcher (1-Click)

echo ========================================================
echo               JOBBLY SAAS APP LAUNCHER
echo ========================================================
echo.

set CURRENT_DIR=%~dp0
if "%CURRENT_DIR:~-1%"=="\" set CURRENT_DIR=%CURRENT_DIR:~0,-1%

if exist "%CURRENT_DIR%\package.json" (
    set JOBBLY_PATH=%CURRENT_DIR%
    goto START_SERVER
)

set CONFIG_FILE="%CURRENT_DIR%\jobbly_path_config.txt"
if exist %CONFIG_FILE% (
    set /p JOBBLY_PATH=<%CONFIG_FILE%
)

if not "%JOBBLY_PATH%"=="" (
    if exist "%JOBBLY_PATH%\package.json" (
        goto START_SERVER
    )
)

echo Please drop your "jobbly" project folder into this window:
set /p JOBBLY_PATH="Folder Path: "
set JOBBLY_PATH=%JOBBLY_PATH:"=%

if exist "%JOBBLY_PATH%\package.json" (
    echo %JOBBLY_PATH% > %CONFIG_FILE%
    goto START_SERVER
) else (
    echo ERROR: Could not find package.json in "%JOBBLY_PATH%"
    pause
    exit /b 1
)

:START_SERVER
cd /d "%JOBBLY_PATH%"

echo ========================================================
echo  Path: %JOBBLY_PATH%
echo  Status: Starting Next.js Development Server...
echo ========================================================
echo.
echo Opening Jobbly SaaS on your web browser:
echo  - Home Page:      http://localhost:3000
echo  - Admin Panel:    http://localhost:3000/admin
echo  - User Dashboard: http://localhost:3000/dashboard
echo.

timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"

call npm run dev

pause
