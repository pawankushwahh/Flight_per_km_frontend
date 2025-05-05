/**
 * Flight Cost Intelligence System
 * Heatmap page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initHeatmapPage();
});

/**
 * Initialize the heatmap page
 */
function initHeatmapPage() {
    // Initialize map
    initMap();
    
    // Add event listeners
    document.getElementById('view-type').addEventListener('change', function() {
        updateMapView(this.value);
    });
    
    // Load heatmap data
    loadHeatmapData();
}

/**
 * Initialize the map
 */
function initMap() {
    // Create map centered on India
    window.map = L.map('map-container').setView([22.5937, 78.9629], 5);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 10,
        minZoom: 4
    }).addTo(window.map);
    
    // Add legend
    createLegend();
}

/**
 * Create legend
 */
function createLegend() {
    const legendElement = document.querySelector('.legend-items');
    
    // Define legend items with rupee symbol
    const legendItems = [
        { color: '#1a9850', label: 'Very Low Cost (< ₹5/km)' },
        { color: '#91cf60', label: 'Low Cost (₹5-8/km)' },
        { color: '#d9ef8b', label: 'Moderate Cost (₹8-12/km)' },
        { color: '#fee08b', label: 'Average Cost (₹12-16/km)' },
        { color: '#fc8d59', label: 'High Cost (₹16-20/km)' },
        { color: '#d73027', label: 'Very High Cost (> ₹20/km)' }
    ];
    
    // Generate HTML for legend
    let html = '';
    legendItems.forEach(item => {
        html += `
            <div class="legend-item">
                <span class="legend-color" style="background-color: ${item.color}"></span>
                <span class="legend-label">${item.label}</span>
            </div>
        `;
    });
    
    // Update legend element
    if (legendElement) {
        legendElement.innerHTML = html;
    }
}

/**
 * Load heatmap data
 */
function loadHeatmapData() {
    // Create static Indian flight cost data
    const staticData = {
        "regions": [
            {
                "name": "North India",
                "avg_cost_per_km": 9.5,
                "center": [28.7041, 77.1025],
                "states": [
                    {
                        "name": "Delhi",
                        "code": "DL",
                        "center": [28.7041, 77.1025],
                        "avg_cost_per_km": 9.0,
                        "routes": [
                            {"from": "DEL", "to": "BOM", "cost_per_km": 9.3, "from_coords": [28.5562, 77.1000], "to_coords": [19.0896, 72.8656]}
                        ]
                    },
                    {
                        "name": "Uttar Pradesh",
                        "code": "UP",
                        "center": [26.8467, 80.9462],
                        "avg_cost_per_km": 10.0,
                        "routes": [
                            {"from": "LKO", "to": "DEL", "cost_per_km": 8.8, "from_coords": [26.8467, 80.9462], "to_coords": [28.5562, 77.1000]}
                        ]
                    }
                ]
            },
            {
                "name": "West India",
                "avg_cost_per_km": 8.5,
                "center": [19.0760, 72.8777],
                "states": [
                    {
                        "name": "Maharashtra",
                        "code": "MH",
                        "center": [19.0760, 72.8777],
                        "avg_cost_per_km": 8.0,
                        "routes": [
                            {"from": "BOM", "to": "DEL", "cost_per_km": 9.3, "from_coords": [19.0896, 72.8656], "to_coords": [28.5562, 77.1000]}
                        ]
                    }
                ]
            },
            {
                "name": "South India",
                "avg_cost_per_km": 7.5,
                "center": [13.0827, 80.2707],
                "states": [
                    {
                        "name": "Tamil Nadu",
                        "code": "TN",
                        "center": [13.0827, 80.2707],
                        "avg_cost_per_km": 7.0,
                        "routes": [
                            {"from": "MAA", "to": "BOM", "cost_per_km": 7.5, "from_coords": [13.0827, 80.2707], "to_coords": [19.0896, 72.8656]}
                        ]
                    },
                    {
                        "name": "Karnataka",
                        "code": "KA",
                        "center": [12.9716, 77.5946],
                        "avg_cost_per_km": 8.0,
                        "routes": [
                            {"from": "BLR", "to": "DEL", "cost_per_km": 8.5, "from_coords": [12.9716, 77.5946], "to_coords": [28.5562, 77.1000]}
                        ]
                    }
                ]
            },
            {
                "name": "East India",
                "avg_cost_per_km": 10.5,
                "center": [22.5726, 88.3639],
                "states": [
                    {
                        "name": "West Bengal",
                        "code": "WB",
                        "center": [22.5726, 88.3639],
                        "avg_cost_per_km": 10.0,
                        "routes": [
                            {"from": "CCU", "to": "DEL", "cost_per_km": 11.0, "from_coords": [22.5726, 88.3639], "to_coords": [28.5562, 77.1000]}
                        ]
                    }
                ]
            }
        ]
    };
    
    // Store data globally
    window.heatmapData = staticData;
    
    // Update map with data
    updateMapView(document.getElementById('view-type').value);
    
    // Display stats and insights
    displayHeatmapStats(staticData);
    displayInsights(staticData);
}

/**
 * Update map view based on selected view type
 * @param {string} viewType - View type (region, country, route)
 */
function updateMapView(viewType) {
    // Clear existing layers
    if (window.currentLayers) {
        window.currentLayers.forEach(layer => {
            window.map.removeLayer(layer);
        });
    }
    
    window.currentLayers = [];
    
    // Get heatmap data
    const data = window.heatmapData;
    if (!data) return;
    
    // Update map based on view type
    switch (viewType) {
        case 'region':
            displayRegionView(data);
            break;
        case 'country':
            displayStateView(data);
            break;
        case 'route':
            displayRouteView(data);
            break;
    }
}

/**
 * Display region view
 * @param {Object} data - Heatmap data
 */
function displayRegionView(data) {
    // Add circles for each region
    data.regions.forEach(region => {
        // Get region center from data
        const center = region.center || [22.5937, 78.9629];
        
        // Determine circle color based on cost per km
        const color = getCostColor(region.avg_cost_per_km);
        
        // Create circle
        const circle = L.circle(center, {
            color: color,
            fillColor: color,
            fillOpacity: 0.6,
            radius: 200000, // 200 km radius for Indian regions
            weight: 1
        }).addTo(window.map);
        
        // Add popup
        circle.bindPopup(`
            <h3>${region.name}</h3>
            <p><strong>Average Cost:</strong> ₹${region.avg_cost_per_km.toFixed(2)}/km</p>
            <p><strong>States:</strong> ${region.states.length}</p>
        `);
        
        // Add label
        const label = L.divIcon({
            className: 'map-label',
            html: `<div>${region.name}<br>₹${region.avg_cost_per_km.toFixed(2)}/km</div>`,
            iconSize: [120, 40]
        });
        
        const marker = L.marker(center, {
            icon: label,
            interactive: false
        }).addTo(window.map);
        
        // Add to current layers
        window.currentLayers.push(circle);
        window.currentLayers.push(marker);
    });
    
    // Fit map to India
    window.map.fitBounds([
        [8.0883, 68.7786],  // Southwest corner of India
        [37.0902, 97.3957]  // Northeast corner of India
    ]);
}

/**
 * Display state view (renamed from country view)
 * @param {Object} data - Heatmap data
 */
function displayStateView(data) {
    // Flatten states from all regions
    const states = [];
    data.regions.forEach(region => {
        region.states.forEach(state => {
            states.push({
                ...state,
                region: region.name
            });
        });
    });
    
    // Add circles for each state
    states.forEach(state => {
        // Get state center from data
        const center = state.center || [22.5937, 78.9629];
        
        // Determine circle color based on cost per km
        const color = getCostColor(state.avg_cost_per_km);
        
        // Create circle
        const circle = L.circle(center, {
            color: color,
            fillColor: color,
            fillOpacity: 0.6,
            radius: 100000, // 100 km
            weight: 1
        }).addTo(window.map);
        
        // Add popup
        circle.bindPopup(`
            <h3>${state.name}</h3>
            <p><strong>Region:</strong> ${state.region}</p>
            <p><strong>Average Cost:</strong> ₹${state.avg_cost_per_km.toFixed(2)}/km</p>
            <p><strong>Routes:</strong> ${state.routes ? state.routes.length : 0}</p>
        `);
        
        // Add label
        const label = L.divIcon({
            className: 'map-label',
            html: `<div>${state.code}<br>₹${state.avg_cost_per_km.toFixed(2)}/km</div>`,
            iconSize: [60, 40]
        });
        
        const marker = L.marker(center, {
            icon: label,
            interactive: false
        }).addTo(window.map);
        
        // Add to current layers
        window.currentLayers.push(circle);
        window.currentLayers.push(marker);
    });
    
    // Fit map to India
    window.map.fitBounds([
        [8.0883, 68.7786],  // Southwest corner of India
        [37.0902, 97.3957]  // Northeast corner of India
    ]);
}

/**
 * Display route view
 * @param {Object} data - Heatmap data
 */
function displayRouteView(data) {
    // Define Indian airport coordinates
    const airportCoords = {
        'DEL': [28.5562, 77.1000], // Delhi
        'BOM': [19.0896, 72.8656], // Mumbai
        'BLR': [13.1986, 77.7046], // Bangalore
        'MAA': [12.9941, 80.1709], // Chennai
        'CCU': [22.6520, 88.4463], // Kolkata
        'HYD': [17.2403, 78.4294], // Hyderabad
        'AMD': [23.0225, 72.5714], // Ahmedabad
        'PNQ': [18.5793, 73.9089], // Pune
        'GOI': [15.3808, 73.8314], // Goa
        'LKO': [26.8467, 80.9462], // Lucknow
        'JAI': [26.8242, 75.8122], // Jaipur
        'IXC': [30.6735, 76.7885], // Chandigarh
        'ATQ': [31.7090, 74.7973], // Amritsar
        'VNS': [25.4520, 82.8593], // Varanasi
        'IXB': [26.6812, 88.3280], // Bagdogra
        'IXA': [23.8867, 91.2404], // Agartala
        'IXE': [12.9613, 74.8900], // Mangalore
        'COK': [10.1520, 76.3954], // Kochi
        'TRV': [8.4827, 76.9198]   // Trivandrum
    };
    
    // Get all routes from all states in all regions
    const routes = [];
    data.regions.forEach(region => {
        region.states.forEach(state => {
            if (state.routes) {
                state.routes.forEach(route => {
                    // Add coordinates from our mapping
                    const fromCoords = route.from_coords || airportCoords[route.from] || null;
                    const toCoords = route.to_coords || airportCoords[route.to] || null;
                    
                    // Only add routes where we have coordinates for both airports
                    if (fromCoords && toCoords) {
                        routes.push({
                            ...route,
                            state: state.name,
                            region: region.name,
                            fromCoords: fromCoords,
                            toCoords: toCoords
                        });
                    }
                });
            }
        });
    });
    
    // Sort routes by cost per km (lowest first)
    routes.sort((a, b) => a.cost_per_km - b.cost_per_km);
    
    // Display all routes (or top 20 if there are many)
    const displayRoutes = routes.length > 20 ? routes.slice(0, 20) : routes;
    
    // Add routes to map
    displayRoutes.forEach((route, index) => {
        // Determine line color based on cost per km
        const color = getCostColor(route.cost_per_km);
        
        // Create line
        const line = L.polyline([route.fromCoords, route.toCoords], {
            color: color,
            weight: index < 5 ? 4 : 2,
            opacity: 0.8,
            dashArray: index < 5 ? null : '5, 5'
        }).addTo(window.map);
        
        // Add popup
        line.bindPopup(`
            <h3>${route.from} to ${route.to}</h3>
            <p><strong>Region:</strong> ${route.region}</p>
            <p><strong>State:</strong> ${route.state}</p>
            <p><strong>Cost per km:</strong> ₹${route.cost_per_km.toFixed(2)}/km</p>
            ${index < 5 ? '<p><strong>Rank:</strong> Top ' + (index + 1) + ' best value route!</p>' : ''}
        `);
        
        // Add to current layers
        window.currentLayers.push(line);
        
        // Add airport markers if not already added
        if (!window.currentLayers.find(layer => layer.options && layer.options.title === route.from)) {
            const fromMarker = L.circleMarker(route.fromCoords, {
                radius: 6,
                color: '#333',
                fillColor: '#fff',
                fillOpacity: 1,
                weight: 2,
                title: route.from
            }).addTo(window.map);
            
            fromMarker.bindTooltip(route.from, {
                permanent: true,
                direction: 'top',
                offset: [0, -8]
            });
            
            window.currentLayers.push(fromMarker);
        }
        
        if (!window.currentLayers.find(layer => layer.options && layer.options.title === route.to)) {
            const toMarker = L.circleMarker(route.toCoords, {
                radius: 6,
                color: '#333',
                fillColor: '#fff',
                fillOpacity: 1,
                weight: 2,
                title: route.to
            }).addTo(window.map);
            
            toMarker.bindTooltip(route.to, {
                permanent: true,
                direction: 'top',
                offset: [0, -8]
            });
            
            window.currentLayers.push(toMarker);
        }
    });
    
    // Fit map to India
    window.map.fitBounds([
        [8.0883, 68.7786],  // Southwest corner of India
        [37.0902, 97.3957]  // Northeast corner of India
    ]);
}

/**
 * Get color based on cost per km
 * @param {number} costPerKm - Cost per kilometer
 * @returns {string} - Color code
 */
function getCostColor(costPerKm) {
    if (costPerKm < 5) return '#1a9850'; // Very low
    if (costPerKm < 8) return '#91cf60'; // Low
    if (costPerKm < 12) return '#d9ef8b'; // Moderate
    if (costPerKm < 16) return '#fee08b'; // Average
    if (costPerKm < 20) return '#fc8d59'; // High
    return '#d73027'; // Very high
}

/**
 * Display heatmap stats
 * @param {Object} data - Heatmap data
 */
function displayHeatmapStats(data) {
    const statsElement = document.getElementById('heatmap-stats');
    if (!statsElement) return;
    
    // Calculate stats
    const regions = data.regions;
    const cheapestRegion = [...regions].sort((a, b) => a.avg_cost_per_km - b.avg_cost_per_km)[0];
    const expensiveRegion = [...regions].sort((a, b) => b.avg_cost_per_km - a.avg_cost_per_km)[0];
    
    // Calculate average cost across all regions
    const totalCost = regions.reduce((sum, region) => sum + region.avg_cost_per_km, 0);
    const avgCost = totalCost / regions.length;
    
    // Generate HTML
    const html = `
        <div class="stats-grid">
            <div class="stat-item">
                <h4>Cheapest Region</h4>
                <p class="stat-value">${cheapestRegion.name}</p>
                <p class="stat-detail">₹${cheapestRegion.avg_cost_per_km.toFixed(2)}/km</p>
            </div>
            
            <div class="stat-item">
                <h4>Most Expensive Region</h4>
                <p class="stat-value">${expensiveRegion.name}</p>
                <p class="stat-detail">₹${expensiveRegion.avg_cost_per_km.toFixed(2)}/km</p>
            </div>
            
            <div class="stat-item">
                <h4>Average Cost</h4>
                <p class="stat-value">₹${avgCost.toFixed(2)}/km</p>
                <p class="stat-detail">Across all regions</p>
            </div>
        </div>
    `;
    
    // Update stats element
    statsElement.innerHTML = html;
}

/**
 * Display insights
 * @param {Object} data - Heatmap data
 */
function displayInsights(data) {
    // Get all states
    const states = [];
    data.regions.forEach(region => {
        region.states.forEach(state => {
            states.push({
                ...state,
                region: region.name
            });
        });
    });
    
    // Get all routes
    const routes = [];
    states.forEach(state => {
        if (state.routes) {
            state.routes.forEach(route => {
                routes.push({
                    ...route,
                    state: state.name,
                    region: state.region
                });
            });
        }
    });
    
    // Sort states by cost per km
    const cheapestStates = [...states].sort((a, b) => a.avg_cost_per_km - b.avg_cost_per_km).slice(0, 5);
    const expensiveStates = [...states].sort((a, b) => b.avg_cost_per_km - a.avg_cost_per_km).slice(0, 5);
    
    // Sort routes by cost per km
    const bestValueRoutes = [...routes].sort((a, b) => a.cost_per_km - b.cost_per_km).slice(0, 5);
    
    // Generate HTML for cheapest regions
    let cheapestRegionsHtml = '<ul class="insight-list">';
    cheapestStates.forEach(state => {
        cheapestRegionsHtml += `
            <li>
                <span class="insight-name">${state.name}</span>
                <span class="insight-value">₹${state.avg_cost_per_km.toFixed(2)}/km</span>
            </li>
        `;
    });
    cheapestRegionsHtml += '</ul>';
    
    // Generate HTML for expensive regions
    let expensiveRegionsHtml = '<ul class="insight-list">';
    expensiveStates.forEach(state => {
        expensiveRegionsHtml += `
            <li>
                <span class="insight-name">${state.name}</span>
                <span class="insight-value">₹${state.avg_cost_per_km.toFixed(2)}/km</span>
            </li>
        `;
    });
    expensiveRegionsHtml += '</ul>';
    
    // Generate HTML for best value routes
    let bestValueRoutesHtml = '<ul class="insight-list">';
    bestValueRoutes.forEach(route => {
        bestValueRoutesHtml += `
            <li>
                <span class="insight-name">${route.from} to ${route.to}</span>
                <span class="insight-value">₹${route.cost_per_km.toFixed(2)}/km</span>
            </li>
        `;
    });
    bestValueRoutesHtml += '</ul>';
    
    // Update DOM
    const cheapestRegionsElement = document.getElementById('cheapest-regions');
    const expensiveRegionsElement = document.getElementById('expensive-regions');
    const bestValueRoutesElement = document.getElementById('best-value-routes');
    
    if (cheapestRegionsElement) cheapestRegionsElement.innerHTML = cheapestRegionsHtml;
    if (expensiveRegionsElement) expensiveRegionsElement.innerHTML = expensiveRegionsHtml;
    if (bestValueRoutesElement) bestValueRoutesElement.innerHTML = bestValueRoutesHtml;
}
