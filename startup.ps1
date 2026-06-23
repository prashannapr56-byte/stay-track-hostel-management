# StayTrack - Startup Script for 24/7 Operation (PowerShell)

Write-Host "========================================"
Write-Host "StayTrack - Hostel Management System"
Write-Host "24/7 Secure Setup with HTTPS"
Write-Host "========================================"
Write-Host ""

# Check if PM2 is installed
try {
    pm2 --version | Out-Null
}
catch {
    Write-Host "PM2 not found. Installing globally..."
    npm install -g pm2
}

# Check if ngrok is installed
try {
    ngrok --version | Out-Null
}
catch {
    Write-Host "ngrok not found. Please follow the setup guide."
    Write-Host "To install ngrok: npm install -g ngrok"
    Read-Host "Press Enter to exit"
    exit
}

# Create logs directory
if (-Not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Stop any existing processes
Write-Host "Stopping previous instances..."
pm2 delete all 2>$null

# Start the applications with PM2
Write-Host ""
Write-Host "Starting StayTrack backend..."
pm2 start backend/src/server.js --name "staytrack-backend" --instances 1 --watch $false

Write-Host ""
Write-Host "Starting StayTrack frontend (preview mode)..."
pm2 start "npm run preview" --cwd frontend --name "staytrack-frontend" --instances 1 --watch $false

# Save PM2 configuration
Write-Host ""
Write-Host "Saving PM2 startup configuration..."
pm2 startup
pm2 save

# Display completion message
Write-Host ""
Write-Host "========================================"
Write-Host "Setup Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "Your servers are now running 24/7 with PM2!"
Write-Host ""
Write-Host "For SECURE access from mobile (HTTPS):"
Write-Host "1. Open CMD/PowerShell in a new window"
Write-Host "2. Run: ngrok http 5174"
Write-Host "3. Copy the HTTPS URL from ngrok"
Write-Host "4. Share that link with your mobile device"
Write-Host ""
Write-Host "Local access:"
Write-Host "- Frontend: http://localhost:5174"
Write-Host "- Backend:  http://localhost:8080"
Write-Host ""
Write-Host "PM2 Commands:"
Write-Host "- pm2 status (check status)"
Write-Host "- pm2 logs (view logs)"
Write-Host "- pm2 restart all (restart servers)"
Write-Host "- pm2 stop all (stop servers)"
Write-Host ""

Read-Host "Press Enter to continue"