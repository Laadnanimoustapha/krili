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

    // Profile editing functionality
    function editProfile() {
      showNotification('Opening profile editor...', 'info');
      // Here you would typically open a modal or redirect to an edit page
    }

    // Listing management functionality
    function editListing(id) {
      showNotification(`Editing listing #${id}...`, 'info');
      // Here you would typically open a modal or redirect to an edit page
    }

    function deleteListing(id) {
      if (confirm('Are you sure you want to delete this listing?')) {
        showNotification(`Deleting listing #${id}...`, 'info');
        // Here you would typically make an API call to delete the listing
        setTimeout(() => {
          showNotification('Listing deleted successfully', 'success');
        }, 1500);
      }
    }

    // Password change functionality
    function changePassword() {
      showNotification('Opening password change form...', 'info');
      // Here you would typically open a modal or redirect to a password change page
    }

    // Account deletion functionality
    function deleteAccount() {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        showNotification('Deleting account...', 'info');
        // Here you would typically make an API call to delete the account
        setTimeout(() => {
          showNotification('Account deleted successfully', 'success');
          setTimeout(() => {
            window.location.href = 'login-test1.html';
          }, 1500);
        }, 1500);
      }
    }

    // Logout functionality
    function logout() {
      showNotification('Logging out...', 'info');
      // Clear login status from localStorage
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      setTimeout(() => {
        showNotification('Successfully logged out', 'success');
        setTimeout(() => {
          window.location.href = 'login-test1.html';
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

    // Analytics Charts
    function initializeCharts() {
      // Rental Statistics Chart
      const rentalStatsCtx = document.getElementById('rentalStatsChart').getContext('2d');
      new Chart(rentalStatsCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Active Rentals',
            data: [12, 19, 15, 25, 22, 30],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      // Revenue Chart
      const revenueCtx = document.getElementById('revenueChart').getContext('2d');
      new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue (MAD)',
            data: [5000, 7500, 6000, 9000, 8500, 12000],
            borderColor: 'rgba(139, 92, 246, 1)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            }
          }
        }
      });

      // User Engagement Chart
      const engagementCtx = document.getElementById('engagementChart').getContext('2d');
      new Chart(engagementCtx, {
        type: 'doughnut',
        data: {
          labels: ['Views', 'Messages', 'Bookings', 'Reviews'],
          datasets: [{
            data: [300, 150, 80, 45],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(59, 130, 246, 0.4)'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            }
          }
        }
      });

      // Categories Chart
      const categoriesCtx = document.getElementById('categoriesChart').getContext('2d');
      new Chart(categoriesCtx, {
        type: 'polarArea',
        data: {
          labels: ['Electronics', 'Vehicles', 'Sports', 'Tools', 'Furniture'],
          datasets: [{
            data: [35, 25, 20, 15, 10],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(59, 130, 246, 0.6)',
              'rgba(139, 92, 246, 0.6)'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            }
          }
        }
      });
    }

    // Initialize charts when the page loads
    document.addEventListener('DOMContentLoaded', function() {
      initializeCharts();
    });

    function toggleQuickActions() {
      const quickActions = document.querySelector('.quick-actions');
      quickActions.classList.toggle('show');
    }

    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    function showLoading() {
      document.querySelector('.loading-overlay').classList.add('show');
    }

    function hideLoading() {
      document.querySelector('.loading-overlay').classList.remove('show');
    }

    function addNewListing() {
      window.location.href = 'creat add.html';
    }

    function refreshData() {
      showLoading();
      setTimeout(() => {
        hideLoading();
        showNotification('Data refreshed successfully', 'success');
      }, 1000);
    }

    function exportData() {
      showLoading();
      setTimeout(() => {
        hideLoading();
        showNotification('Data exported successfully', 'success');
      }, 1000);
    }

    // Show/hide scroll to top button based on scroll position
    window.addEventListener('scroll', () => {
      const scrollToTopBtn = document.querySelector('.scroll-to-top');
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('show');
      } else {
        scrollToTopBtn.classList.remove('show');
      }
    });

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

    // Rental History Functions
    function viewRentalDetails(id) {
      showNotification(`Loading rental #${id} details...`, 'info');
      // Here you would typically open a modal or redirect to a details page
    }

    function cancelRental(id) {
      if (confirm('Are you sure you want to cancel this rental?')) {
        showNotification(`Cancelling rental #${id}...`, 'info');
        // Here you would typically make an API call to cancel the rental
        setTimeout(() => {
          showNotification('Rental cancelled successfully', 'success');
        }, 1500);
      }
    }

    function leaveReview(id) {
      showNotification(`Opening review form for rental #${id}...`, 'info');
      // Here you would typically open a modal or redirect to a review page
    }

    // Initialize all sections with animations
    document.addEventListener('DOMContentLoaded', function() {
      initializeCharts();
      
      // Add animation classes to new sections
      const sections = document.querySelectorAll('.rental-history-section, .earnings-section, .verification-section');
      sections.forEach((section, index) => {
        section.style.animationDelay = `${0.6 + index * 0.1}s`;
      });
    });