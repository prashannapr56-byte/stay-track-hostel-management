# Vercel Deployment Guide for Stay Track

## Overview
Stay Track is a full-stack application with React frontend and Node.js backend. This guide covers deploying **both services together** to Vercel using experimentalServices.

---

## Updated Approach: Deploy Both Frontend & Backend Together

Vercel now supports deploying multiple services in a single project! Your `vercel.json` is configured to:

- **Frontend**: React + Vite at root path `/`
- **Backend**: Node.js at `/_/backend` path

---

## Step 1: Prepare Backend for Vercel

### Update backend package.json

Your backend already has the correct structure:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  }
}
```

### Create backend environment variables

**backend/.env.example** (already exists):
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
DATABASE_URL=your_database_url_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

---

## Step 2: Deploy to Vercel

### Using Vercel Web Dashboard (Recommended)

1. **Go to Vercel:**
   - https://vercel.com/new

2. **Connect GitHub:**
   - Select `stay-track-hostel-management` repository
   - Authorize if needed

3. **Configure Project:**
   - **Project name**: `stay-track`
   - **Framework**: Auto-detected (Vite for frontend)
   - **Root Directory**: `./` (keep default)

4. **Environment Variables:**
   - Set variables from `backend/.env.example`
   - Examples:
     ```
     JWT_SECRET=your_secret_key_12345
     TWILIO_ACCOUNT_SID=AC1234567890abcdef
     TWILIO_AUTH_TOKEN=your_auth_token
     TWILIO_PHONE_NUMBER=+1234567890
     DATABASE_URL=sqlite:./data/database.db
     ```

5. **Deploy:**
   - Click **Deploy**
   - Wait for build to complete (2-5 minutes)

### Using Vercel CLI

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Login:**
   ```powershell
   vercel login
   ```

3. **Deploy from project root:**
   ```powershell
   cd "c:\Users\acer\Downloads\Stay Track"
   vercel --prod
   ```

4. **Follow prompts and set environment variables**

---

## Step 3: Update Frontend API Configuration

### Update .env.production

**frontend/.env.production**:
```
VITE_API_BASE_URL=https://your-project.vercel.app/_/backend/api
```

### Update frontend API client

**frontend/src/api/client.js**:
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/_/backend/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add interceptor for token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## Step 4: Update Backend CORS Configuration

Update your backend to accept requests from Vercel domain:

**backend/src/server.js**:
```javascript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://your-project.vercel.app',
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000'  // Local backend
  ],
  credentials: true
}));
```

---

## Project Structure for Vercel

```
stay-track-hostel-management/
├── vercel.json                    # Multi-service config
├── VERCEL_DEPLOYMENT.md          # This guide
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.production           # Frontend env for Vercel
│   ├── .env.local                # Local dev env
│   └── src/
│       ├── api/client.js         # API configuration
│       └── ...
└── backend/
    ├── package.json
    ├── src/
    │   ├── server.js             # Entry point
    │   ├── app.js                # Express app
    │   ├── routes/
    │   │   ├── admin.js
    │   │   ├── auth.js
    │   │   └── student.js
    │   └── ...
    ├── .env.example              # Environment variables
    └── data/                      # Database files
```

---

## Vercel Configuration Details

### vercel.json Explanation

```json
{
  "experimentalServices": {
    "frontend": {
      "root": "frontend",        // Frontend folder
      "routePrefix": "/",        // Serves at root path
      "framework": "vite"        // Uses Vite build
    },
    "backend": {
      "root": "backend",         // Backend folder
      "routePrefix": "/_/backend" // Serves at /_/backend path
    }
  }
}
```

**Path Examples:**
- Frontend: `https://your-project.vercel.app/`
- Backend API: `https://your-project.vercel.app/_/backend/api/auth/login`
- Backend Routes: `https://your-project.vercel.app/_/backend/api/students`

---

## Complete Deployment Checklist

- [ ] Push latest code to GitHub
- [ ] Verify `vercel.json` exists with experimentalServices
- [ ] Prepare backend environment variables
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy and verify build succeeds
- [ ] Update `.env.production` with Vercel URL
- [ ] Test API connectivity
- [ ] Check browser console for CORS errors
- [ ] Set up custom domain (optional)

---

## Common Issues & Solutions

### Issue: "Cannot GET /_/backend/api/..."
**Solution**: 
- Check `backend/src/server.js` has proper routing
- Ensure backend starts on correct port
- Verify backend doesn't require `/api` prefix if routePrefix is set

### Issue: CORS Errors
**Solution**:
```javascript
app.use(cors({
  origin: 'https://your-vercel-domain.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Issue: "Build failed" 
**Solution**:
- Check Vercel build logs
- Ensure all dependencies in package.json
- Verify Node version is compatible
- Check for missing environment variables

### Issue: 404 on frontend routes
**Solution**: Already handled by vercel.json with `cleanUrls: true` (not needed with experimentalServices, but frontend should have proper SPA routing)

### Issue: Database not found
**Solution**:
- For SQLite: Ensure `/backend/data` folder exists
- For remote DB: Set `DATABASE_URL` environment variable
- For SQL Server: Update connection string in `.env`

---

## After Deployment

1. **Get your Vercel URL:**
   - https://your-project.vercel.app
   - Note the full URL from Vercel dashboard

2. **Update environment variables if needed:**
   - Go to Vercel Project Settings
   - Environment Variables
   - Update `VITE_API_BASE_URL` with your Vercel domain

3. **Test the application:**
   - Login page should load
   - API calls should work without CORS errors
   - Database operations should work

4. **Set up custom domain (optional):**
   - Vercel Project Settings → Domains
   - Add your custom domain

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Verify both services work
3. Consider: Database migrations/setup on Vercel
4. Consider: Implement CI/CD with GitHub Actions
5. Monitor: Check Vercel analytics and error logs

