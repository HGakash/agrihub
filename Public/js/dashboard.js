// Dashboard JavaScript functionality
// This file provides common dashboard utilities and interactions

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard.js loaded successfully');
    
    // Initialize dashboard components
    initializeNavigation();
    initializeInteractiveElements();
    initializeResponsiveFeatures();
});

// Navigation functionality
function initializeNavigation() {
    // Highlight active sidebar item
    const currentPath = window.location.pathname;
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href.split('/').pop())) {
            item.classList.add('active');
        }
    });
}

// Interactive elements
function initializeInteractiveElements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.crop-card, .glass');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Responsive features
function initializeResponsiveFeatures() {
    // Mobile menu toggle (if needed)
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('open');
        });
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
        }
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <span>${message}</span>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Export functions for global use
window.DashboardUtils = {
    showNotification,
    initializeNavigation,
    initializeInteractiveElements
};
