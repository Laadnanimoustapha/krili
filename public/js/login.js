
    // Theme toggle functionality
    function toggleTheme() {
      const body = document.body;
      const themeIcon = document.getElementById('theme-icon');
      const currentTheme = body.getAttribute('data-theme');
      
      if (currentTheme === 'light') {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        showNotification('Switched to dark theme', 'success');
      } else {
        body.setAttribute('data-theme', 'light');
        themeIcon.className = 'fas fa-sun';
        showNotification('Switched to light theme', 'success');
      }
    }

    // Check if user is already logged in
    function checkLoginStatus() {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        window.location.href = 'rent-test1.html';
      }
    }

    // Login form handling
    function handleLogin(event) {
      event.preventDefault();
      const form = event.target;
      const email = form.querySelector('input[type="email"]');
      const password = form.querySelector('input[type="password"]');
      let isValid = true;

      // Reset error states
      form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
      });

      // Validate email
      if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        email.parentElement.classList.add('error');
        isValid = false;
        showNotification('Please enter a valid email address', 'error');
        return;
      }

      // Validate password
      if (password.value.length < 6) {
        password.parentElement.classList.add('error');
        isValid = false;
        showNotification('Password must be at least 6 characters', 'error');
        return;
      }

      if (isValid) {
        showLoading();
        showNotification('Logging in...', 'info');
        setTimeout(() => {
          hideLoading();
          // Simulate successful login locally
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userEmail', email.value);
          showNotification('Login successful!', 'success');
          setTimeout(() => {
            window.location.href = 'rent-test1.html';
          }, 1000);
        }, 1200);
      }
    }

    // Social login handling
    function socialLogin(provider) {
      showLoading();
      showNotification(`Logging in with ${provider}...`, 'info');
      // Simulate social login
      setTimeout(() => {
        hideLoading();
        // Set login status in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', `${provider}@example.com`);
        showNotification('Login successful!', 'success');
        setTimeout(() => {
          window.location.href = 'rent-test1.html';
        }, 1000);
      }, 1500);
    }

    // Notification system
    function showNotification(message, type = 'info', duration = 3000) {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.className = `notification ${type}`;
      notification.style.display = 'block';
      notification.classList.add('show');

      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          notification.style.display = 'none';
        }, 300); // Wait for fade out animation
      }, duration);
    }

    // Loading overlay
    function showLoading() {
      document.querySelector('.loading-overlay').classList.add('show');
    }

    function hideLoading() {
      document.querySelector('.loading-overlay').classList.remove('show');
    }

    // Initialize loading overlay
    window.addEventListener('load', () => {
      hideLoading();
    });

    // Show loading on page transitions
    document.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.getAttribute('href').startsWith('#')) return;
        showLoading();
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // T for theme toggle
      if (e.key === 't' || e.key === 'T') {
        if (document.activeElement.tagName !== 'INPUT') {
          toggleTheme();
        }
      }
      
      // Escape to close notifications
      if (e.key === 'Escape') {
        const notification = document.querySelector('.notification');
        notification.classList.remove('show');
        setTimeout(() => {
          notification.style.display = 'none';
        }, 300);
      }
    });

    // Logout functionality
    function logout() {
      showNotification('Logging out...', 'info');
      setTimeout(() => {
        // Clear login status from localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        showNotification('Successfully logged out', 'success');
        window.location.href = 'login-test1.html';
      }, 1500);
    }

    // Check login status when page loads
    document.addEventListener('DOMContentLoaded', checkLoginStatus);

    // Password visibility toggle
    function togglePassword(button) {
      const passwordInput = button.previousElementSibling.previousElementSibling;
      const icon = button.querySelector('i');
      
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
      } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
      }
    }