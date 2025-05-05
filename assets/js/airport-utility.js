/**
 * Flight Cost Intelligence System
 * Airport Utility Functions
 */

/**
 * Populate airport dropdown selects with data from API
 * @param {HTMLSelectElement|Array} originSelects - Origin dropdown element(s)
 * @param {HTMLSelectElement|Array} destinationSelects - Destination dropdown element(s)
 */
function populateAirportDropdowns(originSelects, destinationSelects) {
    // Convert single elements to arrays for consistent handling
    if (!Array.isArray(originSelects)) {
        originSelects = [originSelects];
    }
    if (!Array.isArray(destinationSelects)) {
        destinationSelects = [destinationSelects];
    }
    
    // Show loading state
    originSelects.forEach(select => {
        if (select) select.innerHTML = '<option value="">Loading airports...</option>';
    });
    destinationSelects.forEach(select => {
        if (select) select.innerHTML = '<option value="">Loading airports...</option>';
    });
    
    // Fetch airports from API
    fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.AIRPORTS}`)
        .then(response => response.json())
        .then(response => {
            if (response.success && Array.isArray(response.data)) {
                // Sort airports by city name for better usability
                const airports = response.data.sort((a, b) => {
                    return a.city.localeCompare(b.city);
                });
                
                // Create airport optgroup
                const indiaGroup = document.createElement('optgroup');
                indiaGroup.label = 'India';
                
                // Add airport options to group
                airports.forEach(airport => {
                    const option = document.createElement('option');
                    option.value = airport.code;
                    option.textContent = `${airport.city} - ${airport.name} (${airport.code})`;
                    indiaGroup.appendChild(option.cloneNode(true));
                });
                
                // Populate origin dropdowns
                originSelects.forEach(select => {
                    if (!select) return;
                    // Clear existing options
                    select.innerHTML = '<option value="">Select origin</option>';
                    // Add the airport group
                    select.appendChild(indiaGroup.cloneNode(true));
                });
                
                // Populate destination dropdowns
                destinationSelects.forEach(select => {
                    if (!select) return;
                    // Clear existing options
                    select.innerHTML = '<option value="">Select destination</option>';
                    // Add the airport group
                    select.appendChild(indiaGroup.cloneNode(true));
                });
            } else {
                fallbackToConfigAirports(originSelects, destinationSelects);
            }
        })
        .catch(error => {
            console.error('Error loading airports:', error);
            fallbackToConfigAirports(originSelects, destinationSelects);
        });    
}

/**
 * Fallback to CONFIG.POPULAR_AIRPORTS if API fails
 * @param {HTMLSelectElement|Array} originSelects - Origin dropdown element(s)
 * @param {HTMLSelectElement|Array} destinationSelects - Destination dropdown element(s)
 */
function fallbackToConfigAirports(originSelects, destinationSelects) {
    // Ensure we're working with arrays
    if (!Array.isArray(originSelects)) originSelects = [originSelects];
    if (!Array.isArray(destinationSelects)) destinationSelects = [destinationSelects];
    
    console.log('Falling back to CONFIG.POPULAR_AIRPORTS');
    
    // Check if CONFIG.POPULAR_AIRPORTS is populated
    if (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.POPULAR_AIRPORTS) && CONFIG.POPULAR_AIRPORTS.length > 0) {
        // Sort airports by city name
        const airports = CONFIG.POPULAR_AIRPORTS.sort((a, b) => {
            return (a.city || '').localeCompare(b.city || '');
        });
        
        // Create optgroup for India
        const indiaGroup = document.createElement('optgroup');
        indiaGroup.label = 'India';
        
        // Populate the optgroup with airports
        airports.forEach(airport => {
            const option = document.createElement('option');
            option.value = airport.code;
            option.textContent = `${airport.city} - ${airport.name} (${airport.code})`;
            indiaGroup.appendChild(option);
        });
        
        // Update origin dropdowns
        originSelects.forEach(select => {
            if (!select) return;
            select.innerHTML = '<option value="">Select origin</option>';
            select.appendChild(indiaGroup.cloneNode(true));
        });
        
        // Update destination dropdowns
        destinationSelects.forEach(select => {
            if (!select) return;
            select.innerHTML = '<option value="">Select destination</option>';
            select.appendChild(indiaGroup.cloneNode(true));
        });
    } else {
        populateStaticAirports(originSelects, destinationSelects);
    }
}

/**
 * Populate dropdowns with static airport data if all else fails
 * @param {HTMLSelectElement|Array} originSelects - Origin dropdown element(s)
 * @param {HTMLSelectElement|Array} destinationSelects - Destination dropdown element(s)
 */
function populateStaticAirports(originSelects, destinationSelects) {
    // Ensure we're working with arrays
    if (!Array.isArray(originSelects)) originSelects = [originSelects];
    if (!Array.isArray(destinationSelects)) destinationSelects = [destinationSelects];
    
    console.log('Falling back to static airport data');
    
    // Static list of common Indian airports
    const staticAirports = [
        { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi' },
        { code: 'BOM', name: 'Chhatrapati Shivaji International Airport', city: 'Mumbai' },
        { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore' },
        { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad' },
        { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai' },
        { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', city: 'Kolkata' },
        { code: 'COK', name: 'Cochin International Airport', city: 'Kochi' },
        { code: 'PNQ', name: 'Pune Airport', city: 'Pune' },
        { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad' },
        { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur' }
    ];
    
    // Create optgroup for India
    const indiaGroup = document.createElement('optgroup');
    indiaGroup.label = 'India';
    
    // Populate the optgroup with static airports
    staticAirports.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport.code;
        option.textContent = `${airport.city} - ${airport.name} (${airport.code})`;
        indiaGroup.appendChild(option);
    });
    
    // Update origin dropdowns
    originSelects.forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">Select origin</option>';
        select.appendChild(indiaGroup.cloneNode(true));
    });
    
    // Update destination dropdowns
    destinationSelects.forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">Select destination</option>';
        select.appendChild(indiaGroup.cloneNode(true));
    });
}

/**
 * Get airport name from code
 * @param {string} code - Airport code
 * @returns {string} - Airport name
 */
function getAirportName(code) {
    if (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.POPULAR_AIRPORTS)) {
        const airport = CONFIG.POPULAR_AIRPORTS.find(a => a.code === code);
        if (airport) {
            return `${airport.city} - ${airport.name} (${airport.code})`;
        }
    }
    return code; // Return the code as fallback
}
