/**
 * Flight Cost Intelligence System
 * How It Works section animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations for the How It Works section
    initHowItWorksAnimations();
});

/**
 * Initialize animations for the How It Works section
 */
function initHowItWorksAnimations() {
    // Get all elements with animate-on-scroll class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // Add visible class to elements with delay
    animatedElements.forEach(element => {
        const delay = element.getAttribute('data-delay') || 0;
        setTimeout(() => {
            element.classList.add('visible');
        }, delay * 1000);
    });
    
    // Add scroll animation for elements that come into view later
    window.addEventListener('scroll', function() {
        animatedElements.forEach(element => {
            if (isElementInViewport(element) && !element.classList.contains('visible')) {
                element.classList.add('visible');
            }
        });
    });
    
    // Add hover effects for step items
    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            // Pause the pulse animation on hover
            const icon = this.querySelector('.step-icon');
            icon.style.animationPlayState = 'paused';
            
            // Add a subtle bounce effect
            this.style.transform = 'translateX(8px)';
        });
        
        item.addEventListener('mouseleave', function() {
            // Resume the pulse animation
            const icon = this.querySelector('.step-icon');
            icon.style.animationPlayState = 'running';
            
            // Remove the bounce effect
            this.style.transform = 'translateX(0)';
        });
    });
}

/**
 * Check if an element is in the viewport
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} - Whether the element is in the viewport
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}
