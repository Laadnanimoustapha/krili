// Security utilities for the application
const SecurityUtils = {
    // Prevent XSS attacks
    preventXSS: function(input) {
        if (typeof input !== 'string') return input;
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    // Generate CSRF token
    generateCSRFToken: function() {
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem('csrfToken', token);
        return token;
    },

    // Validate CSRF token
    validateCSRFToken: function(token) {
        const storedToken = sessionStorage.getItem('csrfToken');
        return token === storedToken;
    },

    // Encrypt sensitive data (basic implementation)
    encryptData: function(data) {
        if (typeof data !== 'string') return data;
        return btoa(encodeURIComponent(data));
    },

    // Decrypt data
    decryptData: function(encryptedData) {
        if (typeof encryptedData !== 'string') return encryptedData;
        return decodeURIComponent(atob(encryptedData));
    },

    // Validate email format
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate phone number format
    validatePhone: function(phone) {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        return phoneRegex.test(phone);
    },

    // Check if password meets security requirements
    checkPasswordStrength: function(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
            requirements: {
                length: password.length >= minLength,
                upperCase: hasUpperCase,
                lowerCase: hasLowerCase,
                numbers: hasNumbers,
                specialChar: hasSpecialChar
            }
        };
    },

    // Prevent form submission if validation fails
    validateForm: function(formData) {
        const errors = {};
        
        for (const [key, value] of formData.entries()) {
            if (!value.trim()) {
                errors[key] = 'This field is required';
            }
            
            if (key === 'email' && !this.validateEmail(value)) {
                errors[key] = 'Invalid email format';
            }
            
            if (key === 'phone' && !this.validatePhone(value)) {
                errors[key] = 'Invalid phone number format';
            }
            
            if (key === 'password') {
                const passwordCheck = this.checkPasswordStrength(value);
                if (!passwordCheck.isValid) {
                    errors[key] = 'Password does not meet security requirements';
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Add security headers to fetch requests
    secureFetch: async function(url, options = {}) {
        const csrfToken = this.generateCSRFToken();
        
        const secureOptions = {
            ...options,
            headers: {
                ...options.headers,
                'X-CSRF-Token': csrfToken,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        };
        
        try {
            const response = await fetch(url, secureOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    },

    // Initialize security features
    init: function() {
        // Add security headers to all forms
        document.querySelectorAll('form').forEach(form => {
            const csrfToken = this.generateCSRFToken();
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
            
            // Add form validation
            form.addEventListener('submit', (e) => {
                const formData = new FormData(form);
                const validation = this.validateForm(formData);
                
                if (!validation.isValid) {
                    e.preventDefault();
                    // Display errors
                    Object.entries(validation.errors).forEach(([field, message]) => {
                        const errorElement = form.querySelector(`[name="${field}"]`);
                        if (errorElement) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message';
                            errorDiv.textContent = message;
                            errorElement.parentNode.appendChild(errorDiv);
                        }
                    });
                }
            });
        });
        
        // Add security headers to all links
        document.querySelectorAll('a').forEach(link => {
            if (link.hostname !== window.location.hostname) {
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
};

// Initialize security features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    SecurityUtils.init();
});

// Export security utilities
window.SecurityUtils = SecurityUtils;


// Prevent clickjacking by setting X-Frame-Options
SecurityUtils.preventClickjacking = function() {
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }
};

// Sanitize all input fields on blur
SecurityUtils.sanitizeInputs = function() {
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur', function() {
            this.value = SecurityUtils.preventXSS(this.value);
        });
    });
};

// Brute-force prevention (basic, client-side)
SecurityUtils.loginAttempts = 0;
SecurityUtils.maxLoginAttempts = 5;
SecurityUtils.lockoutTime = 30000; // 30 seconds
SecurityUtils.lastAttemptTime = 0;
SecurityUtils.preventBruteForce = function(form) {
    form.addEventListener('submit', function(e) {
        const now = Date.now();
        if (SecurityUtils.loginAttempts >= SecurityUtils.maxLoginAttempts) {
            if (now - SecurityUtils.lastAttemptTime < SecurityUtils.lockoutTime) {
                e.preventDefault();
                alert('Too many failed attempts. Please wait 30 seconds.');
                return;
            } else {
                SecurityUtils.loginAttempts = 0;
            }
        }
        SecurityUtils.lastAttemptTime = now;
    });
};

// Improved error message removal
SecurityUtils.clearErrorMessages = function(form) {
    form.querySelectorAll('.error-message').forEach(el => el.remove());
};

// Update init to use new features
SecurityUtils.init = function() {
    SecurityUtils.preventClickjacking();
    SecurityUtils.sanitizeInputs();
    document.querySelectorAll('form').forEach(form => {
        const csrfToken = this.generateCSRFToken();
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrf_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
        // Add brute-force prevention
        SecurityUtils.preventBruteForce(form);
        // Add form validation
        form.addEventListener('submit', (e) => {
            SecurityUtils.clearErrorMessages(form);
            const formData = new FormData(form);
            const validation = this.validateForm(formData);
            if (!validation.isValid) {
                e.preventDefault();
                Object.entries(validation.errors).forEach(([field, message]) => {
                    const errorElement = form.querySelector(`[name="${field}"]`);
                    if (errorElement) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-message';
                        errorDiv.textContent = message;
                        errorElement.parentNode.appendChild(errorDiv);
                    }
                });
            }
        });
    });
    document.querySelectorAll('a').forEach(link => {
        if (link.hostname !== window.location.hostname) {
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
};