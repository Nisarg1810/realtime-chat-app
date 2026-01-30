# 📋 Deployment Checklist

Use this checklist to deploy your chat application step by step.

## ☐ Pre-Deployment

- [ ] Test application locally
  - [ ] Backend running on http://localhost:5000
  - [ ] Register/Login works
  - [ ] Real-time chat works
  - [ ] Notifications work

## ☐ Step 1: Setup GitHub

- [ ] Create GitHub account (if needed): https://github.com/signup
- [ ] Initialize git in project:
  ```powershell
  cd C:\Users\patel\OneDrive\Desktop\Nisarg
  git init
  git add .
  git commit -m "Initial commit"
  ```
- [ ] Create new repository on GitHub
- [ ] Push code to GitHub:
  ```powershell
  git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
  git branch -M main
  git push -u origin main
  ```

## ☐ Step 2: Deploy Backend (Render)

- [ ] Create Render account: https://render.com
- [ ] Sign in with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Configure:
  - Name: `chat-backend`
  - Root Directory: `backend`
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `python app.py`
- [ ] Set environment variable:
  - `PYTHON_VERSION` = `3.11`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 min)
- [ ] Copy your backend URL (e.g., `https://chat-backend-xxxx.onrender.com`)
- [ ] Test backend:
  - Visit: `https://YOUR_BACKEND_URL/`
  - Should see JSON response

## ☐ Step 3: Update Frontend for Production

- [ ] Open `frontend/js/app.js`
- [ ] Change line 2:
  ```javascript
  const BACKEND_URL = 'https://YOUR_BACKEND_URL.onrender.com';
  ```
- [ ] Open `frontend/js/auth.js`
- [ ] Change line 2:
  ```javascript
  const BACKEND_URL = 'https://YOUR_BACKEND_URL.onrender.com';
  ```
- [ ] Open `backend/app.py`
- [ ] Change line 11:
  ```python
  app.config['SESSION_COOKIE_SECURE'] = True  # Enable HTTPS
  ```
- [ ] Commit and push changes:
  ```powershell
  git add .
  git commit -m "Update for production"
  git push
  ```

## ☐ Step 4: Deploy Frontend (Vercel)

- [ ] Create Vercel account: https://vercel.com
- [ ] Sign up with GitHub
- [ ] Click "Add New..." → "Project"
- [ ] Import your GitHub repository
- [ ] Configure:
  - Framework Preset: `Other`
  - Root Directory: `frontend`
  - Leave other fields empty
- [ ] Click "Deploy"
- [ ] Wait for deployment (1-2 min)
- [ ] Copy your frontend URL (e.g., `https://YOURAPP.vercel.app`)

## ☐ Step 5: Test Production Deployment

- [ ] Open frontend URL in browser
- [ ] Test Registration:
  - [ ] Click "Register here"
  - [ ] Create account
  - [ ] See success message
- [ ] Test Login:
  - [ ] Enter credentials
  - [ ] Redirects to chat
  - [ ] Allow notifications
- [ ] Test Chat (2 windows):
  - [ ] Open frontend in 2 browser windows
  - [ ] Login with different users
  - [ ] Send messages
  - [ ] Messages appear in both windows
- [ ] Test Notifications:
  - [ ] Minimize one window
  - [ ] Send message from other
  - [ ] Browser notification appears
- [ ] Test Logout:
  - [ ] Click logout button
  - [ ] Redirects to login page

## ☐ Post-Deployment

- [ ] Share app URL with friends
- [ ] Monitor Render logs for errors
- [ ] Check Vercel analytics
- [ ] Document any issues

## 🎯 Your Live URLs

**Frontend (Vercel)**:
```
https://_____________________.vercel.app
```

**Backend (Render)**:
```
https://_____________________.onrender.com
```

## 📝 Notes

Write any deployment notes or issues here:

---

---

---

## ✅ Deployment Complete!

Date deployed: _______________

Everything working: [ ] Yes [ ] No

Issues to fix:
-
-
-
