/**
 * Flight Cost Intelligence System
 * Compare page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initComparePage();
});

/**
 * Initialize the compare page
 */
function initComparePage() {
    // Populate airport selects
    populateAirportSelects();
    
    // Add event listeners
    document.getElementById('add-route-btn').addEventListener('click', addRouteForm);
    document.getElementById('compare-btn').addEventListener('click', compareRoutes);
}

/**
 * Populate all airport select dropdowns
 */
function populateAirportSelects() {
    // Get all select elements for origins and destinations
    const originSelects = document.querySelectorAll('select[id^="origin-"]');
    const destinationSelects = document.querySelectorAll('select[id^="destination-"]');
    
    // Populate each select
    originSelects.forEach(select => {
        populateAirportSelect(select.id);
    });
    
    destinationSelects.forEach(select => {
        populateAirportSelect(select.id);
    });
}

/**
 * Add a new route form
 */
function addRouteForm() {
    // Get the routes container
    const routesContainer = document.getElementById('routes-container');
    
    // Count existing routes to determine the new route number
    const routeCount = routesContainer.querySelectorAll('.route-item').length + 1;
    
    // Create new route HTML
    const routeHtml = `
        <div class="route-item mb-3">
            <h3>Route ${routeCount}</h3>
            <div class="route-inputs">
                <div class="form-group">
                    <label for="origin-${routeCount}" class="form-label">Origin</label>
                    <select id="origin-${routeCount}" class="form-select" required>
                        <option value="">Select Airport</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="destination-${routeCount}" class="form-label">Destination</label>
                    <select id="destination-${routeCount}" class="form-select" required>
                        <option value="">Select Airport</option>
                    </select>
                </div>
            </div>
            <button class="btn btn-danger btn-sm remove-route-btn mt-2">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `;
    
    // Add the new route to the container
    routesContainer.insertAdjacentHTML('beforeend', routeHtml);
    
    // Populate the new selects
    populateAirportSelect(`origin-${routeCount}`);
    populateAirportSelect(`destination-${routeCount}`);
    
    // Add event listener to remove button
    const removeButton = routesContainer.querySelector(`.route-item:nth-child(${routeCount}) .remove-route-btn`);
    removeButton.addEventListener('click', function() {
        this.closest('.route-item').remove();
    });
}

/**
 * Compare routes
 */
async function compareRoutes() {
    // Show loading
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.style.display = 'block';
    showLoading('comparison-results', 'Calculating route comparisons...');
    
    // Get all routes
    const routes = [];
    const routeItems = document.querySelectorAll('.route-item');
    
    routeItems.forEach((item, index) => {
        const routeNumber = index + 1;
        const origin = document.getElementById(`origin-${routeNumber}`).value;
        const destination = document.getElementById(`destination-${routeNumber}`).value;
        
        if (origin && destination) {
            routes.push({
                origin: origin,
                destination: destination
            });
        }
    });
    
    // Validate routes
    if (routes.length < 2) {
        showError('comparison-results', 'Please select at least two valid routes to compare.');
        return;
    }
    
    try {
        // Call API
        const response = await CONFIG.callAPI(CONFIG.ENDPOINTS.COMPARE, { routes: routes });
        
        if (response.success) {
            displayComparisonResults(response.data);
        } else {
            showError('comparison-results', response.error || 'Failed to compare routes.');
        }
    } catch (error) {
        console.error('Error comparing routes:', error);
        showError('comparison-results', 'An error occurred while comparing routes. Please try again.');
        
        // For development/demo, use dummy data if API fails
        const dummyData = getDummyComparisonData(routes);
        displayComparisonResults(dummyData);
    }
}

/**
 * Get dummy comparison data (for development/demo)
 * @param {Array} routes - Routes to generate dummy data for
 * @returns {Array} - Dummy comparison data
 */
function getDummyComparisonData(routes) {
    return routes.map(route => {
        // Generate random data
        const distance = Math.floor(Math.random() * 5000) + 500;
        const price = Math.floor(Math.random() * 1000) + 100;
        const costPerKm = price / distance;
        
        const airlines = [
            'Delta Airlines', 'United Airlines', 'American Airlines', 
            'British Airways', 'Air France', 'Lufthansa', 
            'Emirates', 'Singapore Airlines', 'Air India'
        ];
        
        return {
            origin: route.origin,
            destination: route.destination,
            distance: distance,
            price: price,
            cost_per_km: costPerKm,
            airline: airlines[Math.floor(Math.random() * airlines.length)]
        };
    });
}

/**
 * Display comparison results
 * @param {Array} results - Comparison results data
 */
function displayComparisonResults(results) {
    const resultsElement = document.getElementById('comparison-results');
    
    // Sort results by cost per km (ascending)
    results.sort((a, b) => a.cost_per_km - b.cost_per_km);
    
    // Generate HTML for results table
    let html = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Route</th>
                        <th>Distance (km)</th>
                        <th>Price</th>
                        <th>Cost per km</th>
                        <th>Airline</th>
                        <th>Value Rating</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add rows for each result
    results.forEach((result, index) => {
        // Calculate value rating (1-5 stars based on cost per km)
        // Lower cost per km = higher rating
        const lowestCost = results[0].cost_per_km;
        const highestCost = results[results.length - 1].cost_per_km;
        const costRange = highestCost - lowestCost;
        
        let valueRating = 5;
        if (costRange > 0) {
            // Calculate rating on a scale of 1-5 where lowest cost = 5 stars
            const normalizedCost = (result.cost_per_km - lowestCost) / costRange;
            valueRating = Math.round(5 - (normalizedCost * 4));
        }
        
        // Generate stars for value rating
        const stars = '<i class="fas fa-star text-warning"></i>'.repeat(valueRating) + 
                      '<i class="far fa-star text-warning"></i>'.repeat(5 - valueRating);
        
        // Add row to table
        html += `
            <tr>
                <td>${result.origin} to ${result.destination}</td>
                <td>${formatNumber(result.distance)} km</td>
                <td>${formatCurrency(result.price)}</td>
                <td>${formatCurrency(result.cost_per_km)}/km</td>
                <td>${result.airline}</td>
                <td>${stars}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        <div class="alert alert-info mt-3">
            <i class="fas fa-info-circle"></i> 
            <strong>Best Value:</strong> ${results[0].origin} to ${results[0].destination} 
            at ${formatCurrency(results[0].cost_per_km)}/km with ${results[0].airline}
        </div>
    `;
    
    // Update results container
    resultsElement.innerHTML = html;
    
    // Create chart
    createComparisonChart(results);
}

/**
 * Create comparison chart
 * @param {Array} results - Comparison results data
 */
function createComparisonChart(results) {
    // Extract data for chart
    const labels = results.map(r => `${r.origin} to ${r.destination}`);
    const priceData = results.map(r => r.price);
    const costPerKmData = results.map(r => r.cost_per_km);
    const distanceData = results.map(r => r.distance);
    
    // Create chart
    const ctx = document.getElementById('comparison-chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Price (₹)',
                    data: priceData,
                    backgroundColor: CONFIG.CHART_COLORS.primary,
                    borderColor: CONFIG.CHART_COLORS.primary,
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Cost per Km (₹)',
                    data: costPerKmData,
                    backgroundColor: CONFIG.CHART_COLORS.secondary,
                    borderColor: CONFIG.CHART_COLORS.secondary,
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
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Total Price (₹)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Cost per Km (₹)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            return `Distance: ${formatNumber(distanceData[index])} km`;
                        }
                    }
                }
            }
        }
    });
}
