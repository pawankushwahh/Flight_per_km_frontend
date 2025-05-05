/**
 * Flight Cost Intelligence System
 * Visualizations page functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the visualizations page
    initVisualizationsPage();
});

/**
 * Initialize the visualizations page
 */
function initVisualizationsPage() {
    // Setup tab functionality
    setupTabs();
    
    // Load visualization data
    loadVisualizationData();
}

/**
 * Setup tab functionality
 */
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const tabId = this.dataset.tab;
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

/**
 * Load visualization data from the API
 */
async function loadVisualizationData() {
    try {
        // Show loading state
        showLoadingState();
        
        // Get the selected limit
        const limit = document.getElementById('routes-limit').value;
        
        // Fetch data from the API
        const response = await fetch(`/api/visualizations?limit=${limit}`);
        const data = await response.json();
        
        if (data.success) {
            // Store data globally
            window.visualizationData = data.data;
            
            // Create visualizations
            createVisualizations(data.data);
            
            // Setup filter controls
            setupFilterControls();
        } else {
            showError('Failed to load visualization data');
        }
    } catch (error) {
        console.error('Error loading visualization data:', error);
        showError('An error occurred while loading visualization data');
    }
}

/**
 * Show loading state for charts
 */
function showLoadingState() {
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.innerHTML = `
            <div class="loading-container">
                <div class="spinner"></div>
                <p>Loading visualization data...</p>
            </div>
        `;
    });
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-circle text-danger"></i>
                <p>${message}</p>
            </div>
        `;
    });
}

/**
 * Setup filter controls
 */
function setupFilterControls() {
    // Routes limit filter
    const routesLimitSelect = document.getElementById('routes-limit');
    routesLimitSelect.addEventListener('change', function() {
        loadVisualizationData();
    });
    
    // Routes sort filter
    const routesSortSelect = document.getElementById('routes-sort');
    routesSortSelect.addEventListener('change', function() {
        updateRoutesChart();
    });
}

/**
 * Create all visualizations
 * @param {Object} data - Visualization data from the API
 */
function createVisualizations(data) {
    // Create routes chart
    createRoutesChart(data);
    
    // Create distribution chart
    createDistributionChart(data);
    
    // Create cities chart
    createCitiesChart(data);
    
    // Create scatter chart
    createScatterChart(data);
    
    // Create efficiency chart
    createEfficiencyChart(data);
    
    // Create best cities cards
    createBestCitiesCards(data);
    
    // Update insights
    updateInsights(data);
}

/**
 * Create routes chart
 * @param {Object} data - Visualization data
 */
function createRoutesChart(data) {
    const ctx = document.getElementById('routesChart').getContext('2d');
    const sortType = document.getElementById('routes-sort').value;
    
    // Determine which data to use based on sort type
    const routesData = sortType === 'cheapest' ? data.topCheapestRoutes : data.topExpensiveRoutes;
    
    // Prepare chart data
    const labels = routesData.map(route => `${route.Start} to ${route.End}`);
    const costValues = routesData.map(route => parseFloat(route.CostPerKm));
    const distanceValues = routesData.map(route => parseFloat(route.Distance) / 100); // Scale down for better visualization
    
    // Create chart
    window.routesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Cost per Kilometer (₹)',
                    data: costValues,
                    backgroundColor: 'rgba(67, 97, 238, 0.7)',
                    borderColor: 'rgba(67, 97, 238, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Distance (x100 km)',
                    data: distanceValues,
                    type: 'line',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: sortType === 'cheapest' ? 'Cheapest Routes by Cost per Kilometer' : 'Most Expensive Routes by Cost per Kilometer'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const datasetLabel = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (datasetLabel.includes('Distance')) {
                                return `${datasetLabel}: ${(value * 100).toFixed(0)} km`;
                            }
                            return `${datasetLabel}: ₹${value.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Cost per Kilometer (₹)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Distance (x100 km)'
                    }
                }
            }
        }
    });
}

/**
 * Update routes chart when sort type changes
 */
function updateRoutesChart() {
    if (window.routesChart) {
        window.routesChart.destroy();
    }
    
    createRoutesChart(window.visualizationData);
}

/**
 * Create distribution chart
 * @param {Object} data - Visualization data
 */
function createDistributionChart(data) {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    
    // Combine all routes
    const allRoutes = [...data.topCheapestRoutes, ...data.topExpensiveRoutes];
    
    // Remove duplicates
    const uniqueRoutes = [];
    const routeKeys = new Set();
    
    allRoutes.forEach(route => {
        const key = `${route.Start}-${route.End}`;
        if (!routeKeys.has(key)) {
            routeKeys.add(key);
            uniqueRoutes.push(route);
        }
    });
    
    // Group costs into ranges
    const costRanges = [
        { min: 0, max: 5, label: '₹0-5', count: 0 },
        { min: 5, max: 10, label: '₹5-10', count: 0 },
        { min: 10, max: 15, label: '₹10-15', count: 0 },
        { min: 15, max: 20, label: '₹15-20', count: 0 },
        { min: 20, max: 50, label: '₹20-50', count: 0 },
        { min: 50, max: 100, label: '₹50-100', count: 0 },
        { min: 100, max: Infinity, label: '₹100+', count: 0 }
    ];
    
    uniqueRoutes.forEach(route => {
        const cost = parseFloat(route.CostPerKm);
        for (const range of costRanges) {
            if (cost >= range.min && cost < range.max) {
                range.count++;
                break;
            }
        }
    });
    
    // Create chart
    window.distributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: costRanges.map(range => range.label),
            datasets: [{
                label: 'Number of Routes',
                data: costRanges.map(range => range.count),
                backgroundColor: [
                    'rgba(26, 152, 80, 0.7)',
                    'rgba(145, 207, 96, 0.7)',
                    'rgba(217, 239, 139, 0.7)',
                    'rgba(254, 224, 139, 0.7)',
                    'rgba(252, 141, 89, 0.7)',
                    'rgba(215, 48, 39, 0.7)',
                    'rgba(165, 0, 38, 0.7)'
                ],
                borderColor: [
                    'rgba(26, 152, 80, 1)',
                    'rgba(145, 207, 96, 1)',
                    'rgba(217, 239, 139, 1)',
                    'rgba(254, 224, 139, 1)',
                    'rgba(252, 141, 89, 1)',
                    'rgba(215, 48, 39, 1)',
                    'rgba(165, 0, 38, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Distribution of Routes by Cost per Kilometer'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Routes'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Cost per Kilometer Range'
                    }
                }
            }
        }
    });
}

/**
 * Create cities chart
 * @param {Object} data - Visualization data
 */
function createCitiesChart(data) {
    const ctx = document.getElementById('citiesChart').getContext('2d');
    
    // Get top 10 cities by average cost
    const topCities = data.cityAverages.slice(0, 10);
    
    // Create chart
    window.citiesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topCities.map(city => city.city),
            datasets: [{
                label: 'Average Cost per Kilometer (₹)',
                data: topCities.map(city => city.avgCostPerKm),
                backgroundColor: 'rgba(72, 149, 239, 0.7)',
                borderColor: 'rgba(72, 149, 239, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Cities by Average Cost per Kilometer'
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Average Cost per Kilometer (₹)'
                    }
                }
            }
        }
    });
}

/**
 * Create scatter chart for cost vs distance analysis
 * @param {Object} data - Visualization data
 */
function createScatterChart(data) {
    const ctx = document.getElementById('scatterChart').getContext('2d');
    
    // Combine all routes
    const allRoutes = [...data.topCheapestRoutes, ...data.topExpensiveRoutes];
    
    // Remove duplicates
    const uniqueRoutes = [];
    const routeKeys = new Set();
    
    allRoutes.forEach(route => {
        const key = `${route.Start}-${route.End}`;
        if (!routeKeys.has(key)) {
            routeKeys.add(key);
            uniqueRoutes.push(route);
        }
    });
    
    // Create chart
    window.scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Routes',
                data: uniqueRoutes.map(route => ({
                    x: parseFloat(route.Distance),
                    y: parseFloat(route.CostPerKm),
                    route: `${route.Start} to ${route.End}`
                })),
                backgroundColor: 'rgba(247, 37, 133, 0.7)',
                borderColor: 'rgba(247, 37, 133, 1)',
                borderWidth: 1,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Cost per Kilometer vs Distance'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const route = context.raw.route;
                            const distance = context.raw.x.toFixed(0);
                            const cost = context.raw.y.toFixed(2);
                            return [
                                `Route: ${route}`,
                                `Distance: ${distance} km`,
                                `Cost per Km: ₹${cost}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Distance (km)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cost per Kilometer (₹)'
                    }
                }
            }
        }
    });
}

/**
 * Create efficiency chart
 * @param {Object} data - Visualization data
 */
function createEfficiencyChart(data) {
    const ctx = document.getElementById('efficiencyChart').getContext('2d');
    
    // Combine all routes
    const allRoutes = [...data.topCheapestRoutes, ...data.topExpensiveRoutes];
    
    // Remove duplicates
    const uniqueRoutes = [];
    const routeKeys = new Set();
    
    allRoutes.forEach(route => {
        const key = `${route.Start}-${route.End}`;
        if (!routeKeys.has(key)) {
            routeKeys.add(key);
            uniqueRoutes.push(route);
        }
    });
    
    // Calculate efficiency index (lower is better)
    const routesWithEfficiency = uniqueRoutes.map(route => {
        const distance = parseFloat(route.Distance);
        const costPerKm = parseFloat(route.CostPerKm);
        const price = parseFloat(route.Price);
        
        // Efficiency formula: (Cost per km * 100) / Distance
        // This gives lower values to routes that are cheaper per km for longer distances
        const efficiency = (costPerKm * 100) / distance;
        
        return {
            route: `${route.Start} to ${route.End}`,
            efficiency: efficiency,
            distance: distance,
            costPerKm: costPerKm,
            price: price
        };
    });
    
    // Sort by efficiency (lowest first)
    routesWithEfficiency.sort((a, b) => a.efficiency - b.efficiency);
    
    // Get top 10 most efficient routes
    const topEfficient = routesWithEfficiency.slice(0, 10);
    
    // Create chart
    window.efficiencyChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: topEfficient.map(item => item.route),
            datasets: [{
                label: 'Price Efficiency Index (lower is better)',
                data: topEfficient.map(item => item.efficiency),
                backgroundColor: 'rgba(17, 138, 178, 0.2)',
                borderColor: 'rgba(17, 138, 178, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(17, 138, 178, 1)',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Price Efficiency Index for Top Routes'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const route = topEfficient[index];
                            return [
                                `Efficiency: ${route.efficiency.toFixed(2)}`,
                                `Distance: ${route.distance.toFixed(0)} km`,
                                `Cost per Km: ₹${route.costPerKm.toFixed(2)}`,
                                `Total Price: ₹${route.price.toFixed(2)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0
                }
            }
        }
    });
}

/**
 * Create best cities cards
 * @param {Object} data - Visualization data
 */
function createBestCitiesCards(data) {
    const container = document.getElementById('best-cities-container');
    
    // Get top 5 cities by average cost
    const topCities = data.cityAverages.slice(0, 5);
    
    // Clear container
    container.innerHTML = '';
    
    // Create cards for each city
    topCities.forEach((city, index) => {
        const card = document.createElement('div');
        card.className = 'city-card';
        card.innerHTML = `
            <div class="city-icon">
                <i class="fas fa-city"></i>
            </div>
            <div class="city-details">
                <h3 class="city-name">${city.city}</h3>
                <p class="city-stats">${city.routeCount} routes analyzed</p>
            </div>
            <div class="city-cost">
                ₹${city.avgCostPerKm.toFixed(2)}/km
            </div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Update insights based on data
 * @param {Object} data - Visualization data
 */
function updateInsights(data) {
    // Routes insight
    const routesInsight = document.getElementById('routes-insight');
    const sortType = document.getElementById('routes-sort').value;
    
    if (sortType === 'cheapest') {
        const cheapestRoute = data.topCheapestRoutes[0];
        routesInsight.textContent = `The most economical route is from ${cheapestRoute.Start} to ${cheapestRoute.End} at just ₹${parseFloat(cheapestRoute.CostPerKm).toFixed(2)}/km, which is ${((data.averageCostPerKm - parseFloat(cheapestRoute.CostPerKm)) / data.averageCostPerKm * 100).toFixed(0)}% below the average cost per kilometer.`;
    } else {
        const expensiveRoute = data.topExpensiveRoutes[0];
        routesInsight.textContent = `The most expensive route is from ${expensiveRoute.Start} to ${expensiveRoute.End} at ₹${parseFloat(expensiveRoute.CostPerKm).toFixed(2)}/km, which is ${((parseFloat(expensiveRoute.CostPerKm) - data.averageCostPerKm) / data.averageCostPerKm * 100).toFixed(0)}% above the average cost per kilometer.`;
    }
    
    // Distribution insight
    const distributionInsight = document.getElementById('distribution-insight');
    distributionInsight.textContent = `The average cost per kilometer across all routes is ₹${data.averageCostPerKm.toFixed(2)}. Most routes fall within the ₹5-15/km range, indicating a standard pricing band for domestic flights.`;
    
    // Cities insight
    const citiesInsight = document.getElementById('cities-insight');
    const bestCity = data.cityAverages[0];
    const worstCity = data.cityAverages[data.cityAverages.length - 1];
    citiesInsight.textContent = `${bestCity.city} offers the best value with an average cost of ₹${bestCity.avgCostPerKm.toFixed(2)}/km across ${bestCity.routeCount} routes. In contrast, ${worstCity.city} is the most expensive with an average of ₹${worstCity.avgCostPerKm.toFixed(2)}/km.`;
    
    // Scatter insight
    const scatterInsight = document.getElementById('scatter-insight');
    scatterInsight.textContent = `There is a general trend where longer routes (>1000km) tend to have lower costs per kilometer, while shorter routes often have higher per-kilometer costs due to fixed operational expenses being distributed over fewer kilometers.`;
    
    // Efficiency insight
    const efficiencyInsight = document.getElementById('efficiency-insight');
    efficiencyInsight.textContent = `The Price Efficiency Index combines distance and cost per kilometer to identify routes that offer the best overall value. Routes with lower index values provide better value, especially for longer journeys.`;
}
