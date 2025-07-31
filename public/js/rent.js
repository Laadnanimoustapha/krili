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

    // Category navigation
    function openCategory(category) {
      showNotification(`Opening ${category} category...`, 'info');
      // Here you would typically navigate to a category page
      setTimeout(() => {
        showNotification(`${category} category loaded!`, 'success');
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

    // Scroll to top functionality
    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Number animation for stats
    function animateNumbers() {
      const stats = document.querySelectorAll('.stat-number');
      
      stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          stat.textContent = Math.floor(current).toLocaleString();
        }, 20);
      });
    }

    // Intersection Observer for animations
    function setupScrollAnimations() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Trigger number animation for stats
            if (entry.target.classList.contains('stats')) {
              animateNumbers();
            }
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observe elements for scroll animations
      document.querySelectorAll('.category-card, .stats, .section-header').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });
    }

    // Scroll-based header effects
    function handleScroll() {
      const header = document.querySelector('header');
      const scrollTop = window.scrollY;
      const scrollTopBtn = document.querySelector('.scroll-top');
      
      // Header background opacity
      if (scrollTop > 50) {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
        if (document.body.getAttribute('data-theme') === 'light') {
          header.style.background = 'rgba(250, 250, 250, 0.95)';
        }
      } else {
        header.style.background = 'rgba(10, 10, 10, 0.8)';
        if (document.body.getAttribute('data-theme') === 'light') {
          header.style.background = 'rgba(250, 250, 250, 0.9)';
        }
      }
      
      // Show/hide scroll to top button
      if (scrollTop > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }

    // Keyboard shortcuts
    function setupKeyboardShortcuts() {
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
    }

    // Enhanced category interactions
    function setupCategoryInteractions() {
      const categoryCards = document.querySelectorAll('.category-card');
      
      categoryCards.forEach((card, index) => {
        // Stagger animation delay
        card.style.animationDelay = `${index * 0.1}s`;
        
        // Enhanced hover effects
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0) scale(1)';
        });
        
        // Click ripple effect
        card.addEventListener('click', (e) => {
          const rect = card.getBoundingClientRect();
          const ripple = document.createElement('div');
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          
          ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 0;
          `;
          
          card.style.position = 'relative';
          card.appendChild(ripple);
          
          setTimeout(() => {
            ripple.remove();
          }, 600);
        });
      });
      
      // Add ripple animation CSS
      const style = document.createElement('style');
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Performance optimization
    function setupPerformanceOptimizations() {
      // Throttle scroll events
      let scrollTimeout;
      window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
          scrollTimeout = setTimeout(() => {
            handleScroll();
            scrollTimeout = null;
          }, 10);
        }
      });
      
      // Preload critical images
      const criticalImages = [
        // Add any critical images here
      ];
      
      criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }

    // Initialize everything when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      // Hide preloader
      setTimeout(() => {
        document.querySelector('.preloader').classList.add('hidden');
      }, 1000);
      
      // Initialize all features
      setupScrollAnimations();
      setupKeyboardShortcuts();
      setupCategoryInteractions();
      setupPerformanceOptimizations();
      
      // Initial scroll handler setup
      handleScroll();
      
      // Welcome notification
      setTimeout(() => {
        showNotification('Welcome to KRILI! 🎉', 'success', 4000);
      }, 1500);
    });

    // Service Worker registration for PWA capabilities
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Prevent right-click context menu (as in original)
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Prevent F12 and common dev tool shortcuts (as in original)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') || 
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        return false;
      } 
    });