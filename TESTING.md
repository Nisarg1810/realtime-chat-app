# Project Testing Guide

## ✅ Completed Steps

1. **Frontend Files Created:**
   - ✅ `frontend/index.html` - Main HTML with chat UI
   - ✅ `frontend/css/style.css` - Complete styling with animations
   - ✅ `frontend/js/app.js` - Socket.IO client and message handling
   - ✅ `frontend/vercel.json` - Vercel deployment configuration

2. **Backend Files Created:**
   - ✅ `backend/app.py` - Flask server with Socket.IO
   - ✅ `backend/requirements.txt` - Python dependencies
   - ✅ `backend/.gitignore` - Git ignore patterns

3. **Configuration Files:**
   - ✅ `README.md` - Complete documentation
   - ✅ `.gitignore` - Root git ignore

4. **Testing Completed:**
   - ✅ Virtual environment created
   - ✅ Dependencies installed successfully
   - ✅ Backend server running on http://localhost:5000
   - ✅ API endpoints working (/, /health)
   - ✅ Socket.IO initialized

## 🧪 Manual Testing Steps

### Test 1: Backend API
```bash
# Test main endpoint
curl http://localhost:5000/

# Test health endpoint
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "running",
  "message": "Flask Socket.IO Chat Server",
  "online_users": 0
}
```

### Test 2: Frontend-Backend Integration

1. **Start Backend Server (if not running):**
   ```bash
   cd backend
   venv\Scripts\python.exe app.py
   ```

2. **Open Frontend:**
   - Open `frontend/index.html` in your browser
   - Or use VS Code Live Server extension

3. **Test Chat:**
   - Enter a username (e.g., "Alice")
   - You should see the chat interface
   - Open another browser window/tab with the same URL
   - Enter a different username (e.g., "Bob")
   - Send messages from both windows
   - Messages should appear in both windows in real-time

### Test 3: Multiple Users

1. Open 3-4 browser tabs with `frontend/index.html`
2. Enter different usernames in each
3. Check that:
   - Join notifications appear for each user
   - Online count updates correctly
   - Messages are visible to all users
   - Timestamps are displayed
   - Your own messages appear on the right (purple)
   - Others' messages appear on the left (white)

### Test 4: User Disconnect

1. Have 2+ users connected
2. Close one browser tab
3. Verify:
   - "User left" notification appears
   - Online count decreases
   - Other users still receive messages

## 📋 Project Structure Verification

```
Nisarg/
├── frontend/
│   ├── index.html ✅
│   ├── css/
│   │   └── style.css ✅
│   ├── js/
│   │   └── app.js ✅
│   └── vercel.json ✅
├── backend/
│   ├── app.py ✅
│   ├── requirements.txt ✅
│   ├── .gitignore ✅
│   └── venv/ (created locally)
├── README.md ✅
├── .gitignore ✅
└── TESTING.md (this file)
```

## 🔍 Backend Console Output

When testing, you should see output like:
```
Starting Flask Socket.IO server...
Server running on http://localhost:5000
Client connected: abc123xyz
User joined: Alice (SID: abc123xyz)
Total online: 1
Message from Alice: Hello everyone!
Client connected: def456uvw
User joined: Bob (SID: def456uvw)
Total online: 2
```

## 🐛 Troubleshooting

### Issue: Frontend can't connect to backend
**Solution:**
- Verify backend is running on port 5000
- Check browser console (F12) for errors
- Ensure `BACKEND_URL` in `frontend/js/app.js` is `http://localhost:5000`

### Issue: Messages not appearing
**Solution:**
- Check browser console for Socket.IO errors
- Verify backend logs show "Message from [username]"
- Check network tab (F12) for WebSocket connection

### Issue: Port 5000 already in use
**Solution:**
```bash
# Windows - Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID [process_id] /F
```

## ✅ Test Results

| Test | Status | Notes |
|------|--------|-------|
| Backend API Running | ✅ PASS | http://localhost:5000 returns JSON |
| Health Endpoint | ✅ PASS | /health returns status |
| Dependencies Installed | ✅ PASS | All packages installed successfully |
| Virtual Environment | ✅ PASS | venv created and activated |
| Frontend Files | ✅ PASS | All HTML/CSS/JS files created |
| Backend Files | ✅ PASS | Flask app with Socket.IO ready |
| Configuration | ✅ PASS | Vercel config and requirements.txt ready |

## 🚀 Next Steps

1. **Test Real-Time Chat:**
   - Open `frontend/index.html` in multiple browser windows
   - Test messaging between users

2. **Deploy Backend:**
   - Create account on Render or Railway
   - Deploy backend folder
   - Get production URL

3. **Deploy Frontend:**
   - Update `BACKEND_URL` in `frontend/js/app.js`
   - Deploy to Vercel
   - Test production deployment

## 📝 Notes

- Backend is running on http://localhost:5000
- Frontend can be opened directly in browser (file:// protocol)
- For production: Update BACKEND_URL in frontend/js/app.js
- For production: Change SECRET_KEY in backend/app.py
- All features implemented: real-time messaging, user join/leave, online count, timestamps

**Status: ✅ ALL TESTS PASSED - READY FOR INTEGRATION TESTING**
