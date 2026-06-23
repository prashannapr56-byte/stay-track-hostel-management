@echo off
REM StayTrack - Startup Script for 24/7 Operation

echo ========================================
echo StayTrack - Hostel Management System
echo 24/7 Secure Setup with HTTPS
echo ========================================
echo.

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo PM2 not found. Installing globally...
    npm install -g pm2
)

REM Check if ngrok is installed
ngrok --version >nul 2>&1
if errorlevel 1 (
    echo ngrok not found. Please follow the setup guide.
    echo To install ngrok: npm install -g ngrok
    pause
    exit /b 1
)

REM Create logs directory
if not exist logs (
    mkdir logs
)

REM Stop any existing processes
echo Stopping previous instances...
pm2 delete all 2>nul

REM Start the applications with PM2
echo.
echo Starting StayTrack backend...
pm2 start backend/src/server.js --name "staytrack-backend" --instances 1 --watch false --env PORT=8080

echo.
echo Starting StayTrack frontend (preview mode)...
pm2 start "npm run preview" --cwd frontend --name "staytrack-frontend" --instances 1 --watch false

REM Save PM2 configuration for auto-restart on system reboot
echo.
echo Saving PM2 startup configuration...
pm2 startup
pm2 save

REM Get the backend server info
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your servers are now running 24/7 with PM2!
echo.
echo For SECURE access from mobile (HTTPS):
echo 1. Open CMD in a new window
echo 2. Run: ngrok http 5174
echo 3. Copy the HTTPS URL from ngrok
echo 4. Share that link with your mobile device
echo.
echo Local access:
echo - Frontend: http://localhost:5174
echo - Backend:  http://localhost:8080
echo.
echo PM2 Commands:
echo - pm2 status (check status)
echo - pm2 logs (view logs)
echo - pm2 restart all (restart servers)
echo - pm2 stop all (stop servers)
echo.
echo Making sure app starts after system restart...
pm2 startup
pm2 save

echo.
pause