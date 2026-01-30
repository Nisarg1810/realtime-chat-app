# 🚀 Quick Start Guide

## Start the Application

### 1. Start Backend Server

```powershell
cd backend
.\venv\Scripts\python.exe app.py
```

**Expected Output:**
```
Starting Flask Socket.IO server...
Server running on http://localhost:5000
 * Running on http://127.0.0.1:5000
```

### 2. Open Login Page

**Option A: Direct File Access**
- Navigate to `frontend` folder
- Double-click `login.html`

**Option B: VS Code Live Server**
- Right-click on `frontend/login.html`
- Select "Open with Live Server"

### 3. Register & Login

1. **Register a New Account:**
   - Click "Register here" on the login page
   - Enter username (min 3 characters)
   - Enter password (min 6 characters)
   - Confirm password
   - Click "Register"

2. **Login:**
   - Enter your username and password
   - Click "Login"
   - Grant notification permissions when prompted

### 4. Test the Chat

1. **First Browser Window:**
   - Register and login as "Alice"
   - Allow notifications when prompted

2. **Second Browser Window:**
   - Open another tab/window with `login.html`
   - Register and login as "Bob"
   - Allow notifications

3. **Start Chatting:**
   - Type messages in either window
   - See them appear in both windows in real-time!
   - Minimize one window and send a message - see browser notification!

## 📸 What You Should See

### Backend Terminal:
```
Client connected: abc123
User joined: Alice (SID: abc123)
Total online: 1
New user registered: Bob
User logged in: Bob
Message from Alice: Hello!
Client connected: def456
User joined: Bob (SID: def456)
Total online: 2
Message from Bob: Hi Alice!
```

### Frontend:
- Modern login/register page with purple gradient
- Beautiful chat interface
- Username display with logout button
- Online user count
- Real-time messages with timestamps
- Browser notifications (💬 icon)
- Your messages on right (purple), others on left (white)

## ⚡ Features Working

- ✅ User authentication (register/login)
- ✅ Session management
- ✅ Real-time messaging
- ✅ **Web browser notifications**
- ✅ User join/leave notifications
- ✅ Online user count
- ✅ Message timestamps
- ✅ Responsive design
- ✅ XSS protection
- ✅ Password hashing
- ✅ Logout functionality
- ✅ Beautiful UI with animations

## 🎯 Next: Deploy to Production

See [README.md](README.md) for deployment instructions to:
- **Backend**: Render or Railway
- **Frontend**: Vercel

**Enjoy your real-time chat app! 💬**
