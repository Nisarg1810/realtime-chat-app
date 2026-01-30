from flask import Flask, request, jsonify, session
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

app = Flask(__name__)
app.config['SECRET_KEY'] = secrets.token_hex(16)  # Secure random key
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS

# Enable CORS with credentials
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Initialize SocketIO with credentials
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading', cors_credentials=True)

# Store registered users (in production, use a database)
registered_users = {}

# Store connected users
connected_users = {}
online_count = 0


@app.route('/')
def index():
    return {
        'status': 'running',
        'message': 'Flask Socket.IO Chat Server',
        'online_users': online_count
    }


@app.route('/health')
def health():
    return {'status': 'healthy', 'online_users': online_count}


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    if len(username) < 3:
        return jsonify({'success': False, 'message': 'Username must be at least 3 characters'}), 400
    
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
    
    if username in registered_users:
        return jsonify({'success': False, 'message': 'Username already exists'}), 400
    
    # Hash password and store user
    hashed_password = generate_password_hash(password)
    registered_users[username] = {
        'password': hashed_password,
        'created_at': datetime.utcnow().isoformat()
    }
    
    print(f'New user registered: {username}')
    return jsonify({'success': True, 'message': 'Registration successful'}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    user = registered_users.get(username)
    if not user:
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    if not check_password_hash(user['password'], password):
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    # Set session
    session['username'] = username
    session['logged_in'] = True
    
    print(f'User logged in: {username}')
    return jsonify({'success': True, 'message': 'Login successful', 'username': username}), 200


@app.route('/api/logout', methods=['POST'])
def logout():
    username = session.get('username')
    session.clear()
    print(f'User logged out: {username}')
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200


@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if session.get('logged_in'):
        return jsonify({
            'authenticated': True,
            'username': session.get('username')
        }), 200
    return jsonify({'authenticated': False}), 200


@socketio.on('connect')
def handle_connect():
    global online_count
    online_count += 1
    print(f'Client connected: {request.sid}')
    print(f'Total online: {online_count}')


@socketio.on('disconnect')
def handle_disconnect():
    global online_count
    
    # Get username if exists
    username = connected_users.get(request.sid, 'Unknown User')
    
    # Remove from connected users
    if request.sid in connected_users:
        del connected_users[request.sid]
    
    online_count = len(connected_users)
    
    print(f'Client disconnected: {request.sid} ({username})')
    print(f'Total online: {online_count}')
    
    # Broadcast user left
    emit('user_left', {
        'username': username,
        'online_count': online_count
    }, broadcast=True)


@socketio.on('user_joined')
def handle_user_joined(data):
    global online_count
    
    username = data.get('username', 'Anonymous')
    connected_users[request.sid] = username
    online_count = len(connected_users)
    
    print(f'User joined: {username} (SID: {request.sid})')
    print(f'Total online: {online_count}')
    
    # Broadcast to all clients (including sender for notification)
    emit('user_joined', {
        'username': username,
        'online_count': online_count,
        'sid': request.sid
    }, broadcast=True)


@socketio.on('send_message')
def handle_message(data):
    username = data.get('username', 'Anonymous')
    message = data.get('message', '')
    timestamp = data.get('timestamp', datetime.utcnow().isoformat())
    sender_sid = request.sid
    
    print(f'Message from {username}: {message}')
    
    # Broadcast message to all connected clients
    emit('receive_message', {
        'username': username,
        'message': message,
        'timestamp': timestamp,
        'sender_sid': sender_sid
    }, broadcast=True)


@socketio.on_error_default
def default_error_handler(e):
    print(f'An error occurred: {str(e)}')
    return {'error': str(e)}


if __name__ == '__main__':
    print('Starting Flask Socket.IO server...')
    print('Server running on http://localhost:5000')
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
