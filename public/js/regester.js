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

    // Registration form handling
    async function handleRegister(event) {
      event.preventDefault();
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
      }

      const response = await fetch('https://tar-typical-catsup.glitch.me/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
      });

      const result = await response.json();
      if (result.status === 'success') {
        showNotification('Account created successfully!', 'success');
        setTimeout(() => (window.location.href = 'login-test1.html'), 1500);
      } else {
        showNotification(result.message || 'Registration failed', 'error');
      }
    }

    // Social registration handling
    function socialRegister(provider) {
      showNotification(`Registering with ${provider}...`, 'info');
      setTimeout(() => {
        showNotification(`${provider} registration successful! Redirecting...`, 'success');
        setTimeout(() => {
          window.location.href = 'rent-test1.html';
        }, 1500);
      }, 1500);
    }

    // Notification system
    function showNotification(message, type = 'info', duration = 3000) {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.className = `notification ${type}`;
      notification.classList.add('show');

      setTimeout(() => {
        notification.classList.remove('show');
      }, duration);
    }

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
        document.querySelector('.notification').classList.remove('show');
      }
    });

    // Logout functionality
    function logout() {
      showNotification('Logging out...', 'info');
      // Clear login status from localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      setTimeout(() => {
        showNotification('Successfully logged out', 'success');
        window.location.href = 'login-test1.html';
      }, 1500);
    }