// Configuration
// IMPORTANT: Update this URL after deploying backend to Render
const BACKEND_URL = 'https://realtime-chat-app-3ij2.onrender.com'; // Change to: https://your-app-name.onrender.com

// Global variables
let socket;
let username = '';
let replyToMessage = null;

// DOM Elements
const usernameModal = document.getElementById('usernameModal');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');
const chatContainer = document.getElementById('chatContainer');
const messageArea = document.getElementById('messageArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const currentUsername = document.getElementById('currentUsername');
const onlineCount = document.getElementById('onlineCount');
const replyPreview = document.getElementById('replyPreview');
const replyUsername = document.getElementById('replyUsername');
const replyText = document.getElementById('replyText');
const cancelReply = document.getElementById('cancelReply');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Request notification permission on page load
    requestNotificationPermission();

    // Focus on username input
    usernameInput.focus();

    // Join chat on button click
    joinBtn.addEventListener('click', joinChat);

    // Join chat on Enter key
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinChat();
        }
    });

    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);

    // Send message on Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Cancel reply
    cancelReply.addEventListener('click', () => {
        replyToMessage = null;
        replyPreview.classList.add('hidden');
        messageInput.focus();
    });

    // Disconnect socket when page is closed or refreshed
    // Using multiple events to ensure disconnect is caught
    const handlePageLeave = () => {
        if (socket && socket.connected) {
            console.log('Page leaving, sending user_leaving event');
            // Emit explicit leaving event before disconnect
            socket.emit('user_leaving', { username: username });
            socket.disconnect();
        }
    };

    window.addEventListener('beforeunload', handlePageLeave);
    window.addEventListener('pagehide', handlePageLeave);
    window.addEventListener('unload', handlePageLeave);

    // Handle page visibility change (mobile browsers)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && socket && socket.connected) {
            // Don't disconnect on visibility change, just log it
            console.log('Page hidden, but keeping connection alive');
        }
    });
});

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted');
                showNotification('Real-Time Analysis', 'You will receive notifications for new messages');
            }
        });
    }
}

// Join chat function
function joinChat() {
    const enteredUsername = usernameInput.value.trim();

    if (enteredUsername === '') {
        alert('Please enter a username');
        return;
    }

    username = enteredUsername;
    currentUsername.textContent = username;

    // Store username in localStorage
    localStorage.setItem('analysis_username', username);

    // Hide modal and show chat
    usernameModal.style.display = 'none';
    chatContainer.classList.remove('hidden');

    // Focus on message input
    messageInput.focus();

    // Initialize Socket.IO connection
    initializeSocket();
}

// Initialize Socket.IO
function initializeSocket() {
    socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000
    });

    // Connection successful
    socket.on('connect', () => {
        console.log('Connected to server, SID:', socket.id);
        // Emit user joined event
        socket.emit('user_joined', { username: username });
    });

    // Receive messages
    socket.on('receive_message', (data) => {
        displayMessage(data);
        
        // Send delivered acknowledgment if it's not our own message
        if (data.username !== username && data.message_id) {
            socket.emit('message_delivered', { message_id: data.message_id });
        }
        
        // Send read acknowledgment if window is focused
        if (data.username !== username && data.message_id && document.hasFocus()) {
            socket.emit('message_read', { message_id: data.message_id });
        }
        
        // Show notification if message is from someone else and window is not focused
        if (data.username !== username && (!document.hasFocus() || document.hidden)) {
            showNotification(data.username, data.message);
        }
    });

    // Handle message status updates (ticks)
    socket.on('message_status_update', (data) => {
        updateMessageStatus(data.message_id, data.status);
    });

    // User joined notification
    socket.on('user_joined', (data) => {
        // Don't show notification for own join
        if (data.username !== username) {
            displaySystemMessage(`${data.username} joined the analysis`);
            
            // Show browser notification
            if (!document.hasFocus() || document.hidden) {
                showNotification('User Joined', `${data.username} joined the analysis`);
            }
        }
        updateOnlineCount(data.online_count);
    });

    // User left notification
    socket.on('user_left', (data) => {
        console.log('User left event received:', data);
        displaySystemMessage(`${data.username} left the analysis`);
        updateOnlineCount(data.online_count);
        
        // Show browser notification
        if (!document.hasFocus() || document.hidden) {
            showNotification('User Left', `${data.username} left the analysis`);
        }
    });

    // Update online count
    socket.on('update_online_count', (data) => {
        updateOnlineCount(data.online_count);
    });

    // Connection error
    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        displaySystemMessage('❌ Unable to connect to server. Please check if the backend is running.');
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        displaySystemMessage('❌ Disconnected from server');
    });

    // Reconnection attempt
    socket.on('reconnect_attempt', () => {
        console.log('Attempting to reconnect...');
    });

    // Reconnected successfully
    socket.on('reconnect', () => {
        console.log('Reconnected to server');
        displaySystemMessage('✅ Reconnected to server');
        // Rejoin with username
        socket.emit('user_joined', { username: username });
    });
}

// Send message function
function sendMessage() {
    const message = messageInput.value.trim();

    if (message === '') {
        return;
    }

    const messageData = {
        username: username,
        message: message,
        timestamp: new Date().toISOString()
    };

    // Add reply data if replying
    if (replyToMessage) {
        messageData.reply_to = {
            username: replyToMessage.username,
            message: replyToMessage.message
        };
        // Clear reply
        replyToMessage = null;
        replyPreview.classList.add('hidden');
    }

    // Emit message to server
    socket.emit('send_message', messageData);

    // Clear input
    messageInput.value = '';
    messageInput.focus();
}

// Display message in chat
function displayMessage(data) {
    const messageDiv = document.createElement('div');
    const isOwnMessage = data.username === username;
    messageDiv.className = `message ${isOwnMessage ? 'own' : 'other'}`;
    
    // Set data attribute for message ID
    if (data.message_id) {
        messageDiv.setAttribute('data-message-id', data.message_id);
    }
    
    // Get message length color
    const messageLength = data.message.length;
    const colorClass = getMessageColorClass(messageLength);

    const timestamp = formatTimestamp(data.timestamp);
    
    // Build reply HTML if message is a reply
    let replyHTML = '';
    if (data.reply_to) {
        replyHTML = `
            <div class="reply-reference">
                <div class="reply-bar"></div>
                <div class="reply-info">
                    <strong>${escapeHtml(data.reply_to.username)}</strong>
                    <p>${escapeHtml(data.reply_to.message.substring(0, 50))}${data.reply_to.message.length > 50 ? '...' : ''}</p>
                </div>
            </div>
        `;
    }

    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="username">${escapeHtml(data.username)}</span>
            <span class="timestamp">${timestamp}</span>
        </div>
        ${replyHTML}
        <div class="message-content ${colorClass}">
            ${escapeHtml(data.message)}
        </div>
        ${isOwnMessage ? '<div class="message-status"><span class="status-tick" data-status="sent">✓</span></div>' : ''}
    `;

    // Add reply button for other users' messages
    if (!isOwnMessage) {
        const replyBtn = document.createElement('button');
        replyBtn.className = 'reply-btn';
        replyBtn.innerHTML = '↩️';
        replyBtn.title = 'Reply';
        replyBtn.onclick = () => setReplyTo(data);
        messageDiv.querySelector('.message-content').appendChild(replyBtn);
    }

    messageArea.appendChild(messageDiv);
    scrollToBottom();
}

// Display system message
function displaySystemMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = message;
    messageArea.appendChild(messageDiv);
    scrollToBottom();
}

// Update online count
function updateOnlineCount(count) {
    onlineCount.textContent = `● ${count} online`;
}

// Scroll to bottom of message area
function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}

// Format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show browser notification
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💬</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💬</text></svg>',
            tag: 'chat-notification',
            requireInteraction: false
        });
        
        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
        
        // Focus window when notification is clicked
        notification.onclick = function() {
            window.focus();
            this.close();
        };
    }
}

// Set reply to message
function setReplyTo(messageData) {
    replyToMessage = messageData;
    replyUsername.textContent = messageData.username;
    replyText.textContent = messageData.message.substring(0, 100) + (messageData.message.length > 100 ? '...' : '');
    replyPreview.classList.remove('hidden');
    messageInput.focus();
}

// Update message status (ticks)
function updateMessageStatus(messageId, status) {
    const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageDiv) return;
    
    const statusTick = messageDiv.querySelector('.status-tick');
    if (!statusTick) return;
    
    statusTick.setAttribute('data-status', status);
    
    // Update tick display
    if (status === 'sent') {
        statusTick.innerHTML = '✓'; // Single tick
        statusTick.style.color = '#999';
    } else if (status === 'delivered') {
        statusTick.innerHTML = '✓✓'; // Double tick
        statusTick.style.color = '#999';
    } else if (status === 'read') {
        statusTick.innerHTML = '✓✓'; // Double tick blue
        statusTick.style.color = '#4fc3f7';
    }
}

// Get message color class based on length
function getMessageColorClass(length) {
    if (length < 50) {
        return 'msg-short'; // Light color
    } else if (length < 150) {
        return 'msg-medium'; // Medium color
    } else {
        return 'msg-long'; // Darker color
    }
}

// Handle window focus to mark messages as read
window.addEventListener('focus', () => {
    // Mark all visible messages as read
    const messages = document.querySelectorAll('.message.other[data-message-id]');
    messages.forEach(msg => {
        const messageId = msg.getAttribute('data-message-id');
        if (messageId && socket && socket.connected) {
            socket.emit('message_read', { message_id: messageId });
        }
    });
});
