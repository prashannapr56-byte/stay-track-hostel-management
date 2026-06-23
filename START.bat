@echo off
REM StayTrack - Daily Startup (Windows CMD)
REM Run this every time you want to start the servers

echo.
echo ========================================
echo StayTrack - Daily Startup
echo ========================================
echo.

cd /d "%~dp0"

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PM2...
    npm install -g pm2 --quiet
)

echo Starting StayTrack service...
pm2 start ecosystem.config.js

echo.
echo ✓ Service started!
echo.
echo Access your app:
echo   • Desktop: http://localhost:8080
echo   • Mobile (WiFi): http://YOUR-IP:8080
echo   • HTTPS (external): ngrok http 8080
echo.
echo Check status:  pm2 status
echo View logs:     pm2 logs
echo Stop service:  pm2 stop all
echo.

timeout /t 3
