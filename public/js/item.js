
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

    // Image gallery functionality
    function changeImage(src) {
      document.getElementById('mainImage').src = src;
    }

    // Rental period selection
    document.querySelectorAll('.period-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelector('.period-option.active').classList.remove('active');
        option.classList.add('active');
        showNotification(`Selected ${option.textContent} rental period`, 'info');
      });
    });

    // Rent item functionality
    function rentItem() {
      showNotification('Processing rental request...', 'info');
      setTimeout(() => {
        showNotification('Rental request sent! Owner will contact you shortly.', 'success');
      }, 1500);
    }

    // Contact owner functionality
    function contactOwner() {
      showNotification('Opening chat with owner...', 'info');
      setTimeout(() => {
        window.location.href = 'chat.html';
      }, 1000);
    }

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