@echo off
REM StayTrack - Secure HTTPS Tunnel with ngrok
REM This creates a secure public link for your mobile app

cls
echo ========================================
echo StayTrack - Secure HTTPS Access
echo ========================================
echo.
echo Creating secure tunnel for mobile access...
echo.
echo Your HTTPS link will appear below:
echo.
echo Keep this window open while using the app!
echo.
pause

ngrok http 5174 --log=stdout

echo.
echo Session ended. The HTTPS link is no longer active.
pause