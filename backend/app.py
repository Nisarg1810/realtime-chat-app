from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO with eventlet for better WebSocket support
socketio = SocketIO(
    app, 
    cors_allowed_origins="*",
    async_mode='eventlet',
    ping_timeout=60,
    ping_interval=25,
    logger=True,
    engineio_logger=True
)

# Store connected users
connected_users = {}
online_count = 0


@app.route('/')
def index():
    return {
        'status': 'running',
        'message': 'Flask Socket.IO Analysis Server',
        'online_users': online_count
    }


@app.route('/health')
def health():
    return {'status': 'healthy', 'online_users': online_count}


@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')


@socketio.on('disconnect')
def handle_disconnect():
    global online_count
    
    # Get username if exists
    username = connected_users.get(request.sid)
    
    # Only process if user was actually in the connected_users list
    if username:
        # Remove from connected users
        del connected_users[request.sid]
        online_count = len(connected_users)
        
        print(f'Client disconnected: {request.sid} ({username})')
        print(f'Total online: {online_count}')
        
        # Broadcast user left to all OTHER clients
        emit('user_left', {
            'username': username,
            'online_count': online_count
        }, broadcast=True, include_self=False)
    else:
        print(f'Client disconnected before joining: {request.sid}')


@socketio.on('user_joined')
def handle_user_joined(data):
    global online_count
    
    username = data.get('username', 'Anonymous')
    connected_users[request.sid] = username
    online_count = len(connected_users)
    
    print(f'User joined: {username} (SID: {request.sid})')
    print(f'Total online: {online_count}')
    
    # Broadcast to all clients
    emit('user_joined', {
        'username': username,
        'online_count': online_count
    }, broadcast=True)


@socketio.on('send_message')
def handle_message(data):
    username = data.get('username', 'Anonymous')
    message = data.get('message', '')
    timestamp = data.get('timestamp', datetime.utcnow().isoformat())
    
    print(f'Message from {username}: {message}')
    
    # Broadcast message to all connected clients
    emit('receive_message', {
        'username': username,
        'message': message,
        'timestamp': timestamp
    }, broadcast=True)


@socketio.on('user_leaving')
def handle_user_leaving(data):
    """Handle explicit user leaving event before disconnect"""
    global online_count
    
    username = data.get('username')
    
    if request.sid in connected_users:
        del connected_users[request.sid]
        online_count = len(connected_users)
        
        print(f'User explicitly leaving: {username} (SID: {request.sid})')
        print(f'Total online: {online_count}')
        
        # Broadcast user left to all OTHER clients
        emit('user_left', {
            'username': username,
            'online_count': online_count
        }, broadcast=True, include_self=False)


@socketio.on_error_default
def default_error_handler(e):
    print(f'An error occurred: {str(e)}')
    return {'error': str(e)}


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV', 'development') == 'development'
    
    print('Starting Flask Socket.IO Analysis Server...')
    print(f'Server running on port {port}')
    print(f'Debug mode: {debug_mode}')
    
    socketio.run(app, host='0.0.0.0', port=port, debug=debug_mode, allow_unsafe_werkzeug=True)
