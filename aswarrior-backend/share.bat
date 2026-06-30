@echo off
echo.
echo === AS Warrior - Build + Share ===
echo.

echo [1/2] Building frontend...
cd /d "%~dp0..\aswarrior-website"
call npm run build
if errorlevel 1 (
  echo ERROR: Frontend build failed.
  pause
  exit /b 1
)

echo.
echo [2/2] Starting backend (serves frontend too)...
cd /d "%~dp0"
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
  set IP=%%a
  goto :found
)
:found
set IP=%IP: =%

echo =====================================================
echo   Open on this machine:   http://localhost:3001
echo   Open on other devices:  http://%IP%:3001
echo =====================================================
echo.
echo (Make sure Windows Firewall allows port 3001)
echo Press Ctrl+C to stop.
echo.

node index.js
pause
