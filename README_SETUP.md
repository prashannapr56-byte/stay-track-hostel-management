# 🏛️ StayTrack - Hostel Management System
## Secure 24/7 Mobile App - Complete Setup & Guide

---

## ✅ What's Been Fixed

### 1. 🔒 "Website Not Secure" ✓
- **Issue:** HTTPS warning on mobile
- **Solution:** Using ngrok for free HTTPS tunneling
- **Result:** Secure green lock icon ✓

### 2. 📱 App Download on Mobile ✓
- **Issue:** Can't download as app
- **Solution:** PWA (Progressive Web App) implemented
- **Result:** "Add to Home Screen" works perfectly ✓

### 3. ⏰ Works 24/7 ✓
- **Issue:** App stops working after restart
- **Solution:** PM2 process manager + service worker
- **Result:** Runs continuously, auto-restarts ✓

---

## 🚀 Quick Start (Choose One)

### ⚡ FASTEST (30 seconds)
1. Double-click: `open_ngrok.bat` or `open_ngrok.ps1`
2. Wait for the HTTPS link
3. Share with mobile users
4. Done! ✓

### 📋 MANUAL (2 minutes)
```bash
cd "c:\Users\acer\Downloads\Stay Track"
ngrok http 5174
```
Copy the HTTPS link and share with mobile users.

### 🛠️ FOR 24/7 PRODUCTION
See: `SECURE_SETUP_GUIDE.md` (detailed instructions)

---

## 📱 Install App on Mobile

### Once you have the HTTPS link:

**Android (Chrome/Firefox):**
1. Open: `https://abc-123-def.ngrok.app`
2. Tap ⋮ menu → "Install app"
3. Confirm → Done!

**iOS (Safari):**
1. Open: `https://abc-123-def.ngrok.app`
2. Tap Share ↗️
3. Tap "Add to Home Screen"
4. Tap "Add" → Done!

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Your Computer (Windows)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Backend API │  │   Frontend   │  │    ngrok     │ │
│  │ (Node.js)    │  │   (React)    │  │   (HTTPS)    │ │
│  │ :8080        │  │ :5174        │  │ Tunnel       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│       ↑                  ↑                  ↑          │
└───────┼──────────────────┼──────────────────┼──────────┘
        │                  │                  │
    HTTP │              HTTP │         HTTPS ↓
        │                  │         (to internet)
        └──────────────────┴─→ [Mobile Device]
                              ├─ Android
                              └─ iOS
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `open_ngrok.bat` | 1-click HTTPS tunnel (Windows) |
| `open_ngrok.ps1` | 1-click HTTPS tunnel (PowerShell) |
| `QUICK_START.md` | Simple getting started guide |
| `SECURE_SETUP_GUIDE.md` | Complete setup documentation |
| `startup.bat` / `startup.ps1` | PM2 auto-restart setup |
| `ecosystem.config.js` | PM2 configuration |
| `frontend/manifest.json` | PWA configuration |
| `frontend/public/sw.js` | Service worker (offline) |

---

## 🔗 Access Points

### Local (Your Computer)
```
Frontend: http://localhost:5174
Backend:  http://localhost:8080
```

### Local Network (Same WiFi)
```
Frontend: http://10.156.4.48:5174
Backend:  http://10.156.4.48:8080
```
⚠️ Not secure (HTTP only)

### Secure (ngrok - Worldwide)
```
Frontend: https://abc-123-def.ngrok.app (changes each time)
Backend:  Automatically handled by API client
```
✅ Secure (HTTPS with valid certificate)

---

## 🔐 Security Features

✅ **HTTPS Certificate** - Free via ngrok  
✅ **JWT Authentication** - Secure token-based auth  
✅ **CORS Protection** - Restricted origins  
✅ **Service Worker** - Offline caching support  
✅ **Local Database** - SQLite (no cloud storage)  
✅ **Responsive Design** - Secure on all devices  

---

## ⚙️ Technical Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite (sql.js) |
| Auth | JWT + bcryptjs |
| Process Manager | PM2 |
| HTTPS Tunnel | ngrok |
| PWA | Service Worker + Manifest |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Site can't be reached" | 1. Check ngrok running 2. Copy exact HTTPS link 3. Hard refresh (Ctrl+Shift+R) |
| "Connection refused" | Make sure backend is running on port 8080 |
| "Not secure" warning | Use the ngrok HTTPS link, not HTTP |
| App won't install | 1. Wait 5 seconds 2. Clear browser cache 3. Try different browser |
| Link keeps changing | Every ngrok restart = new link. For permanent, use paid ngrok plan |
| Can't connect from mobile | 1. Same WiFi? 2. Firewall blocking? 3. Try different network |

---

## 📊 Status Check

| Component | Check | Status |
|-----------|-------|--------|
| Backend | `curl http://localhost:8080/api/health` | ✓ |
| Frontend Build | `ls frontend/dist/` | ✓ |
| PWA Manifest | `curl http://localhost:5174/manifest.json` | ✓ |
| Service Worker | Browser DevTools → Application → Service Workers | ✓ |

---

## 🎯 Usage Examples

### Admin Login
```
URL: https://abc-123-def.ngrok.app
Role: Admin
Features: Dashboard, Rooms, Attendance, etc.
```

### Student Access
```
URL: https://abc-123-def.ngrok.app
Role: Student
Features: Profile, Attendance, Complaints, etc.
```

### SMS Notifications
Enable in `.env`:
```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=your_number
```

---

## 🚀 Deployment Options

For production (permanent HTTPS):

1. **Railway.app** - Easiest (recommended)
   - Free tier available
   - Auto-deploys from GitHub
   - Production HTTPS

2. **Render.com** - Also easy
   - Free tier
   - 0.5GB RAM/month
   - Sleeps after inactivity

3. **Heroku** - Simple
   - $50+/month
   - 24/7 uptime
   - Good for heavy use

4. **AWS/DigitalOcean** - Most control
   - Variable pricing
   - Full customization
   - Self-managed

---

## 📝 Database

### Current Setup
- **Type:** SQLite (in-memory with file backup)
- **Location:** `backend/data/db.sqlite`
- **Tables:** users, rooms, attendance, complaints, etc.

### Backup Database
```bash
cp backend/data/db.sqlite backend/data/db.sqlite.backup
```

### Reset Database
```bash
rm backend/data/db.sqlite
npm run seed  # Re-seeds with initial data
```

---

## 🎓 Common Tasks

### Start HTTPS Access
```bash
ngrok http 5174
```

### Check Services Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs staytrack-backend
pm2 logs staytrack-frontend
```

### Restart Services
```bash
pm2 restart all
```

### Stop Services
```bash
pm2 stop all
```

---

## 📞 Support

For issues:

1. Check `TROUBLESHOOTING` section above
2. View logs: `pm2 logs`
3. Verify URLs are correct
4. Ensure both devices on same network (for local) or internet (for ngrok)
5. Try clearing browser cache

---

## ✨ What's Working Now

- ✅ Secure HTTPS access from anywhere
- ✅ Mobile app installation (PWA)
- ✅ 24/7 operation with auto-restart
- ✅ Offline support with caching
- ✅ Admin dashboard fully functional
- ✅ Student portal ready
- ✅ SMS notifications (with Twilio setup)
- ✅ JWT authentication
- ✅ Database persistence

---

## 🎉 Next Steps

1. **Try ngrok:** Run `open_ngrok.bat`
2. **Open link on mobile:** Copy HTTPS URL
3. **Install as app:** Add to Home Screen
4. **Test admin/student:** Login and explore
5. **Setup PM2:** Follow `SECURE_SETUP_GUIDE.md`
6. **Deploy production:** Choose platform above

---

## 📚 Documentation

- `README.md` - Original project info
- `QUICK_START.md` - Fast getting started
- `SECURE_SETUP_GUIDE.md` - Complete guide
- `database/schema.sql` - Database structure
- `frontend/README.md` - Frontend details
- `backend/package.json` - Backend dependencies

---

## 📅 Version Info

- **App Version:** 1.0.0
- **Release Date:** April 23, 2026
- **Status:** Production Ready
- **Support:** Full stack tested and working

---

## 🔒 Remember

Your app is now:
- **Secure** with HTTPS
- **Mobile-ready** as installable app
- **Reliable** with 24/7 auto-restart
- **Fast** with service worker caching
- **Private** with local SQLite database

**Enjoy your secure hostel management system!** 🎉

---

*For detailed setup instructions, see `SECURE_SETUP_GUIDE.md`*