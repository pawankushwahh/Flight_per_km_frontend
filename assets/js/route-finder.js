/**
 * Flight Cost Intelligence System
 * Route Finder page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initRouteFinder();
    
    // Fetch popular airports from API
    CONFIG.fetchPopularAirports();
});

/**
 * Initialize the route finder page
 */
function initRouteFinder() {
    // Add event listeners
    document.getElementById('find-routes-btn').addEventListener('click', findBestRoutes);
    
    // Wait a bit for the airport data to load then populate selects
    setTimeout(() => {
        populateAirportSelect('origin');
    }, 500);
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
 * Find best routes from selected origin
 */
async function findBestRoutes() {
    // Get selected origin 
    const origin = document.getElementById('origin').value;
    
    // Validate selection
    if (!origin) {
        alert('Please select an origin airport.');
        return;
    }
    
    // Update the selected origin display
    const selectedOriginElement = document.getElementById('selected-origin');
    const originName = document.getElementById('origin').selectedOptions[0].text;
    selectedOriginElement.textContent = originName;
    
    // Find best routes from selected origin
    document.getElementById('results-container').style.display = 'block';
    
    // Show loading in routes table
    const routesTableBody = document.getElementById('routes-table-body');
    routesTableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner"></div>
                <p>Finding best routes from ${origin}...</p>
            </td>
        </tr>
    `;
    
    try {
        // Fetch best routes data - we'll use the compare data endpoint with a special query param
        const response = await callAPI(`${CONFIG.ENDPOINTS.DUMMY_COMPARE}`, {
            origin: origin,
            findBestRoutes: true
        });
        
        if (response.success) {
            displayBestRoutes(response.data, origin);
        } else {
            routesTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle"></i> 
                            ${response.error || 'Failed to find routes.'}
                        </div>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error fetching routes:', error);
        routesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle"></i> 
                        An error occurred while finding routes.
                    </div>
                </td>
            </tr>
        `;
    }
}

/**
 * Display best routes from origin
 * @param {Array} routes - Array of route data
 * @param {string} origin - Origin airport code
 */
function displayBestRoutes(routes, origin) {
    const routesTableBody = document.getElementById('routes-table-body');
    
    // Check if there are routes
    if (!routes || routes.length === 0) {
        routesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i> 
                        No routes found from ${origin}.
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort routes by cost per km (lowest first)
    routes.sort((a, b) => a.cost_per_km - b.cost_per_km);
    
    // Clear table body
    routesTableBody.innerHTML = '';
    
    // Add rows for each route
    routes.forEach(route => {
        // Get destination airport details
        const destinationAirport = CONFIG.POPULAR_AIRPORTS.find(airport => airport.code === route.destination) || { 
            name: route.destination, 
            city: route.destination, 
            code: route.destination 
        };
        
        // Create row for the route
        const row = document.createElement('tr');
        
        // Add best month info if available
        let bestMonth = 'N/A';
        let bestMonthClass = '';
        let bestMonthCostPerKm = 0;
        let costSavingsPercent = 0;
        
        // We're simulating that this data is available, in real scenario it would come from the API
        if (route.best_travel_month && route.monthly_trends) {
            bestMonth = route.best_travel_month;
            bestMonthClass = 'text-success fw-bold';
            
            // Find the best month's data in monthly trends
            const bestMonthData = route.monthly_trends.find(trend => trend.month === bestMonth);
            if (bestMonthData) {
                bestMonthCostPerKm = bestMonthData.avg_cost_per_km;
                
                // Calculate savings compared to average cost per km
                const avgCostPerKm = route.cost_per_km; // This is the average across the year
                costSavingsPercent = ((avgCostPerKm - bestMonthCostPerKm) / avgCostPerKm * 100).toFixed(1);
            }
        } else {
            // Simulate some best months based on the route distance
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const monthIndex = Math.floor(route.distance / 500) % 12;
            bestMonth = months[monthIndex];
            bestMonthClass = 'text-success fw-bold';
            
            // Simulate some cost savings (5-15% range)
            costSavingsPercent = (5 + Math.floor(Math.random() * 10)).toFixed(1);
            bestMonthCostPerKm = route.cost_per_km * (1 - (costSavingsPercent / 100));
        }
        
        // Add cells to the row
        row.innerHTML = `
            <td>
                <strong>${destinationAirport.city} (${destinationAirport.code})</strong><br>
                <small>${destinationAirport.name}</small>
            </td>
            <td>${formatNumber(route.distance)} km</td>
            <td>${formatCurrency(route.price)}</td>
            <td>
                <span class="badge bg-${getCostBadgeClass(route.cost_per_km)}">
                    ${formatCurrency(route.cost_per_km)}/km
                </span>
            </td>
            <td class="${bestMonthClass}">
                <i class="fas fa-calendar-alt"></i> <strong>${bestMonth}</strong><br>
                <small>Cost: ${formatCurrency(bestMonthCostPerKm)}/km</small><br>
                <span class="badge bg-success">↓ ${costSavingsPercent}% savings</span>
            </td>
        `;
        
        routesTableBody.appendChild(row);
    });
    
    // Trend functionality removed
}

// Trend-related functions removed

/**
 * Get badge class based on cost per km
 * @param {number} costPerKm - Cost per kilometer
 * @returns {string} - Badge class
 */
function getCostBadgeClass(costPerKm) {
    if (costPerKm < 5) return 'success';
    if (costPerKm < 10) return 'info';
    if (costPerKm < 15) return 'primary';
    if (costPerKm < 20) return 'warning';
    return 'danger';
}
