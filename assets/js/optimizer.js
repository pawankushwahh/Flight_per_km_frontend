/**
 * Flight Cost Intelligence System
 * Optimizer page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initOptimizerPage();
});

/**
 * Initialize the optimizer page
 */
function initOptimizerPage() {
    // Populate airport selects
    populateAirportSelect('origin');
    populateAirportSelect('destination');
    
    // Add event listeners
    document.getElementById('optimize-btn').addEventListener('click', optimizeRoute);
    
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
 * Optimize route
 */
async function optimizeRoute() {
    // Get selected origin and destination
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    
    // Validate selection
    if (!origin || !destination) {
        alert('Please select both origin and destination airports.');
        return;
    }
    
    // Show results container
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.style.display = 'block';
    
    // Show loading in all tabs
    showLoading('origin-alternatives', 'Finding nearby airports...');
    showLoading('destination-alternatives', 'Finding nearby airports...');
    showLoading('layover-comparison', 'Analyzing layover options...');
    showLoading('class-comparison', 'Comparing travel classes...');
    
    // Fetch nearby airports data
    try {
        const nearbyResponse = await callAPI(`${CONFIG.ENDPOINTS.NEARBY_AIRPORTS}?origin=${origin}&destination=${destination}`);
        
        if (nearbyResponse.success) {
            displayNearbyAirports(nearbyResponse.data);
        } else {
            showError('origin-alternatives', nearbyResponse.error || 'Failed to find nearby airports.');
            showError('destination-alternatives', nearbyResponse.error || 'Failed to find nearby airports.');
        }
    } catch (error) {
        console.error('Error fetching nearby airports:', error);
        showError('origin-alternatives', 'An error occurred while finding nearby airports.');
        showError('destination-alternatives', 'An error occurred while finding nearby airports.');
    }
    
    // Fetch class and layover data
    try {
        const classLayoverResponse = await callAPI(`${CONFIG.ENDPOINTS.CLASS_LAYOVER}?origin=${origin}&destination=${destination}`);
        
        if (classLayoverResponse.success) {
            displayLayoverComparison(classLayoverResponse.data);
            displayClassComparison(classLayoverResponse.data);
        } else {
            showError('layover-comparison', classLayoverResponse.error || 'Failed to analyze layover options.');
            showError('class-comparison', classLayoverResponse.error || 'Failed to compare travel classes.');
        }
    } catch (error) {
        console.error('Error fetching class and layover data:', error);
        showError('layover-comparison', 'An error occurred while analyzing layover options.');
        showError('class-comparison', 'An error occurred while comparing travel classes.');
    }
}

/**
 * Display nearby airports
 * @param {Object} data - Nearby airports data
 */
function displayNearbyAirports(data) {
    // Display origin alternatives
    const originElement = document.getElementById('origin-alternatives');
    displayAirportAlternatives(originElement, data.origin, 'origin');
    
    // Display destination alternatives
    const destinationElement = document.getElementById('destination-alternatives');
    displayAirportAlternatives(destinationElement, data.destination, 'destination');
}

/**
 * Display airport alternatives
 * @param {HTMLElement} element - Element to display alternatives in
 * @param {Object} airportData - Airport data
 * @param {string} type - Type of airport (origin or destination)
 */
function displayAirportAlternatives(element, airportData, type) {
    // Check if there are nearby airports
    if (!airportData.nearby || airportData.nearby.length === 0) {
        element.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> 
                No nearby alternative airports found for ${airportData.name} (${airportData.code}).
            </div>
        `;
        return;
    }
    
    // Generate HTML for airport alternatives
    let html = `
        <div class="card mb-4">
            <div class="card-header">
                <h4>${airportData.name} (${airportData.code})</h4>
                <p>${airportData.city}, ${airportData.country}</p>
            </div>
            <div class="card-body">
                <p>Consider these nearby alternatives:</p>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Airport</th>
                                <th>Distance</th>
                                <th>Avg. Cost Difference</th>
                                <th>Recommendation</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    // Add rows for each nearby airport
    airportData.nearby.forEach(airport => {
        // Determine recommendation based on cost difference
        let recommendation, recommendationClass;
        if (airport.avg_cost_difference < -0.1) {
            recommendation = 'Highly Recommended';
            recommendationClass = 'text-success';
        } else if (airport.avg_cost_difference < 0) {
            recommendation = 'Recommended';
            recommendationClass = 'text-success';
        } else if (airport.avg_cost_difference < 0.05) {
            recommendation = 'Consider';
            recommendationClass = 'text-warning';
        } else {
            recommendation = 'Not Recommended';
            recommendationClass = 'text-danger';
        }
        
        // Format cost difference as percentage
        const costDiffPercent = (airport.avg_cost_difference * 100).toFixed(1);
        const costDiffClass = airport.avg_cost_difference < 0 ? 'text-success' : 'text-danger';
        const costDiffSign = airport.avg_cost_difference < 0 ? '-' : '+';
        
        // Add row to table
        html += `
            <tr>
                <td>
                    <strong>${airport.name} (${airport.code})</strong><br>
                    <small>${airport.city}, ${airport.country}</small>
                </td>
                <td>${airport.distance} km</td>
                <td class="${costDiffClass}">${costDiffSign}${Math.abs(costDiffPercent)}%</td>
                <td class="${recommendationClass}">${recommendation}</td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Update element
    element.innerHTML = html;
}

/**
 * Display layover comparison
 * @param {Object} data - Class and layover data
 */
function displayLayoverComparison(data) {
    const element = document.getElementById('layover-comparison');
    
    // Check if there are layover options
    if (!data.layover_options || data.layover_options.length === 0) {
        element.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> 
                No layover options available for this route.
            </div>
        `;
        
        // Hide layover chart
        document.querySelector('.tab-pane#layover .chart-container').style.display = 'none';
        return;
    }
    
    // Show layover chart
    document.querySelector('.tab-pane#layover .chart-container').style.display = 'block';
    
    // Generate HTML for layover comparison
    let html = `
        <div class="card mb-4">
            <div class="card-header">
                <h4>Direct vs. Layover Flights</h4>
                <p>Compare cost and time trade-offs</p>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Route</th>
                                <th>Economy Price</th>
                                <th>Cost per km</th>
                                <th>Duration</th>
                                <th>Time Difference</th>
                                <th>Savings</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    // Add row for direct flight
    html += `
        <tr>
            <td>
                <strong>Direct Flight</strong><br>
                <small>${data.origin} to ${data.destination}</small>
            </td>
            <td>${formatCurrency(data.direct_flight.economy.price)}</td>
            <td>${formatCurrency(data.direct_flight.economy.cost_per_km)}/km</td>
            <td>${data.direct_flight.economy.duration_hours} hours</td>
            <td>-</td>
            <td>-</td>
        </tr>
    `;
    
    // Add rows for layover options
    data.layover_options.forEach(option => {
        // Calculate savings
        const savings = data.direct_flight.economy.price - option.economy.price;
        const savingsPercent = (savings / data.direct_flight.economy.price * 100).toFixed(1);
        
        // Calculate time difference
        const timeDiff = option.economy.duration_hours - data.direct_flight.economy.duration_hours;
        
        // Add row to table
        html += `
            <tr>
                <td>
                    <strong>Via ${option.via}</strong><br>
                    <small>${data.origin} to ${option.via} to ${data.destination}</small>
                </td>
                <td>${formatCurrency(option.economy.price)}</td>
                <td>${formatCurrency(option.economy.cost_per_km)}/km</td>
                <td>${option.economy.duration_hours} hours</td>
                <td>+${timeDiff.toFixed(1)} hours</td>
                <td class="text-success">${formatCurrency(savings)} (${savingsPercent}%)</td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Update element
    element.innerHTML = html;
    
    // Create layover chart
    createLayoverChart(data);
}

/**
 * Create layover chart
 * @param {Object} data - Class and layover data
 */
function createLayoverChart(data) {
    const ctx = document.getElementById('layover-chart').getContext('2d');
    
    // Prepare data for chart
    const labels = ['Direct Flight', ...data.layover_options.map(option => `Via ${option.via}`)];
    const priceData = [data.direct_flight.economy.price, ...data.layover_options.map(option => option.economy.price)];
    const timeData = [data.direct_flight.economy.duration_hours, ...data.layover_options.map(option => option.economy.duration_hours)];
    const costPerKmData = [data.direct_flight.economy.cost_per_km, ...data.layover_options.map(option => option.economy.cost_per_km)];
    
    // Destroy existing chart if it exists
    if (window.layoverChart) {
        window.layoverChart.destroy();
    }
    
    // Create new chart
    window.layoverChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Price ($)',
                    data: priceData,
                    backgroundColor: CONFIG.CHART_COLORS.primary,
                    borderColor: CONFIG.CHART_COLORS.primary,
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Duration (hours)',
                    data: timeData,
                    backgroundColor: CONFIG.CHART_COLORS.accent,
                    borderColor: CONFIG.CHART_COLORS.accent,
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
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
                        text: 'Price ($)'
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
                        text: 'Duration (hours)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Layover Comparison: Price vs. Time'
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            return `Cost per km: ${formatCurrency(costPerKmData[index])}/km`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Display class comparison
 * @param {Object} data - Class and layover data
 */
function displayClassComparison(data) {
    const element = document.getElementById('class-comparison');
    
    // Generate HTML for class comparison
    let html = `
        <div class="card mb-4">
            <div class="card-header">
                <h4>Travel Class Comparison</h4>
                <p>Compare cost per kilometer across different travel classes</p>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Travel Class</th>
                                <th>Price</th>
                                <th>Cost per km</th>
                                <th>Price Increase</th>
                                <th>Space Increase</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    // Define travel classes
    const classes = [
        { key: 'economy', name: 'Economy', spaceIncrease: 1 },
        { key: 'premium_economy', name: 'Premium Economy', spaceIncrease: 1.2 },
        { key: 'business', name: 'Business', spaceIncrease: 2 },
        { key: 'first', name: 'First', spaceIncrease: 3 }
    ];
    
    // Add rows for each travel class
    classes.forEach((travelClass, index) => {
        // Skip if class doesn't exist in data
        if (!data.direct_flight[travelClass.key]) return;
        
        // Get class data
        const classData = data.direct_flight[travelClass.key];
        
        // Calculate price increase (compared to economy)
        const economyPrice = data.direct_flight.economy.price;
        const priceIncrease = ((classData.price / economyPrice) - 1) * 100;
        
        // Calculate value rating (1-5 stars)
        // Based on the ratio of space increase to price increase
        let valueRating = 5;
        if (index > 0) {
            const spaceToPrice = travelClass.spaceIncrease / (classData.price / economyPrice);
            valueRating = Math.round(spaceToPrice * 5);
            valueRating = Math.min(Math.max(valueRating, 1), 5);
        }
        
        // Generate stars for value rating
        const stars = '<i class="fas fa-star text-warning"></i>'.repeat(valueRating) + 
                      '<i class="far fa-star text-warning"></i>'.repeat(5 - valueRating);
        
        // Add row to table
        html += `
            <tr>
                <td><strong>${travelClass.name}</strong></td>
                <td>${formatCurrency(classData.price)}</td>
                <td>${formatCurrency(classData.cost_per_km)}/km</td>
                <td>${index === 0 ? '-' : `+${priceIncrease.toFixed(0)}%`}</td>
                <td>${index === 0 ? '-' : `+${((travelClass.spaceIncrease - 1) * 100).toFixed(0)}%`}</td>
            </tr>
        `;
    });
    
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Update element
    element.innerHTML = html;
    
    // Create class chart
    createClassChart(data);
}

/**
 * Create class chart
 * @param {Object} data - Class and layover data
 */
function createClassChart(data) {
    const ctx = document.getElementById('class-chart').getContext('2d');
    
    // Define travel classes
    const classes = [
        { key: 'economy', name: 'Economy' },
        { key: 'premium_economy', name: 'Premium Economy' },
        { key: 'business', name: 'Business' },
        { key: 'first', name: 'First' }
    ];
    
    // Filter classes that exist in data
    const availableClasses = classes.filter(c => data.direct_flight[c.key]);
    
    // Prepare data for chart
    const labels = availableClasses.map(c => c.name);
    const priceData = availableClasses.map(c => data.direct_flight[c.key].price);
    const costPerKmData = availableClasses.map(c => data.direct_flight[c.key].cost_per_km);
    
    // Destroy existing chart if it exists
    if (window.classChart) {
        window.classChart.destroy();
    }
    
    // Create new chart
    window.classChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Price ($)',
                    data: priceData,
                    backgroundColor: CONFIG.CHART_COLORS.colors.slice(0, availableClasses.length),
                    borderColor: CONFIG.CHART_COLORS.colors.slice(0, availableClasses.length),
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Cost per km ($)',
                    data: costPerKmData,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderColor: '#000',
                    borderWidth: 2,
                    type: 'line',
                    yAxisID: 'y1'
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
                        text: 'Price ($)'
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
                    text: 'Travel Class Comparison'
                }
            }
        }
    });
}
