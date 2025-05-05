/**
 * Flight Cost Intelligence System
 * FAQ page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the FAQ page
    initFaqPage();
});

/**
 * Initialize the FAQ page
 */
function initFaqPage() {
    // Add CSS link for FAQ-specific styles
    addFaqStyles();
    
    // Setup accordion functionality
    setupAccordion();
    
    // Setup search functionality
    setupSearch();
    
    // Setup tab functionality
    setupTabs();
    
    // Setup feedback system
    setupFeedback();
    
    // Setup related questions
    setupRelatedQuestions();
    
    // Setup interactive elements
    setupInteractiveElements();
}

/**
 * Add FAQ-specific CSS styles
 */
function addFaqStyles() {
    // Check if the styles are already added
    if (!document.querySelector('link[href="assets/css/faq.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'assets/css/faq.css';
        document.head.appendChild(link);
    }
}

/**
 * Setup accordion functionality
 */
function setupAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Toggle active class on the header
            this.classList.toggle('active');
            
            // Toggle icon
            const icon = this.querySelector('.accordion-icon i');
            if (icon.classList.contains('fa-plus')) {
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            } else {
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            }
            
            // Toggle content visibility
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                
                // Update related elements height
                setTimeout(() => {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }, 300);
            }
        });
    });
}

/**
 * Setup search functionality
 */
function setupSearch() {
    const searchInput = document.getElementById('faq-search');
    const searchClear = document.getElementById('search-clear');
    const resultsCount = document.getElementById('search-results-count');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const accordionItems = document.querySelectorAll('.accordion-item');
        let matchCount = 0;
        
        // Show/hide clear button
        searchClear.style.display = query ? 'block' : 'none';
        
        // Reset all items and tabs
        accordionItems.forEach(item => {
            item.classList.remove('hidden');
            item.classList.remove('highlight');
        });
        
        document.querySelectorAll('.tab-btn').forEach(tab => {
            if (tab.dataset.category === 'all') {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        if (query) {
            accordionItems.forEach(item => {
                const header = item.querySelector('.accordion-header h3').textContent.toLowerCase();
                const content = item.querySelector('.accordion-content').textContent.toLowerCase();
                
                if (header.includes(query) || content.includes(query)) {
                    item.classList.add('highlight');
                    matchCount++;
                    
                    // Expand the item if it matches
                    const header = item.querySelector('.accordion-header');
                    const icon = header.querySelector('.accordion-icon i');
                    const content = item.querySelector('.accordion-content');
                    
                    header.classList.add('active');
                    icon.classList.remove('fa-plus');
                    icon.classList.add('fa-minus');
                    content.style.maxHeight = content.scrollHeight + 'px';
                } else {
                    item.classList.add('hidden');
                }
            });
            
            // Update results count
            resultsCount.textContent = `Found ${matchCount} result${matchCount !== 1 ? 's' : ''} for "${query}"`;
        } else {
            resultsCount.textContent = '';
        }
    });
    
    // Clear search
    searchClear.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
    });
}

/**
 * Setup tab functionality
 */
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            const accordionItems = document.querySelectorAll('.accordion-item');
            
            // Reset search
            const searchInput = document.getElementById('faq-search');
            if (searchInput) {
                searchInput.value = '';
                document.getElementById('search-clear').style.display = 'none';
                document.getElementById('search-results-count').textContent = '';
            }
            
            // Update active tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide accordion items based on category
            accordionItems.forEach(item => {
                item.classList.remove('hidden');
                item.classList.remove('highlight');
                
                if (category !== 'all' && item.dataset.category !== category) {
                    item.classList.add('hidden');
                }
                
                // Close all items
                const header = item.querySelector('.accordion-header');
                const icon = header.querySelector('.accordion-icon i');
                const content = item.querySelector('.accordion-content');
                
                header.classList.remove('active');
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
                content.style.maxHeight = null;
            });
            
            // Scroll to section
            if (category !== 'all') {
                const sectionElement = document.getElementById(`${category}-section`);
                if (sectionElement) {
                    sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

/**
 * Setup feedback system
 */
function setupFeedback() {
    const feedbackButtons = document.querySelectorAll('.feedback-btn');
    
    feedbackButtons.forEach(button => {
        button.addEventListener('click', function() {
            const value = this.dataset.value;
            const container = this.closest('.feedback-container');
            const message = container.querySelector('.feedback-message');
            const buttons = container.querySelectorAll('.feedback-btn');
            
            // Reset buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Set active button
            this.classList.add('active');
            
            // Show thank you message
            message.textContent = value === 'yes' 
                ? 'Thank you for your feedback! We\'re glad this was helpful.' 
                : 'Thank you for your feedback. We\'ll work on improving this answer.';
            
            // In a real application, you would send this feedback to the server
            console.log(`Feedback: ${value} for question: ${this.closest('.accordion-item').querySelector('h3').textContent}`);
        });
    });
}

/**
 * Setup related questions functionality
 */
function setupRelatedQuestions() {
    const relatedLinks = document.querySelectorAll('.related-question-link');
    
    relatedLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetQuestion = this.dataset.target;
            const accordionItems = document.querySelectorAll('.accordion-item');
            
            // Find and open the target question
            accordionItems.forEach(item => {
                const header = item.querySelector('.accordion-header h3');
                
                if (header && header.textContent === targetQuestion) {
                    // Close all other items
                    accordionItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherHeader = otherItem.querySelector('.accordion-header');
                            const otherIcon = otherHeader.querySelector('.accordion-icon i');
                            const otherContent = otherItem.querySelector('.accordion-content');
                            
                            otherHeader.classList.remove('active');
                            otherIcon.classList.remove('fa-minus');
                            otherIcon.classList.add('fa-plus');
                            otherContent.style.maxHeight = null;
                        }
                    });
                    
                    // Open this item
                    const itemHeader = item.querySelector('.accordion-header');
                    const itemIcon = itemHeader.querySelector('.accordion-icon i');
                    const itemContent = item.querySelector('.accordion-content');
                    
                    itemHeader.classList.add('active');
                    itemIcon.classList.remove('fa-plus');
                    itemIcon.classList.add('fa-minus');
                    itemContent.style.maxHeight = itemContent.scrollHeight + 'px';
                    
                    // Highlight and scroll to the item
                    item.classList.add('highlight');
                    setTimeout(() => {
                        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                    
                    // Remove highlight after a delay
                    setTimeout(() => {
                        item.classList.remove('highlight');
                    }, 2000);
                }
            });
        });
    });
}

/**
 * Setup interactive elements
 */
function setupInteractiveElements() {
    // Setup time value slider
    const timeValueSlider = document.getElementById('time-value-slider');
    if (timeValueSlider) {
        timeValueSlider.addEventListener('input', function() {
            const value = this.value;
            const recommendationText = document.getElementById('recommendation-text');
            
            if (value < 30) {
                recommendationText.textContent = 'Based on your preference, we recommend flights with layovers to save money.';
            } else if (value < 70) {
                recommendationText.textContent = 'Based on your preference, we recommend considering flights with short layovers.';
            } else {
                recommendationText.textContent = 'Based on your preference, we recommend direct flights to save time.';
            }
        });
    }
    
    // Setup mini heatmap
    const miniHeatmap = document.getElementById('mini-heatmap');
    if (miniHeatmap) {
        // In a real application, you would initialize a small version of the heatmap here
        miniHeatmap.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
                <div style="width: 80%; height: 80%; background: linear-gradient(45deg, #1a9850, #91cf60, #d9ef8b, #fee08b, #fc8d59, #d73027); border-radius: 8px;">
                    <div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.5);">
                        Interactive Heatmap Preview
                    </div>
                </div>
            </div>
        `;
    }
    
    // Setup demo buttons
    const demoButtons = document.querySelectorAll('.demo-btn');
    demoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const demoType = this.closest('.interactive-demo').dataset.demo || 'predictor';
            alert(`This would launch an interactive demo of the ${demoType} feature in a real application.`);
        });
    });
}
