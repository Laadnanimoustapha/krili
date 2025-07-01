/*  I disable it because the database is not connected. and i need to log in but it did note allow me to log in without eny gmail  moustapha in 18/6/25




// Security configuration
const SECURITY_CONFIG = {
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    PASSWORD_MIN_LENGTH: 8,
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000 // 24 hours
};

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const lastActivity = localStorage.getItem('lastActivity');
    const loginAttempts = parseInt(localStorage.getItem('loginAttempts') || '0');
    
    // Check for session timeout
    if (isLoggedIn === 'true' && lastActivity) {
        const currentTime = new Date().getTime();
        const lastActivityTime = parseInt(lastActivity);
        
        if (currentTime - lastActivityTime > SECURITY_CONFIG.SESSION_TIMEOUT) {
            // Session expired
            logout('Session expired. Please login again.');
            return;
        }
        
        // Update last activity
        updateLastActivity();
    } else if (isLoggedIn !== 'true') {
        // Check for account lockout
        if (loginAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
            const lockoutTime = localStorage.getItem('lockoutTime');
            if (lockoutTime && new Date().getTime() - parseInt(lockoutTime) < SECURITY_CONFIG.LOCKOUT_DURATION) {
                alert('Account temporarily locked. Please try again later.');
                window.location.href = 'login-test1.html';
                return;
            } else {
                // Reset login attempts after lockout duration
                localStorage.removeItem('loginAttempts');
                localStorage.removeItem('lockoutTime');
            }
        }
        window.location.href = 'login-test1.html';
    }
}

// Update last activity timestamp
function updateLastActivity() {
    localStorage.setItem('lastActivity', new Date().getTime().toString());
}

// Add logout functionality with security measures
function logout(message = 'Logged out successfully') {
    // Clear all sensitive data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutTime');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Clear any cookies
    document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, '').replace(/=./, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
    
    // Show logout message
    alert(message);
    
    // Redirect to login page
    window.location.href = 'login-test1.html';
}

// Track failed login attempts
function trackFailedLogin() {
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0') + 1;
    localStorage.setItem('loginAttempts', attempts.toString());
    
    if (attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        localStorage.setItem('lockoutTime', new Date().getTime().toString());
    }
}

// Reset login attempts on successful login
function resetLoginAttempts() {
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutTime');
}

// Validate password strength
function validatePassword(password) {
    const minLength = SECURITY_CONFIG.PASSWORD_MIN_LENGTH;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
}

// Sanitize user input
function sanitizeInput(input) {
    return input.replace(/[<>]/g, '');
}

// Check auth status when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Add activity listeners to update last activity
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, updateLastActivity);
    });
    
    // Add beforeunload event listener
    window.addEventListener('beforeunload', () => {
        updateLastActivity();
    });
});

// Export functions for use in other files
window.authUtils = {
    checkAuth,
    logout,
    trackFailedLogin,
    resetLoginAttempts,
    validatePassword,
    sanitizeInput,
    updateLastActivity
}; 
*/
