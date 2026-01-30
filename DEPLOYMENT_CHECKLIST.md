# 📋 Deployment Checklist - Real-Time Analysis

## ✅ Pre-Deployment Verification

### Backend Ready:
- [x] Environment variable support added (PORT, SECRET_KEY)
- [x] Production-ready requirements.txt with gunicorn
- [x] Debug mode disabled for production
- [x] CORS configured
- [x] .gitignore properly set

### Frontend Ready:
- [x] vercel.json configured
- [x] index.html as entry point
- [x] Backend URL placeholder ready to update
- [x] All assets in correct directories

---

## 🚀 Deployment Steps

### STEP 1: Push to GitHub

```powershell
# Make sure you're in the project directory
cd C:\Users\patel\OneDrive\Desktop\Nisarg

# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Production-ready deployment"

# Push (if already connected to GitHub)
git push

# If NOT connected to GitHub yet:
# 1. Create repo on https://github.com/new
# 2. Run these commands:
git remote add origin https://github.com/YOUR_USERNAME/real-time-analysis.git
git branch -M main
git push -u origin main
```

### STEP 2: Deploy Backend on Render

1. **Go to Render**: https://render.com
2. **Sign up/Login** with GitHub
3. **New Web Service**: Click "New +" → "Web Service"
4. **Connect Repository**: Select `real-time-analysis` (or your repo name)
5. **Configure**:
   - Name: `real-time-analysis-backend`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
   - Instance Type: **Free**

6. **Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   - `SECRET_KEY` = `your-random-secret-key-12345678`
   - `FLASK_ENV` = `production`

7. **Deploy**: Click "Create Web Service"
8. **Wait**: 5-10 minutes for first deployment
9. **Copy URL**: `https://real-time-analysis-backend.onrender.com`

### STEP 3: Update Frontend with Backend URL

1. Open `frontend/js/app.js`
2. Change line 3:
   ```javascript
   const BACKEND_URL = 'https://real-time-analysis-backend.onrender.com';
   ```
3. Save, commit, and push:
   ```powershell
   git add frontend/js/app.js
   git commit -m "Update backend URL for production"
   git push
   ```

### STEP 4: Deploy Frontend on Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Import Project**: Click "Add New..." → "Project"
4. **Select Repository**: Choose `real-time-analysis`
5. **Configure**:
   - Project Name: `real-time-analysis`
   - Framework: `Other`
   - Root Directory: `frontend` ← **IMPORTANT: Click Edit and set this**
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

6. **Deploy**: Click "Deploy"
7. **Wait**: 1-2 minutes
8. **Your URL**: `https://real-time-analysis.vercel.app`

---

## ✅ Testing Checklist

After deployment, test these:

- [ ] Backend health check: `https://YOUR-BACKEND-URL.onrender.com/health`
- [ ] Backend status: `https://YOUR-BACKEND-URL.onrender.com/`
- [ ] Frontend loads: `https://YOUR-FRONTEND-URL.vercel.app`
- [ ] Can enter username and join
- [ ] Can send messages
- [ ] Open 2 browser windows and test real-time sync
- [ ] Notifications work (when window not focused)
- [ ] User join/leave notifications appear

---

## 📝 Your Deployment URLs

Fill these in after deployment:

**GitHub Repository**:
```
https://github.com/YOUR_USERNAME/real-time-analysis
```

**Backend (Render)**:
```
https://_____________________________.onrender.com
```

**Frontend (Vercel)**:
```
https://_____________________________.vercel.app
```

---

## ⚠️ Important Notes

### Render Free Tier:
- App sleeps after 15 min of inactivity
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month (enough for one app)

### After Changes:
1. Edit code locally
2. `git add .`
3. `git commit -m "Your changes"`
4. `git push`
5. Both platforms auto-deploy!

---

## 🎉 Deployment Complete!

Once all steps are done, your Real-Time Analysis app is **LIVE**!

Share your Vercel URL with others to test the app together.
