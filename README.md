# Real-Time Chat Application

A modern real-time chat application built with HTML/CSS/JavaScript frontend and Flask + Socket.IO backend.

## 🚀 Features

- ✅ **User Authentication** - Register/Login with username and password
- ✅ Real-time messaging using WebSockets
- ✅ **Web Notifications** - Browser notifications for new messages when window is not focused
- ✅ User join/leave notifications
- ✅ Online user count
- ✅ Session management with secure logout
- ✅ Responsive design for mobile and desktop
- ✅ Message timestamps
- ✅ Clean and modern UI
- ✅ XSS protection
- ✅ Password hashing with Werkzeug

## 📁 Project Structure

```
Nisarg/
├── frontend/               # Frontend files (Deploy to Vercel)
│   ├── login.html         # Login/Register page
│   ├── index.html         # Main chat interface
│   ├── css/
│   │   ├── auth.css       # Login/Register styles
│   │   └── style.css      # Chat UI styles
│   ├── js/
│   │   ├── auth.js        # Authentication logic
│   │   └── app.js         # Chat app with Socket.IO client
│   └── vercel.json        # Vercel configuration
│
├── backend/               # Backend files (Deploy to Render/Railway)
│   ├── app.py            # Flask server with Socket.IO & Authentication
│   ├── requirements.txt  # Python dependencies
│   └── .gitignore       # Backend ignore file
│
└── README.md            # This file
```

## 🛠️ Setup Instructions

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Mac/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the server:**
   ```bash
   python app.py
   ```

   Server will start on `http://localhost:5000`

### Frontend Setup

1. **Open login page:**
   - Open `frontend/login.html` in your browser
   - Or use a local server like Live Server (VS Code extension)

2. **For testing with backend:**
   - Make sure backend is running on `http://localhost:5000`
   - Open `frontend/login.html` in browser
   - Register a new account or login
   - Grant notification permissions when prompted
   - Start chatting!

3. **Test with multiple users:**
   - Open multiple browser windows with `login.html`
   - Register different users
   - Login and test real-time messaging and notifications

## 🌐 Deployment

### Deploy Backend to Render

1. Create account on [Render](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Environment Variables**: Add `PYTHON_VERSION=3.11`
5. Click "Create Web Service"
6. Copy your backend URL (e.g., `https://your-app.onrender.com`)

### Deploy Frontend to Vercel

1. Create account on [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Other
5. Before deploying, update `frontend/js/app.js`:
   ```javascript
   const BACKEND_URL = 'https://your-backend-url.onrender.com';
   ```
6. Click "Deploy"

### Alternative: Deploy Backend to Railway

1. Create account on [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `python app.py`
5. Add environment variable: `PORT=5000`
6. Deploy and copy your backend URL

## 🧪 Testing

### Test Backend API

```bash
# Check if server is running
curl http://localhost:5000/

# Check health endpoint
curl http://localhost:5000/health
```

### Test Socket.IO Connection

1. Start backend server
2. Open `frontend/login.html` in **two different browser windows**
3. **Register** two different accounts (e.g., "alice" and "bob")
4. **Login** with both accounts in separate windows
5. Grant **notification permissions** when prompted
6. Send messages - they should appear in both windows in real-time!
7. Minimize one window and send a message from the other - you should see a **browser notification**!
8. Test **logout** functionality from the chat interface

## 🔧 Configuration

### Change Backend URL (Production)

Update both `frontend/js/app.js` and `frontend/js/auth.js`:
```javascript
const BACKEND_URL = 'https://your-backend-url.com';
```

### Change Secret Key (Production)

The backend now generates a secure random key automatically. For production persistence, you can set a fixed key in `backend/app.py`:
```python
app.config['SECRET_KEY'] = 'your-secure-random-key-here'
```

## 📝 Technologies Used

### Frontend
- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript
- Socket.IO Client (v4.5.4)

### Backend
- Python 3.11+
- Flask 3.0.0+
- Flask-SocketIO 5.3.6+
- Flask-CORS 4.0.0+
- Werkzeug (for password hashing)
- Eventlet 0.35.2+

## 🔔 Web Notifications

The app uses the browser's Notification API to send real-time alerts:

- **Automatic Permission Request**: When you first login, you'll be asked to allow notifications
- **Smart Notifications**: Only shows notifications when the chat window is not in focus
- **New Messages**: Get notified when someone sends a message
- **User Activity**: See when users join or leave the chat
- **Click to Focus**: Click any notification to return to the chat window

**Browser Support**: Works in Chrome, Firefox, Edge, Safari (with permission)

## 🎨 Features to Add (Future Enhancements)

- [ ] Multiple chat rooms
- [ ] Private messaging
- [ ] Message history with database (PostgreSQL/MongoDB)
- [ ] Profile pictures/avatars
- [ ] File/image sharing
- [ ] Typing indicators
- [ ] Message reactions (emojis)
- [ ] Dark mode toggle
- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Online/offline status indicators

## 🐛 Troubleshooting

### Backend won't start
- Make sure Python 3.11+ is installed
- Check if virtual environment is activated
- Verify all dependencies are installed: `pip list`

### Frontend can't connect to backend
- Check if backend is running
- Verify BACKEND_URL in `app.js` is correct
- Check browser console for errors
- Ensure CORS is enabled (already configured)

### Messages not sending
- Check browser console for Socket.IO errors
- Verify network connectivity
- Check if backend logs show connection
- Ensure you're logged in (check session)

### Notifications not appearing
- Check if notification permission was granted
- Look for permission status in browser settings
- Notifications only appear when window is not focused
- Check browser console for errors

### Login/Registration issues
- Verify backend server is running
- Check browser console for API errors
- Ensure passwords meet minimum requirements (6+ characters)
- Try clearing browser cache and cookies

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

Created for learning real-time web applications with Flask and Socket.IO.

---

**Happy Chatting! 💬**
