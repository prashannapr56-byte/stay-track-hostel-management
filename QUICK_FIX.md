# 🚀 QUICK START - 3 Minutes to Fix

## The Problem You Had
- ❌ Website crashes after a few hours
- ❌ Can't access from mobile/Android/iOS
- ❌ "Connection refused" errors keep happening

## The Solution (One Time)

### Step 1: Open PowerShell in the project folder
```powershell
cd "c:\Users\acer\Downloads\Stay Track"
```

### Step 2: Run the permanent fix script
```powershell
.\PERMANENT_FIX.ps1
```

That's it! It will:
- ✅ Install dependencies
- ✅ Build the app for production
- ✅ Start the servers with auto-restart
- ✅ Show you how to access it

---

## Now Your App Works Perfectly

### Access from Desktop
```
http://localhost:8080
```

### Access from Mobile (same WiFi)
Find your computer's IP (script shows it) and open:
```
http://192.168.X.X:8080
(script will show your actual IP)
```

### Access from Outside (HTTPS)
Open new PowerShell and run:
```powershell
ngrok http 8080
```
Copy the HTTPS URL and share it.

---

## Daily Use (After Setup)

### To start the servers:
```powershell
pm2 start ecosystem.config.js
```

### To check if running:
```powershell
pm2 status
```

### To see any errors:
```powershell
pm2 logs
```

### To stop:
```powershell
pm2 stop all
```

---

## What's Different Now

| Before | After |
|--------|-------|
| Crashes after hours ❌ | Runs 24/7 ✅ |
| Port 5173 (breaks) ❌ | Port 8080 (stable) ✅ |
| Mobile can't access ❌ | Works on mobile ✅ |
| Manual restarts needed ❌ | Auto-restarts ✅ |
| Connection drops ❌ | Auto-reconnects ✅ |

---

## Troubleshooting

### Not working? Try:
```powershell
pm2 restart all
```

### Still not? Check logs:
```powershell
pm2 logs
```

### Need to rebuild?
```powershell
cd frontend
npm run build
cd ..
pm2 restart all
```

---

**That's it! You're done. Your app is now stable, works 24/7, and works on mobile! 🎉**
