# StayTrack - 24/7 Secure Setup Guide

## Overview
This guide will help you set up StayTrack to run 24/7 with secure HTTPS access on mobile devices.

## ⚡ Quick Start (5 minutes)

### Step 1: Install Global Dependencies
```bash
npm install -g pm2 ngrok
```

### Step 2: Prepare the Application
```bash
cd backend
npm install
cd ../frontend
npm install
npm run build
cd ..
```

### Step 3: Start Services with PM2

**Option A: Using Batch File (Windows)**
```bash
# Double-click startup.bat or run in cmd
startup.bat
```

**Option B: Using PowerShell**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\startup.ps1
```

**Option C: Manual PM2 Setup**
```bash
pm2 start backend/src/server.js --name "staytrack-backend" --instances 1
pm2 start "npm run preview" --cwd frontend --name "staytrack-frontend" --instances 1
pm2 startup
pm2 save
```

## 🔒 Accessing Securely from Mobile (HTTPS)

### Using ngrok (Recommended)

**Step 1:** Start a new terminal and run:
```bash
ngrok http 5174
```

**Step 2:** You'll see output like:
```
Session Status    online
Account           [your email]
Version           3.x
Region            in,sg
Latency           0ms
Web Interface     http://127.0.0.1:4040
Forwarding        https://abc123.ngrok.app -> http://localhost:5174
```

**Step 3:** Share the HTTPS URL with mobile users:
```
https://abc123.ngrok.app
```

**Step 4:** Users can:
1. Open this link on mobile browser
2. Install as app (Add to Home Screen)
3. App will work with HTTPS (secure ✓)
4. API calls will automatically use the same domain

## 📱 Mobile Installation

### For Android (Chrome):
1. Visit: `https://abc123.ngrok.app` (or your ngrok URL)
2. Tap menu (⋮) → "Install app" or "Add to Home screen"
3. App appears on home screen ✓

### For iOS (Safari):
1. Visit: `https://abc123.ngrok.app`
2. Tap Share button → "Add to Home Screen"
3. App appears on home screen ✓

## 🔄 24/7 Operation

### With PM2 (Automatic Restart)
```bash
# Check status
pm2 status

# View logs
pm2 logs

# Restart if needed
pm2 restart all

# Stop (if needed)
pm2 stop all
```

### Important Notes:
- PM2 auto-restarts services if they crash
- Services start automatically on computer restart (after `pm2 startup && pm2 save`)
- Check logs if services don't start: `pm2 logs`

## 🐛 Troubleshooting

### "Website not secure" error on older devices:
- ngrok provides free HTTPS certificates
- Older iOS/Android may need to accept certificate

### App can't connect to backend:
- Start ngrok: `ngrok http 5174`
- Clear app cache on mobile
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### "Connection refused" after 24 hours:
- PC might have gone to sleep
- ngrok session expired (need to restart)
- Run startup batch file again

### PM2 not starting on reboot:
```bash
pm2 startup
pm2 save
```

## 📍 Local Network Access (Same WiFi)

If you want local network access without ngrok:

**Frontend:** `http://10.156.4.48:5174`  
**Backend:** `http://10.156.4.48:8080`

⚠️ Note: Not secure (HTTP), but works on same WiFi

## 🚀 Upgrade to Real HTTPS (Optional)

For production with real domain:

1. Get SSL certificate (Let's Encrypt - free)
2. Configure Node.js with certificate files
3. Use a service like:
   - Railway.app
   - Render.com
   - Heroku
   - DigitalOcean
   - AWS ECS

## 📦 Database Backup

Your data is stored in SQLite. To backup:
```bash
# Copy the database file
cp backend/data/db.sqlite backend/data/db.sqlite.backup
```

## ✅ Verification Checklist

- [ ] PM2 installed: `pm2 --version`
- [ ] ngrok installed: `ngrok --version`
- [ ] Backend running: `pm2 status`
- [ ] Frontend running: `pm2 status`
- [ ] ngrok tunnel active: Running `ngrok http 5174`
- [ ] Mobile can access HTTPS link
- [ ] App installed on mobile home screen
- [ ] Login works on mobile
- [ ] Admin/Student features work

## 🔐 Security Notes

- ngrok HTTPS is sufficient for development/internal use
- For production, use real SSL certificates
- Keep JWT secret safe in .env
- Regularly backup database
- Monitor with `pm2 logs` for errors

## 📞 Common Commands

```bash
# Start everything
pm2 start all

# Stop everything
pm2 stop all

# Restart everything
pm2 restart all

# View all logs
pm2 logs

# View specific app logs
pm2 logs staytrack-backend
pm2 logs staytrack-frontend

# Delete all processes
pm2 delete all

# Show configuration
pm2 show staytrack-backend
```

## 🎯 Summary

Your setup now:
✓ Runs 24/7 with PM2 (auto-restart)
✓ Accessible from mobile via ngrok HTTPS
✓ Auto-starts on PC restart
✓ Secure (HTTPS with valid certificate)
✓ Can be installed as native app
✓ Works offline with service worker caching