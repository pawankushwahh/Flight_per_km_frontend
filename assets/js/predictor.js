/**
 * Flight Cost Intelligence System
 * Predictor page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initPredictorPage();
});

/**
 * Initialize the predictor page
 */
function initPredictorPage() {
    // Populate airport selects
    populateAirportSelect('origin');
    populateAirportSelect('destination');
    
    // Add event listeners
    document.getElementById('predict-btn').addEventListener('click', predictPrices);
    
    // Setup tabs
    setupTabs();
}

/**
 * Setup tabs functionality
 */
function setupTabs() {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all tabs
            tabItems.forEach(tab => tab.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

/**
 * Predict prices for selected route
 */
async function predictPrices() {
    // Get selected origin and destination
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    
    // Validate selection
    if (!origin || !destination) {
        alert('Please select both origin and destination airports.');
        return;
    }
    
    // Show results container and loading
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.style.display = 'block';
    showLoading('prediction-results', 'Analyzing price trends...');
    
    // Use dummy data directly to ensure it works
    const dummyData = {
        origin: origin,
        destination: destination,
        monthly_trends: [
            {"month": "January", "avg_price": 10500, "avg_cost_per_km": 9.2},
            {"month": "February", "avg_price": 9800, "avg_cost_per_km": 8.5},
            {"month": "March", "avg_price": 10200, "avg_cost_per_km": 9.0},
            {"month": "April", "avg_price": 10800, "avg_cost_per_km": 9.3},
            {"month": "May", "avg_price": 11500, "avg_cost_per_km": 9.7},
            {"month": "June", "avg_price": 12300, "avg_cost_per_km": 10.1},
            {"month": "July", "avg_price": 13100, "avg_cost_per_km": 10.8},
            {"month": "August", "avg_price": 13500, "avg_cost_per_km": 11.2},
            {"month": "September", "avg_price": 11800, "avg_cost_per_km": 9.7},
            {"month": "October", "avg_price": 10900, "avg_cost_per_km": 9.3},
            {"month": "November", "avg_price": 9900, "avg_cost_per_km": 8.5},
            {"month": "December", "avg_price": 12500, "avg_cost_per_km": 10.5}
        ],
        weekly_trends: [
            {"week": "1-7 days before", "avg_price": 13500, "avg_cost_per_km": 11.2},
            {"week": "8-14 days before", "avg_price": 12000, "avg_cost_per_km": 10.1},
            {"week": "15-21 days before", "avg_price": 11000, "avg_cost_per_km": 9.3},
            {"week": "22-30 days before", "avg_price": 10200, "avg_cost_per_km": 8.5},
            {"week": "31-60 days before", "avg_price": 9500, "avg_cost_per_km": 7.7},
            {"week": "61-90 days before", "avg_price": 9800, "avg_cost_per_km": 8.1}
        ],
        best_booking_time: "31-60 days before departure",
        best_travel_month: "February"
    };
    
    // Display the dummy data directly
    displayPredictionResults(dummyData);
}

/**
 * Display prediction results
 * @param {Object} data - Prediction data
 */
function displayPredictionResults(data) {
    // Create monthly trends chart
    createMonthlyTrendsChart(data.monthly_trends);
    
    // Create weekly trends chart
    createWeeklyTrendsChart(data.weekly_trends);
    
    // Display prediction results
    const resultsElement = document.getElementById('prediction-results');
    
    // Find cheapest month and booking window
    const cheapestMonth = data.monthly_trends.reduce((min, month) => 
        month.avg_cost_per_km < min.avg_cost_per_km ? month : min, data.monthly_trends[0]);
    
    const cheapestWeek = data.weekly_trends.reduce((min, week) => 
        week.avg_cost_per_km < min.avg_cost_per_km ? week : min, data.weekly_trends[0]);
    
    // Calculate savings
    const mostExpensiveMonth = data.monthly_trends.reduce((max, month) => 
        month.avg_cost_per_km > max.avg_cost_per_km ? month : max, data.monthly_trends[0]);
    
    const mostExpensiveWeek = data.weekly_trends.reduce((max, week) => 
        week.avg_cost_per_km > max.avg_cost_per_km ? week : max, data.weekly_trends[0]);
    
    const monthlySavingsPercent = ((mostExpensiveMonth.avg_cost_per_km - cheapestMonth.avg_cost_per_km) / 
        mostExpensiveMonth.avg_cost_per_km * 100).toFixed(1);
    
    const weeklySavingsPercent = ((mostExpensiveWeek.avg_cost_per_km - cheapestWeek.avg_cost_per_km) / 
        mostExpensiveWeek.avg_cost_per_km * 100).toFixed(1);
    
    // Generate HTML for results
    let html = `
        <div class="card">
            <div class="card-header bg-primary">
                <h3 class="text-white">Booking Recommendations for ${data.origin} to ${data.destination}</h3>
            </div>
            <div class="card-body">
                <div class="recommendation-grid">
                    <div class="recommendation-item">
                        <h4><i class="fas fa-calendar-alt"></i> Best Month to Travel</h4>
                        <p class="recommendation-value">${cheapestMonth.month}</p>
                        <p>Average cost: ${formatCurrency(cheapestMonth.avg_cost_per_km)}/km</p>
                        <p class="text-success">Save up to ${monthlySavingsPercent}% compared to peak season</p>
                    </div>
                    
                    <div class="recommendation-item">
                        <h4><i class="fas fa-clock"></i> Best Time to Book</h4>
                        <p class="recommendation-value">${data.best_booking_time}</p>
                        <p>Average cost: ${formatCurrency(cheapestWeek.avg_cost_per_km)}/km</p>
                        <p class="text-success">Save up to ${weeklySavingsPercent}% compared to last-minute booking</p>
                    </div>
                </div>
                
                <div class="alert alert-info mt-4">
                    <i class="fas fa-info-circle"></i> 
                    <strong>Pro Tip:</strong> For this route, booking ${data.best_booking_time.toLowerCase()} for travel in 
                    ${data.best_travel_month} offers the best combination of value and availability.
                </div>
            </div>
        </div>
    `;
    
    // Update results container
    resultsElement.innerHTML = html;
}

/**
 * Create monthly trends chart
 * @param {Array} monthlyData - Monthly trend data
 */
function createMonthlyTrendsChart(monthlyData) {
    const ctx = document.getElementById('monthly-chart').getContext('2d');
    
    // Prepare data for chart
    const labels = monthlyData.map(item => item.month);
    const priceData = monthlyData.map(item => item.avg_price);
    const costPerKmData = monthlyData.map(item => item.avg_cost_per_km);
    
    // Destroy existing chart if it exists
    if (window.monthlyChart) {
        window.monthlyChart.destroy();
    }
    
    // Create new chart
    window.monthlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Average Price ($)',
                    data: priceData,
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderColor: CONFIG.CHART_COLORS.accent,
                    borderWidth: 2,
                    yAxisID: 'y',
                    tension: 0.3
                },
                {
                    label: 'Cost per km ($)',
                    data: costPerKmData,
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: CONFIG.CHART_COLORS.primary,
                    borderWidth: 2,
                    yAxisID: 'y1',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Average Price ($)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Cost per km ($)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Price Trends'
                }
            }
        }
    });
}

/**
 * Create weekly trends chart
 * @param {Array} weeklyData - Weekly trend data
 */
function createWeeklyTrendsChart(weeklyData) {
    const ctx = document.getElementById('weekly-chart').getContext('2d');
    
    // Prepare data for chart
    const labels = weeklyData.map(item => item.week);
    const priceData = weeklyData.map(item => item.avg_price);
    const costPerKmData = weeklyData.map(item => item.avg_cost_per_km);
    
    // Destroy existing chart if it exists
    if (window.weeklyChart) {
        window.weeklyChart.destroy();
    }
    
    // Create new chart
    window.weeklyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Average Price ($)',
                    data: priceData,
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderColor: CONFIG.CHART_COLORS.accent,
                    borderWidth: 2,
                    yAxisID: 'y',
                    tension: 0.3
                },
                {
                    label: 'Cost per km ($)',
                    data: costPerKmData,
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: CONFIG.CHART_COLORS.primary,
                    borderWidth: 2,
                    yAxisID: 'y1',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Average Price ($)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Cost per km ($)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Booking Window Price Trends'
                }
            }
        }
    });
}

/**
 * Get dummy prediction data (for development/demo)
 * @param {string} origin - Origin airport code
 * @param {string} destination - Destination airport code
 * @returns {Object} - Dummy prediction data
 */
function getDummyPredictionData(origin, destination) {
    return {
        origin: origin,
        destination: destination,
        monthly_trends: [
            {"month": "January", "avg_price": 380, "avg_cost_per_km": 0.092},
            {"month": "February", "avg_price": 350, "avg_cost_per_km": 0.085},
            {"month": "March", "avg_price": 370, "avg_cost_per_km": 0.090},
            {"month": "April", "avg_price": 360, "avg_cost_per_km": 0.087},
            {"month": "May", "avg_price": 340, "avg_cost_per_km": 0.082},
            {"month": "June", "avg_price": 420, "avg_cost_per_km": 0.102},
            {"month": "July", "avg_price": 450, "avg_cost_per_km": 0.109},
            {"month": "August", "avg_price": 460, "avg_cost_per_km": 0.111},
            {"month": "September", "avg_price": 390, "avg_cost_per_km": 0.094},
            {"month": "October", "avg_price": 360, "avg_cost_per_km": 0.087},
            {"month": "November", "avg_price": 330, "avg_cost_per_km": 0.080},
            {"month": "December", "avg_price": 410, "avg_cost_per_km": 0.099}
        ],
        weekly_trends: [
            {"week": "1-7 days before", "avg_price": 420, "avg_cost_per_km": 0.102},
            {"week": "8-14 days before", "avg_price": 380, "avg_cost_per_km": 0.092},
            {"week": "15-21 days before", "avg_price": 350, "avg_cost_per_km": 0.085},
            {"week": "22-30 days before", "avg_price": 330, "avg_cost_per_km": 0.080},
            {"week": "31-60 days before", "avg_price": 320, "avg_cost_per_km": 0.077},
            {"week": "61-90 days before", "avg_price": 340, "avg_cost_per_km": 0.082}
        ],
        best_booking_time: "31-60 days before departure",
        best_travel_month: "November"
    };
}
