    // Remove floating particles creation
    // function createParticles() { ... }
    // document.addEventListener('DOMContentLoaded', function() { ... });

    // Remove enhanced card interactions (3D tilt)
    document.querySelectorAll('.result-card').forEach(card => {
      card.onmousemove = null;
      card.onmouseleave = null;
    });

    // Remove glitch effect data attribute
    document.addEventListener('DOMContentLoaded', function() {
      const title = document.querySelector('.search-title');
      if (title) {
        title.removeAttribute('data-text');
      }
      // createParticles(); // Removed
    });

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

    // Search functionality
    function handleSearch(event) {
      const searchInput = event.target.value.toLowerCase();
      const itemCards = document.querySelectorAll('.item-card');
      const noResults = document.querySelector('.no-results');
      let hasResults = false;

      showLoading();

      setTimeout(() => {
        itemCards.forEach(card => {
          const title = card.querySelector('.item-title').textContent.toLowerCase();
          const tags = Array.from(card.querySelectorAll('.item-tag'))
            .map(tag => tag.textContent.toLowerCase());

          if (title.includes(searchInput) || tags.some(tag => tag.includes(searchInput))) {
            card.style.display = 'block';
            hasResults = true;
          } else {
            card.style.display = 'none';
          }
        });

        noResults.style.display = hasResults ? 'none' : 'block';
        hideLoading();
      }, 500);
    }

    // Filter functionality
    function toggleFilter(button) {
      const filterButtons = document.querySelectorAll('.filter-btn');
      const itemCards = document.querySelectorAll('.item-card');
      const category = button.textContent.trim();
      
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      showLoading();

      setTimeout(() => {
        if (category === 'All Categories') {
          itemCards.forEach(card => card.style.display = 'block');
        } else {
          itemCards.forEach(card => {
            const tags = Array.from(card.querySelectorAll('.item-tag'))
              .map(tag => tag.textContent);
            card.style.display = tags.includes(category) ? 'block' : 'none';
          });
        }
        hideLoading();
      }, 500);
    }

    // View item functionality
    function viewItem(id) {
      showNotification(`Loading item details...`, 'info');
      setTimeout(() => {
        window.location.href = `item-test1.html?id=${id}`;
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

    // Loading functions
    function showLoading() {
      document.querySelector('.loading-overlay').classList.add('show');
    }

    function hideLoading() {
      document.querySelector('.loading-overlay').classList.remove('show');
    }

    // Clear search
    function clearSearch() {
      const searchInput = document.querySelector('.search-input');
      searchInput.value = '';
      searchInput.focus();
      toggleClearButton();
      // Optionally, reset filters and show all items
      const itemCards = document.querySelectorAll('.item-card');
      itemCards.forEach(card => card.style.display = 'block');
      document.querySelector('.no-results').style.display = 'none';
      updateResultsCount();
    }

    // Toggle clear button visibility
    function toggleClearButton() {
      const input = document.querySelector('.search-input');
      const clearBtn = document.querySelector('.search-clear');
      clearBtn.classList.toggle('visible', input.value.length > 0);
    }

    // Sort functionality
    function sortResults(sortBy) {
      const grid = document.getElementById('results-grid');
      const cards = Array.from(grid.querySelectorAll('.item-card:not([style*="display: none"])'));
      
      cards.sort((a, b) => {
        switch(sortBy) {
          case 'price-low':
            return parseInt(a.dataset.price) - parseInt(b.dataset.price);
          case 'price-high':
            return parseInt(b.dataset.price) - parseInt(a.dataset.price);
          case 'rating':
            return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
          default:
            return 0;
        }
      });
      
      cards.forEach(card => grid.appendChild(card));
      showNotification(`Sorted by ${sortBy.replace('-', ' ')}`, 'success');
    }

    // View toggle
    function toggleView(view, event) {
      const grid = document.getElementById('results-grid');
      const buttons = document.querySelectorAll('.view-btn');
      
      buttons.forEach(btn => btn.classList.remove('active'));
      event.target.closest('.view-btn').classList.add('active');
      
      if (view === 'list') {
        grid.classList.add('list-view');
      } else {
        grid.classList.remove('list-view');
      }
    }

    // Wishlist toggle
    function toggleWishlist(event, id) {
      event.stopPropagation();
      const btn = event.target.closest('.wishlist-btn');
      const icon = btn.querySelector('i');
      
      btn.classList.toggle('active');
      icon.classList.toggle('far');
      icon.classList.toggle('fas');
      
      const action = btn.classList.contains('active') ? 'Added to' : 'Removed from';
      showNotification(`${action} wishlist`, 'success');
    }

    // Quick actions
    function quickRent(event, id) {
      event.stopPropagation();
      showNotification('Opening quick rent...', 'info');
    }

    function viewDetails(event, id) {
      event.stopPropagation();
      showNotification('Loading details...', 'info');
    }

    // Update results count
    function updateResultsCount() {
      const visible = document.querySelectorAll('.item-card:not([style*="display: none"])').length;
      document.getElementById('results-count').textContent = visible;
    }

    // Update clear button on load
    window.addEventListener('DOMContentLoaded', () => {
      toggleClearButton();
      updateResultsCount();
    });

    // Initialize
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