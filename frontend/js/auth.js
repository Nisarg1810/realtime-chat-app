// Configuration
const BACKEND_URL = 'http://localhost:5000';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const loadingSpinner = document.getElementById('loadingSpinner');

// Login elements
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

// Register elements
const registerUsername = document.getElementById('registerUsername');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const registerBtn = document.getElementById('registerBtn');
const registerError = document.getElementById('registerError');
const registerSuccess = document.getElementById('registerSuccess');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    checkExistingAuth();

    // Toggle between login and register
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    // Login handlers
    loginBtn.addEventListener('click', handleLogin);
    loginPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Register handlers
    registerBtn.addEventListener('click', handleRegister);
    registerConfirmPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleRegister();
    });
});

// Check if user is already authenticated
async function checkExistingAuth() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/check-auth`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
            // Redirect to chat
            redirectToChat(data.username);
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

// Show register form
function showRegisterForm() {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    clearMessages();
    registerUsername.focus();
}

// Show login form
function showLoginForm() {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearMessages();
    loginUsername.focus();
}

// Clear all error/success messages
function clearMessages() {
    loginError.classList.add('hidden');
    registerError.classList.add('hidden');
    registerSuccess.classList.add('hidden');
}

// Handle login
async function handleLogin() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    // Validation
    if (!username || !password) {
        showError(loginError, 'Please enter username and password');
        return;
    }

    // Show loading
    setLoading(true, loginBtn);
    clearMessages();

    try {
        const response = await fetch(`${BACKEND_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store username in localStorage
            localStorage.setItem('chat_username', username);
            
            // Redirect to chat
            redirectToChat(username);
        } else {
            showError(loginError, data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(loginError, 'Unable to connect to server. Please try again.');
    } finally {
        setLoading(false, loginBtn);
    }
}

// Handle register
async function handleRegister() {
    const username = registerUsername.value.trim();
    const password = registerPassword.value.trim();
    const confirmPassword = registerConfirmPassword.value.trim();

    // Validation
    if (!username || !password || !confirmPassword) {
        showError(registerError, 'Please fill in all fields');
        return;
    }

    if (username.length < 3) {
        showError(registerError, 'Username must be at least 3 characters');
        return;
    }

    if (password.length < 6) {
        showError(registerError, 'Password must be at least 6 characters');
        return;
    }

    if (password !== confirmPassword) {
        showError(registerError, 'Passwords do not match');
        return;
    }

    // Show loading
    setLoading(true, registerBtn);
    clearMessages();

    try {
        const response = await fetch(`${BACKEND_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Show success message
            showSuccess(registerSuccess, 'Registration successful! Please login.');
            
            // Clear form
            registerUsername.value = '';
            registerPassword.value = '';
            registerConfirmPassword.value = '';
            
            // Switch to login form after 2 seconds
            setTimeout(() => {
                showLoginForm();
                loginUsername.value = username;
                loginPassword.focus();
            }, 2000);
        } else {
            showError(registerError, data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Register error:', error);
        showError(registerError, 'Unable to connect to server. Please try again.');
    } finally {
        setLoading(false, registerBtn);
    }
}

// Show error message
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}

// Show success message
function showSuccess(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
}

// Set loading state
function setLoading(isLoading, button) {
    if (isLoading) {
        button.disabled = true;
        button.textContent = 'Please wait...';
    } else {
        button.disabled = false;
        button.textContent = button.id === 'loginBtn' ? 'Login' : 'Register';
    }
}

// Redirect to chat
function redirectToChat(username) {
    window.location.href = 'index.html';
}
