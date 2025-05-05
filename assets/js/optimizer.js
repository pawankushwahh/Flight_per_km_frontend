/**
 * Flight Cost Intelligence System
 * Optimizer page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initOptimizerPage();
    
    // Fetch popular airports from API
    CONFIG.fetchPopularAirports();
});

/**
 * Initialize the optimizer page
 */
function initOptimizerPage() {
    // Add event listeners
    document.getElementById('optimize-btn').addEventListener('click', optimizeRoute);
    
    // Setup tabs
    setupTabs();
    
    // Wait a bit for the airport data to load then populate selects
    setTimeout(() => {
        populateAirportSelect('origin');
        populateAirportSelect('destination');
    }, 500);
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
 * Populate airport select dropdown
 * @param {string} selectId - ID of the select element to populate
 */
function populateAirportSelect(selectId) {
    const select = document.getElementById(selectId);
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add options for each airport
    CONFIG.POPULAR_AIRPORTS.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport.code;
        option.textContent = `${airport.city} (${airport.code}) - ${airport.name}`;
        select.appendChild(option);
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
    
    // Fetch layover data
    try {
        const layoverResponse = await callAPI(`${CONFIG.ENDPOINTS.CLASS_LAYOVER}?origin=${origin}&destination=${destination}`);
        
        if (layoverResponse.success) {
            displayLayoverComparison(layoverResponse.data);
        } else {
            showError('layover-comparison', layoverResponse.error || 'Failed to analyze layover options.');
        }
    } catch (error) {
        console.error('Error fetching layover data:', error);
        showError('layover-comparison', 'An error occurred while analyzing layover options.');
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
    
    // Filter only recommended alternatives (with negative cost difference)
    // and sort by most savings first (most negative avg_cost_difference)
    const recommendedAirports = airportData.nearby
        .filter(airport => airport.avg_cost_difference < 0)
        .sort((a, b) => a.avg_cost_difference - b.avg_cost_difference)
        .slice(0, 5); // Show max 5 alternatives
    
    // Check if there are any recommended alternatives
    if (recommendedAirports.length === 0) {
        element.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i> 
                No recommended alternative airports found for ${airportData.name} (${airportData.code}).
            </div>
        `;
        return;
    }
    
    // Calculate total potential savings
    const totalSavings = recommendedAirports.reduce((sum, airport) => {
        return sum + Math.abs(airport.avg_cost_difference);
    }, 0);
    
    // Generate HTML for airport alternatives with impressive savings highlight
    let html = `
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h4>${airportData.name} (${airportData.code})</h4>
                <p>${airportData.city}, ${airportData.country}</p>
            </div>
            <div class="card-body bg-light">
                <div class="alert alert-success">
                    <i class="fas fa-piggy-bank fa-2x float-start me-3"></i>
                    <h5>Potential Savings Found!</h5>
                    <p>We found ${recommendedAirports.length} nearby airports that could save you up to <strong>${(totalSavings * 100).toFixed(1)}%</strong> on your travel costs!</p>
                </div>
                <p>Consider these optimized alternatives:</p>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-primary">
                            <tr>
                                <th>Airport</th>
                                <th>Distance</th>
                                <th>Cost Savings</th>
                                <th>Recommendation</th>
                            </tr>
                        </thead>
                        <tbody>`;
    
    // Add rows for each recommended nearby airport
    recommendedAirports.forEach(airport => {
        // Determine recommendation based on cost difference
        let recommendation, recommendationClass;
        if (airport.avg_cost_difference < -0.1) {
            recommendation = 'Highly Recommended';
            recommendationClass = 'text-success';
        } else if (airport.avg_cost_difference < 0) {
            recommendation = 'Recommended';
            recommendationClass = 'text-success';
        } else {
            // This shouldn't happen as we've filtered for negative values only
            recommendation = 'Consider';
            recommendationClass = 'text-warning';
        }
        
        // Format cost difference as percentage (always showing as savings)
        const costDiffPercent = Math.abs(airport.avg_cost_difference * 100).toFixed(1);
        const costDiffClass = 'text-success';
        const savingsIcon = '<i class="fas fa-tag"></i>';
        
        // Add row to table
        html += `
            <tr>
                <td>
                    <strong>${airport.name} (${airport.code})</strong><br>
                    <small>${airport.city}, ${airport.country}</small>
                </td>
                <td>${airport.distance} km</td>
                <td class="${costDiffClass}">
                    ${savingsIcon} <strong>${costDiffPercent}% savings</strong>
                </td>
                <td class="${recommendationClass}">
                    <span class="badge bg-success">${recommendation}</span>
                </td>
            </tr>`;
    });
    
    // Close the HTML structure
    html += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    
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
            <div class="card-header bg-primary text-white">
                <h4><i class="fas fa-exchange-alt"></i> Direct vs. Layover Flights</h4>
                <p>Compare cost and time trade-offs for maximum savings</p>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-primary">
                            <tr>
                                <th>Route</th>
                                <th>Price</th>
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
        <tr class="table-light">
            <td>
                <strong><i class="fas fa-plane"></i> Direct Flight</strong><br>
                <small>${data.origin} to ${data.destination}</small>
            </td>
            <td><strong>${formatCurrency(data.direct_flight.price)}</strong></td>
            <td>${formatCurrency(data.direct_flight.cost_per_km)}/km</td>
            <td><i class="fas fa-clock"></i> ${data.direct_flight.duration_hours} hours</td>
            <td>-</td>
            <td>-</td>
        </tr>
    `;
    
    // Add rows for layover options
    data.layover_options.forEach(option => {
        // Calculate savings
        const savings = data.direct_flight.price - option.price;
        const savingsPercent = (savings / data.direct_flight.price * 100).toFixed(1);
        
        // Calculate time difference
        const timeDiff = option.duration_hours - data.direct_flight.duration_hours;
        
        // Determine if this is a good deal based on savings vs time trade-off
        const savingsPerHour = savings / timeDiff;
        let dealClass = 'table-success';
        let dealIcon = '<i class="fas fa-thumbs-up text-success"></i>';
        
        if (savingsPerHour < 20) {
            dealClass = ''; // neutral
            dealIcon = '<i class="fas fa-balance-scale text-warning"></i>';
        }
        
        // Add row to table
        html += `
            <tr class="${dealClass}">
                <td>
                    <strong><i class="fas fa-exchange-alt"></i> Via ${option.via}</strong><br>
                    <small>${data.origin} → ${option.via} → ${data.destination}</small>
                </td>
                <td><strong>${formatCurrency(option.price)}</strong></td>
                <td>${formatCurrency(option.cost_per_km)}/km</td>
                <td><i class="fas fa-clock"></i> ${option.duration_hours} hours</td>
                <td class="text-warning">+${timeDiff.toFixed(1)} hours</td>
                <td class="text-success">
                    <strong>${dealIcon} ${formatCurrency(savings)}</strong><br>
                    <span class="badge bg-success">${savingsPercent}% OFF</span>
                </td>
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
    const priceData = [data.direct_flight.price, ...data.layover_options.map(option => option.price)];
    const timeData = [data.direct_flight.duration_hours, ...data.layover_options.map(option => option.duration_hours)];
    const costPerKmData = [data.direct_flight.cost_per_km, ...data.layover_options.map(option => option.cost_per_km)];
    
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
