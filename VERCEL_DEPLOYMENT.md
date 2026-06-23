# Vercel Deployment Guide for Stay Track

## Overview
Stay Track is a full-stack application with React frontend and Node.js backend. This guide covers deploying to Vercel.

---

## Step 1: Set Up Frontend for Vercel

### Create vercel.json in root directory

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Create .env files for frontend

**frontend/.env.production**
```
VITE_API_BASE_URL=https://your-backend-url.com/api
```

**frontend/.env.local** (for local development)
```
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Step 2: Deploy Frontend to Vercel

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```powershell
   vercel login
   ```

3. **Deploy from project root:**
   ```powershell
   cd "c:\Users\acer\Downloads\Stay Track"
   vercel --prod
   ```

4. **Follow the prompts:**
   - Project name: `stay-track`
   - Framework: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`

### Option B: Using GitHub (Automatic)

1. Push your code to GitHub (already done ✅)
2. Go to https://vercel.com/new
3. Select your GitHub repository: `stay-track-hostel-management`
4. Set these settings:
   - **Framework**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**

---

## Step 3: Backend Deployment Options

Your Node.js backend can be deployed to:

### Option 1: Railway (Easiest)
- Deploy for free with database support
- https://railway.app
- Good for small projects

### Option 2: Render
- Free tier available
- https://render.com
- Easy GitHub integration

### Option 3: Heroku Alternative (Koyeb)
- Free tier: https://www.koyeb.com
- PostgreSQL/MySQL support

### Option 4: AWS Lambda + API Gateway
- Serverless option
- More complex setup

---

## Step 4: Environment Variables

### In Vercel Dashboard:

1. Go to your project settings
2. Click "Environment Variables"
3. Add these variables:

```
VITE_API_BASE_URL=https://your-backend-api.com
```

### For Backend (wherever you host it):

```
DATABASE_URL=your_database_connection_string
NODE_ENV=production
PORT=3000
JWT_SECRET=your_secret_key
```

---

## Step 5: Update API Endpoint

After backend deployment, update your frontend:

**frontend/src/api/client.js**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});
```

---

## Complete Deployment Checklist

- [ ] Push latest code to GitHub
- [ ] Create frontend environment files
- [ ] Deploy frontend to Vercel
- [ ] Get backend API URL
- [ ] Set Vercel environment variables
- [ ] Test API connectivity
- [ ] Set up custom domain (optional)

---

## Common Issues & Solutions

### Issue: "API connection failed"
**Solution**: Check VITE_API_BASE_URL environment variable matches your backend URL

### Issue: "Build fails on Vercel"
**Solution**: 
- Check package.json versions
- Ensure all dependencies are listed
- Check build logs in Vercel dashboard

### Issue: "CORS errors"
**Solution**: Configure CORS in your backend:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://your-vercel-domain.vercel.app',
  credentials: true
}));
```

---

## Next Steps

1. **Deploy Frontend to Vercel**
2. **Choose backend hosting platform**
3. **Connect frontend to backend API**
4. **Set up custom domain**
5. **Enable HTTPS** (automatic on Vercel)
