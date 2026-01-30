// Configuration
const BACKEND_URL = 'http://localhost:5000'; // Change this to your backend URL when deployed

// Global variables
let socket;
let username = '';
let currentSid = null;  // Store current session ID for notification filtering

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
const logoutBtn = document.getElementById('logoutBtn');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    checkAuthentication();

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

    // Logout handler
    logoutBtn.addEventListener('click', handleLogout);
});

// Check if user is authenticated
async function checkAuthentication() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/check-auth`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.authenticated) {
            // Redirect to login page
            window.location.href = 'login.html';
            return;
        }
        
        // User is authenticated, pre-fill username
        const storedUsername = localStorage.getItem('chat_username') || data.username;
        if (storedUsername) {
            usernameInput.value = storedUsername;
        }
        
        // Request notification permission
        requestNotificationPermission();
    } catch (error) {
        console.error('Auth check failed:', error);
        // Still allow chat in case of network error
        requestNotificationPermission();
    }
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted');
                showNotification('Notifications Enabled', 'You will receive notifications for new messages');
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
        transports: ['websocket', 'polling']
    });

    // Connection successful
    socket.on('connect', () => {
        console.log('Connected to server');
        currentSid = socket.id;  // Store own session ID
        // Emit user joined event
        socket.emit('user_joined', { username: username });
    });

    // Receive messages
    socket.on('receive_message', (data) => {
        displayMessage(data);
        
        // Show notification if message is from someone else and window is not focused
        if (data.sender_sid !== currentSid && (!document.hasFocus() || document.hidden)) {
            showNotification(data.username, data.message);
        }
    });

    // User joined notification
    socket.on('user_joined', (data) => {
        // Don't show notification for own join
        if (data.sid !== currentSid) {
            displaySystemMessage(`${data.username} joined the chat`);
            
            // Show browser notification
            if (!document.hasFocus() || document.hidden) {
                showNotification('User Joined', `${data.username} joined the chat`);
            }
        }
        updateOnlineCount(data.online_count);
    });

    // User left notification
    socket.on('user_left', (data) => {
        displaySystemMessage(`${data.username} left the chat`);
        updateOnlineCount(data.online_count);
        
        // Show browser notification
        if (!document.hasFocus() || document.hidden) {
            showNotification('User Left', `${data.username} left the chat`);
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
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        displaySystemMessage('❌ Disconnected from server');
    });
}

// Send message function
function sendMessage() {
    const message = messageInput.value.trim();

    if (message === '') {
        return;
    }

    // Emit message to server
    socket.emit('send_message', {
        username: username,
        message: message,
        timestamp: new Date().toISOString()
    });

    // Clear input
    messageInput.value = '';
    messageInput.focus();
}

// Display message in chat
function displayMessage(data) {
    const messageDiv = document.createElement('div');
    const isOwnMessage = data.username === username;
    messageDiv.className = `message ${isOwnMessage ? 'own' : 'other'}`;

    const timestamp = formatTimestamp(data.timestamp);

    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="username">${escapeHtml(data.username)}</span>
            <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-content">
            ${escapeHtml(data.message)}
        </div>
    `;

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

// Handle logout
async function handleLogout() {
    try {
        // Disconnect socket
        if (socket && socket.connected) {
            socket.disconnect();
        }

        // Call logout API
        await fetch(`${BACKEND_URL}/api/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        // Clear local storage
        localStorage.removeItem('chat_username');

        // Redirect to login
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if API call fails
        window.location.href = 'login.html';
    }
}
