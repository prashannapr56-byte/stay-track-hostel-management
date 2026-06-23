# StayTrack - Daily Startup (PowerShell)
# Run this every time you want to start the servers

Write-Host ""
Write-Host "========================================"
Write-Host "StayTrack - Daily Startup"
Write-Host "========================================"
Write-Host ""

# Check if PM2 is installed
try {
    pm2 --version | Out-Null
}
catch {
    Write-Host "Installing PM2..."
    npm install -g pm2 --quiet
}

Write-Host "Starting StayTrack service..."
pm2 start ecosystem.config.js | Out-Null

Write-Host ""
Write-Host "✓ Service started!"
Write-Host ""
Write-Host "Access your app:"
Write-Host "  • Desktop: http://localhost:8080"
Write-Host "  • Mobile (WiFi): http://YOUR-IP:8080"
Write-Host "  • HTTPS (external): ngrok http 8080"
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  pm2 status      - Check if service is running"
Write-Host "  pm2 logs        - View error logs"
Write-Host "  pm2 stop all    - Stop the service"
Write-Host "  pm2 restart all - Restart the service"
Write-Host ""

Start-Sleep -Seconds 3
