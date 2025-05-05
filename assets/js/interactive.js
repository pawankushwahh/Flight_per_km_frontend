/**
 * Flight Cost Intelligence System
 * Interactive UI enhancements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive elements
    initScrollEffects();
    initAnimations();
    initTooltips();
    initFormEnhancements();
    initHeaderScroll();
    initLazyLoading();
});

/**
 * Initialize scroll effects for elements
 */
function initScrollEffects() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // Set initial state (hidden)
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Function to check if element is in viewport
    function isInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85 &&
            rect.bottom >= 0
        );
    }
    
    // Function to handle scroll
    function handleScroll() {
        animatedElements.forEach(el => {
            if (isInViewport(el) && el.style.opacity === '0') {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Trigger once on load
    handleScroll();
}

/**
 * Initialize animations for elements with animation classes
 */
function initAnimations() {
    // Add animation classes to elements
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item, index) => {
        item.classList.add('animate-on-scroll');
        item.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Add animation to step items
    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach((item, index) => {
        item.classList.add('animate-on-scroll');
        item.style.transitionDelay = `${index * 0.15}s`;
    });
}

/**
 * Initialize tooltips
 */
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(el => {
        const tooltipText = el.getAttribute('data-tooltip');
        
        // Create tooltip element
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip-text';
        tooltip.textContent = tooltipText;
        
        // Add tooltip class to parent
        el.classList.add('tooltip');
        
        // Append tooltip to element
        el.appendChild(tooltip);
    });
}

/**
 * Initialize form enhancements
 */
function initFormEnhancements() {
    // Add floating labels to form inputs
    const formInputs = document.querySelectorAll('.form-select, .form-input');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // Check if input already has value
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });
    
    // Add animation to form submission buttons
    const formButtons = document.querySelectorAll('form button[type="submit"]');
    formButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!this.classList.contains('loading')) {
                this.classList.add('btn-pulse');
                setTimeout(() => {
                    this.classList.remove('btn-pulse');
                }, 500);
            }
        });
    });
}

/**
 * Initialize header scroll effects
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    // Function to check if element is in viewport
    function isInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 1.25 &&
            rect.bottom >= 0
        );
    }
    
    // Function to load image
    function loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;
        
        img.src = src;
        img.removeAttribute('data-src');
        img.classList.add('fade-in');
    }
    
    // Function to handle scroll
    function handleScroll() {
        lazyImages.forEach(img => {
            if (isInViewport(img) && img.hasAttribute('data-src')) {
                loadImage(img);
            }
        });
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Trigger once on load
    handleScroll();
}

/**
 * Add smooth scroll to anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        window.scrollTo({
            top: targetElement.offsetTop - 80, // Adjust for header height
            behavior: 'smooth'
        });
    });
});

/**
 * Add pulse animation to CTA buttons
 */
document.querySelectorAll('.btn-primary').forEach(btn => {
    if (btn.closest('.cta')) {
        btn.classList.add('animate-pulse');
    }
});

/**
 * Add interactive effects to feature cards
 */
document.querySelectorAll('.feature-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.feature-icon i');
        if (icon) {
            icon.classList.add('fa-beat');
            setTimeout(() => {
                icon.classList.remove('fa-beat');
            }, 1000);
        }
    });
});

/**
 * Add dynamic background effect to hero section
 */
function initHeroBackground() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'hero-particle';
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 10 + 5;
        
        // Random opacity
        const opacity = Math.random() * 0.5 + 0.1;
        
        // Random animation duration
        const duration = Math.random() * 20 + 10;
        
        // Set styles
        particle.style.cssText = `
            position: absolute;
            top: ${posY}%;
            left: ${posX}%;
            width: ${size}px;
            height: ${size}px;
            background-color: rgba(255, 255, 255, ${opacity});
            border-radius: 50%;
            pointer-events: none;
            animation: float ${duration}s infinite ease-in-out;
            animation-delay: ${Math.random() * 5}s;
        `;
        
        hero.appendChild(particle);
    }
}

// Initialize hero background effect
initHeroBackground();

// Add keyframe animation for floating particles
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% { transform: translateY(0) translateX(0); }
        25% { transform: translateY(-20px) translateX(10px); }
        50% { transform: translateY(0) translateX(20px); }
        75% { transform: translateY(20px) translateX(10px); }
        100% { transform: translateY(0) translateX(0); }
    }
    
    .hero-particle {
        z-index: 1;
    }
    
    .btn-pulse {
        animation: btnPulse 0.5s ease-out;
    }
    
    @keyframes btnPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease-out;
    }
`;
document.head.appendChild(style);
