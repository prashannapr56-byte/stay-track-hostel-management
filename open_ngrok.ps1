# StayTrack - Secure HTTPS Tunnel with ngrok (PowerShell)

Clear-Host
Write-Host "========================================"
Write-Host "StayTrack - Secure HTTPS Access"
Write-Host "========================================"
Write-Host ""
Write-Host "Creating secure tunnel for mobile access..."
Write-Host ""
Write-Host "Your HTTPS link will appear below:"
Write-Host ""
Write-Host "Keep this window open while using the app!"
Write-Host ""
Read-Host "Press Enter to continue"
Write-Host ""

ngrok http 5174 --log=stdout

Write-Host ""
Write-Host "Session ended. The HTTPS link is no longer active."
Read-Host "Press Enter to exit"