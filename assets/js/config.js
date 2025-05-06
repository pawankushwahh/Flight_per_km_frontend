/**
 * Flight Cost Intelligence System
 * Configuration file for frontend
 */

const CONFIG = {
    // API base URL - using Render deployed backend
    // API_BASE_URL: 'http://127.0.0.1:5000',
    API_BASE_URL: 'https://flight-cost-intelligence-api.onrender.com',

    
    // API endpoints with their HTTP methods
    ENDPOINTS: {
        COMPARE: '/api/compare',
        TREND_ROUTES: '/api/trend-routes',
        TREND_DATA: '/api/trend-data',
        COMPARE_TRENDS: '/api/compare-trends',
        NEARBY_AIRPORTS: '/api/nearby-airports',
        CLASS_LAYOVER: '/api/class-layover',
        HEATMAP: '/api/heatmap',
        AIRPORTS: '/api/airports',
        ROUTE_FIND: '/api/route-find'
    },
    
    // HTTP methods for each endpoint
    HTTP_METHODS: {
        COMPARE: 'POST',
        TREND_ROUTES: 'GET',
        TREND_DATA: 'GET',
        COMPARE_TRENDS: 'POST',
        NEARBY_AIRPORTS: 'GET',
        CLASS_LAYOVER: 'GET',
        HEATMAP: 'GET',
        AIRPORTS: 'GET',
        ROUTE_FIND: 'POST'
    },
    
    // Indian airport codes for quick selection
    POPULAR_AIRPORTS: [],
    
    // Fetch popular airports from API
    fetchPopularAirports: async function() {
        try {
            const response = await fetch(`${this.API_BASE_URL}${this.ENDPOINTS.AIRPORTS}`);
            const data = await response.json();
            
            if (data.success && Array.isArray(data.data)) {
                this.POPULAR_AIRPORTS = data.data.map(airport => ({
                    code: airport.code,
                    name: airport.name || 'Unknown',
                    city: airport.city || 'Unknown',
                    country: airport.country || 'India',
                    lat: airport.lat,
                    lon: airport.lon
                }));
                console.log('Successfully loaded', this.POPULAR_AIRPORTS.length, 'airports');
            } else {
                console.error('Invalid airport data format received from API');
                // Fall back to static data if available
                this.loadStaticAirportData();
            }
        } catch (error) {
            console.error('Error fetching airports from API:', error);
            // Fall back to static data if available
            this.loadStaticAirportData();
        }
    },
    
    // Fallback function to load static airport data if API fails
    loadStaticAirportData: function() {
        console.log('Loading static airport data as fallback');
        // Common Indian airports as fallback
        this.POPULAR_AIRPORTS = [
            { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', lat: 28.5665, lon: 77.1031 },
            { code: 'BOM', name: 'Chhatrapati Shivaji International Airport', city: 'Mumbai', country: 'India', lat: 19.0887, lon: 72.8679 },
            { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', country: 'India', lat: 13.1979, lon: 77.7063 },
            { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', country: 'India', lat: 17.2312, lon: 78.4299 },
            { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', lat: 12.9900, lon: 80.1693 },
            { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata', country: 'India', lat: 22.6547, lon: 88.4467 },
            { code: 'COK', name: 'Cochin International Airport', city: 'Kochi', country: 'India', lat: 10.1520, lon: 76.3921 },
            { code: 'PNQ', name: 'Pune Airport', city: 'Pune', country: 'India', lat: 18.5793, lon: 73.9089 },
            { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', country: 'India', lat: 23.0771, lon: 72.6347 },
            { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', country: 'India', lat: 26.8242, lon: 75.8122 }
        ];
    },
    // Chart colors - using Skyscanner palette
    CHART_COLORS: {
        primary: '#0770e3',     // Sky Blue (primary brand color)
        secondary: '#042759',   // Dark Sky (secondary brand color)
        accent: '#00a698',      // Eco Green (accent color)
        success: '#00a698',     // Success green
        warning: '#ff9800',     // Warning orange
        danger: '#d1435b',      // Error red
        light: '#f1f2f8',       // Light grey
        dark: '#111236',        // Dark grey/black
        // Additional colors for charts
        colors: [
            '#0770e3', '#00a698', '#ff9800', '#d1435b', '#042759',
            '#68697f', '#26293c', '#444560', '#b6b8c3', '#dddde5'
        ]
    },
    
    // Map configuration - centered on India
    MAP_CONFIG: {
        center: [20.5937, 78.9629], // Center of India (latitude, longitude)
        zoom: 5,                    // Default zoom level for India
        maxZoom: 10,
        minZoom: 3
    }
};

/**
 * Helper function to make API calls
 * @param {string} endpoint - API endpoint from CONFIG.ENDPOINTS
 * @param {Object} data - Data to send (for POST requests)
 * @returns {Promise} - Promise with API response
 */
async function callAPI(endpoint, data = null) {
    // Get the correct HTTP method for this endpoint
    const endpointKey = Object.keys(CONFIG.ENDPOINTS).find(key => CONFIG.ENDPOINTS[key] === endpoint);
    const method = endpointKey ? CONFIG.HTTP_METHODS[endpointKey] : 'GET';
    const url = CONFIG.API_BASE_URL + endpoint;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data && method === 'POST') {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format number with commas and decimal places
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number string
 */
function formatNumber(number, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number);
}

/**
 * Show loading spinner
 * @param {string} elementId - ID of element to show spinner in
 * @param {string} message - Optional loading message
 */
function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center p-3">
                <div class="spinner"></div>
                <p class="mt-2">${message}</p>
            </div>
        `;
    }
}

/**
 * Show error message
 * @param {string} elementId - ID of element to show error in
 * @param {string} message - Error message
 */
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="alert alert-danger">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }
}

/**
 * Populate airport select dropdown
 * @param {string} selectId - ID of select element
 * @param {boolean} addEmptyOption - Whether to add an empty first option
 */
function populateAirportSelect(selectId, addEmptyOption = true) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Clear existing options
    select.innerHTML = '';
    
    // Add empty option if requested
    if (addEmptyOption) {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Select Airport';
        select.appendChild(emptyOption);
    }
    
    // Group airports by country
    const airportsByCountry = {};
    
    CONFIG.POPULAR_AIRPORTS.forEach(airport => {
        if (!airportsByCountry[airport.country]) {
            airportsByCountry[airport.country] = [];
        }
        airportsByCountry[airport.country].push(airport);
    });
    
    // Add options grouped by country
    Object.keys(airportsByCountry).sort().forEach(country => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = country;
        
        airportsByCountry[country].forEach(airport => {
            const option = document.createElement('option');
            option.value = airport.code;
            option.textContent = `${airport.name} (${airport.code})`;
            optgroup.appendChild(option);
        });
        
        select.appendChild(optgroup);
    });
}
