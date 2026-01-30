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

# Store connected users: {session_id: username}
connected_users = {}

# Store message statuses: {message_id: {sender_sid, delivered_by: [sid1, sid2], read_by: [sid1, sid2]}}
message_statuses = {}


@app.route('/')
def index():
    return {
        'status': 'running',
        'message': 'Flask Socket.IO Analysis Server',
        'online_users': len(connected_users)
    }


@app.route('/health')
def health():
    return {'status': 'healthy', 'online_users': len(connected_users)}


@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')


@socketio.on('disconnect')
def handle_disconnect():
    # Get username if exists
    username = connected_users.get(request.sid)
    
    # Only process if user was actually in the connected_users list
    if username:
        # Remove from connected users
        del connected_users[request.sid]
        
        online_count = len(connected_users)
        
        print(f'Client disconnected: {request.sid} ({username})')
        print(f'Total online: {online_count}')
        print(f'Remaining users: {list(connected_users.values())}')
        
        # Broadcast user left to ALL clients
        socketio.emit('user_left', {
            'username': username,
            'online_count': online_count
        })
    else:
        print(f'Client disconnected before joining: {request.sid}')


@socketio.on('user_joined')
def handle_user_joined(data):
    username = data.get('username', 'Anonymous')
    
    # Check if this is a reconnection (same username, different session)
    is_new_user = username not in connected_users.values()
    
    # Add or update the user in connected users
    connected_users[request.sid] = username
    
    online_count = len(connected_users)
    
    print(f'User joined: {username} (SID: {request.sid})')
    print(f'Total online: {online_count}')
    print(f'All users: {list(connected_users.values())}')
    
    # Only broadcast join message if this is a new user (not a reconnection)
    if is_new_user:
        # Broadcast to all clients
        socketio.emit('user_joined', {
            'username': username,
            'online_count': online_count
        })
    else:
        # Just update online count without join message
        socketio.emit('online_count_update', {
            'online_count': online_count
        })


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
            
            # Broadcast deletion to all clients
            emit('message_deleted', {
                'message_id': message_id
            }, broadcast=True)


@socketio.on('user_leaving')
def handle_user_leaving(data):
    """Handle explicit user leaving event before disconnect"""
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
