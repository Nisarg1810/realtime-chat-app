from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from datetime import datetime
import os
import uuid

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
connected_users = {}  # {session_id: username}
online_count = 0

# Store message statuses: {message_id: {sender_sid, delivered_by: [sid1, sid2], read_by: [sid1, sid2]}}
message_statuses = {}

# Track user sessions to prevent duplicates: {username: [sid1, sid2]}
user_sessions = {}


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
        
        # Remove from user_sessions
        if username in user_sessions and request.sid in user_sessions[username]:
            user_sessions[username].remove(request.sid)
            if not user_sessions[username]:  # If no more sessions for this user
                del user_sessions[username]
        
        online_count = len(connected_users)
        
        print(f'Client disconnected: {request.sid} ({username})')
        print(f'Total online: {online_count}')
        print(f'Remaining users: {list(connected_users.values())}')
        
        # Broadcast user left to ALL clients (not including_self since they disconnected)
        socketio.emit('user_left', {
            'username': username,
            'online_count': online_count
        })
    else:
        print(f'Client disconnected before joining: {request.sid}')

Remove any old sessions for this username (in case of reconnection)
    if username in user_sessions:
        old_sids = user_sessions[username].copy()
        for old_sid in old_sids:
            if old_sid != request.sid and old_sid in connected_users:
                print(f'Removing old session for {username}: {old_sid}')
                del connected_users[old_sid]
                user_sessions[username].remove(old_sid)
    
    # Always update/set the username for this session
    was_already_connected = request.sid in connected_users
    connected_users[request.sid] = username
    
    # Track this session for the username
    if username not in user_sessions:
        user_sessions[username] = []
    if request.sid not in user_sessions[username]:
        user_sessions[username].append(request.sid)
    
    global online_count
    
    username = data.get('username', 'Anonymous')
    
    # Always update/set the username for this session
    was_already_connected = request.sid in connected_users
    connected_users[request.sid] = username
    online_count = len(connected_users)
    
    if was_already_connected:
        print(f'User reconnected: {username} (SID: {request.sid})')
    else:
        print(f'User joined: {username} (SID: {request.sid})')
    
    print(f'Total online: {online_count}')
    print(f'All users: {list(connected_users.values())}')
    
    # Broadcast to all clients (including self for online count update)
    emit('user_joined', {
        'username': username,
        'online_count': online_count
    }, broadcast=True)
        'online_count': online_count
    }, broadcast=True)


@socketio.on('send_message')
def handle_message(data):
    username = data.get('username', 'Anonymous')
    message = data.get('message', '')
    timestamp = data.get('timestamp', datetime.utcnow().isoformat())
    reply_to = data.get('reply_to')  # Optional reply data
    
    # Generate unique message ID
    message_id = str(uuid.uuid4())
    
    print(f'Message from {username}: {message}')
    
    # Store message status
    message_statuses[message_id] = {
        'sender_sid': request.sid,
        'sender_username': username,
        'delivered_by': [],
        'read_by': []
    }
    
    # Broadcast message to all connected clients
    emit('receive_message', {
        'message_id': message_id,
        'username': username,
        'message': message,
        'timestamp': timestamp,
        'reply_to': reply_to,
        'status': 'sent'
    }, broadcast=True)


@socketio.on('message_delivered')
def handle_message_delivered(data):
    """Client confirms they received the message"""
    message_id = data.get('message_id')
    
    if message_id in message_statuses:
        # Don't count sender as delivered
        if request.sid != message_statuses[message_id]['sender_sid']:
            if request.sid not in message_statuses[message_id]['delivered_by']:
                message_statuses[message_id]['delivered_by'].append(request.sid)
                
                # Notify sender about delivery
                emit('message_status_update', {
                    'message_id': message_id,
                    'status': 'delivered',
                    'count': len(message_statuses[message_id]['delivered_by'])
                }, room=message_statuses[message_id]['sender_sid'])


@socketio.on('message_read')
def handle_message_read(data):
    """Client confirms they read the message"""
    message_id = data.get('message_id')
    
    if message_id in message_statuses:
        # Don't count sender as read
        if request.sid != message_statuses[message_id]['sender_sid']:
            if request.sid not in message_statuses[message_id]['read_by']:
                message_statuses[message_id]['read_by'].append(request.sid)
                
                # Notify sender about read status
                emit('message_status_update', {
                    'message_id': message_id,
                    'status': 'read',
                    'count': len(message_statuses[message_id]['read_by'])
                }, room=message_statuses[message_id]['sender_sid'])


@socketio.on('delete_message')
def handle_delete_message(data):
    """Handle message deletion"""
    message_id = data.get('message_id')
    
    if message_id in message_statuses:
        # Only allow sender to delete their own messages
        if request.sid == message_statuses[message_id]['sender_sid']:
            # Remove from message statuses
            del message_statuses[message_id]
            
            print(f'Message deleted: {message_id}')
        
        # Remove from user_sessions
        if username in user_sessions and request.sid in user_sessions[username]:
            user_sessions[username].remove(request.sid)
            if not user_sessions[username]:
                del user_sessions[username]
        
            
            # Broadcast deletion to all clients
            emit('message_deleted', {
                'message_id': message_id
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
        print(f'Remaining users: {list(connected_users.values())}')
        
        # Broadcast user left to ALL remaining clients
        socketio.emit('user_left', {
            'username': username,
            'online_count': online_count
        })
        
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
