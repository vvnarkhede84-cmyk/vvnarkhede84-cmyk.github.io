/**
 * National AQI Live-Mapping Terminal
 * Frontend Application - Leaflet.js Integration
 */

// Global state
const appState = {
    map: null,
    markers: [],
    cities: [],
    filteredCities: [],
    selectedCity: null,
    markersLayer: null
};

// AQI configuration
const AQI_CONFIG = {
    good: { min: 0, max: 50, label: "Good", color: "#2ecc71" },
    satisfactory: { min: 51, max: 100, label: "Satisfactory", color: "#f39c12" },
    moderatelyPolluted: { min: 101, max: 200, label: "Moderately Polluted", color: "#e74c3c" },
    poor: { min: 201, max: 300, label: "Poor", color: "#9b59b6" },
    veryPoor: { min: 301, max: 400, label: "Very Poor", color: "#34495e" },
    severe: { min: 401, max: 500, label: "Severe", color: "#c0392b" }
};

// Health recommendations for each AQI tier
const HEALTH_RECOMMENDATIONS = {
    good: "🟢 Air quality is good. Ideal for outdoor activities. All groups can enjoy outdoor activities.",
    satisfactory: "🟡 Air quality is satisfactory. Members of sensitive groups may experience minor respiratory symptoms during prolonged outdoor activities.",
    moderatelyPolluted: "🟠 Air quality is moderately polluted. Reduce outdoor activities. Sensitive groups should limit prolonged outdoor exposure.",
    poor: "🔴 Air quality is poor. Avoid outdoors if possible. Everyone should limit prolonged outdoor exertion.",
    veryPoor: "🟣 Air quality is very poor. Stay indoors and keep all physical activity minimal. Use air purifiers indoors.",
    severe: "🔴 Air quality is severe. Remain indoors and keep exertion minimal. Use N95/N99 masks if going outside."
};

/**
 * Get health recommendation based on AQI value
 */
function getHealthRecommendation(aqi) {
    if (aqi <= 50) return HEALTH_RECOMMENDATIONS.good;
    if (aqi <= 100) return HEALTH_RECOMMENDATIONS.satisfactory;
    if (aqi <= 200) return HEALTH_RECOMMENDATIONS.moderatelyPolluted;
    if (aqi <= 300) return HEALTH_RECOMMENDATIONS.poor;
    if (aqi <= 400) return HEALTH_RECOMMENDATIONS.veryPoor;
    return HEALTH_RECOMMENDATIONS.severe;
}

/**
 * Get AQI category based on value
 */
function getAQICategory(aqi) {
    if (aqi <= 50) return AQI_CONFIG.good;
    if (aqi <= 100) return AQI_CONFIG.satisfactory;
    if (aqi <= 200) return AQI_CONFIG.moderatelyPolluted;
    if (aqi <= 300) return AQI_CONFIG.poor;
    if (aqi <= 400) return AQI_CONFIG.veryPoor;
    return AQI_CONFIG.severe;
}

/**
 * Get CSS class for AQI value
 */
function getAQIClass(aqi) {
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "satisfactory";
    if (aqi <= 200) return "moderately-polluted";
    if (aqi <= 300) return "poor";
    if (aqi <= 400) return "very-poor";
    return "severe";
}

/**
 * Format date for display
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "UTC"
    });
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Create custom marker element with pulsing radar effect
 */
function createMarkerElement(aqi) {
    const category = getAQICategory(aqi);
    const className = getAQIClass(aqi);
    
    // Create container
    const container = document.createElement("div");
    container.className = "aqi-marker-container";
    
    // Create pulsing ring
    const pulse = document.createElement("div");
    pulse.className = `aqi-marker-pulse ${className}`;
    
    // Create inner marker
    const marker = document.createElement("div");
    marker.className = `aqi-marker ${className}`;
    marker.textContent = aqi;
    marker.title = `${category.label} - AQI: ${aqi}`;
    
    container.appendChild(pulse);
    container.appendChild(marker);
    
    return container;
}

/**
 * Initialize the map
 */
function initializeMap() {
    // Create map centered on India
    appState.map = L.map("map").setView([20.5937, 78.9629], 5);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 4,
        className: 'map-tiles'
    }).addTo(appState.map);

    // Create markers layer group
    appState.markersLayer = L.layerGroup().addTo(appState.map);
}

/**
 * Get mock data for local testing (when fetch fails)
 */
function getMockAQIData() {
    console.log("📋 Using mock data for testing (run with HTTP server for live data)");
    return {
        last_updated: new Date().toISOString(),
        cities: appState.cities.length > 0 ? appState.cities : [
            {
                "name": "Mumbai",
                "state": "Maharashtra",
                "population": "21,291,000",
                "coordinates": [19.0760, 72.8777],
                "aqi": 74,
                "dominant_pollutant": "pm25"
            },
            {
                "name": "New Delhi",
                "state": "Delhi",
                "population": "33,807,000",
                "coordinates": [28.6139, 77.2090],
                "aqi": 169,
                "dominant_pollutant": "pm10"
            },
            {
                "name": "Bangalore",
                "state": "Karnataka",
                "population": "12,476,000",
                "coordinates": [12.9716, 77.5946],
                "aqi": 58,
                "dominant_pollutant": "pm25"
            },
            {
                "name": "Kolkata",
                "state": "West Bengal",
                "population": "15,133,000",
                "coordinates": [22.5726, 88.3639],
                "aqi": 125,
                "dominant_pollutant": "pm10"
            },
            {
                "name": "Hyderabad",
                "state": "Telangana",
                "population": "10,123,000",
                "coordinates": [17.3850, 78.4867],
                "aqi": 82,
                "dominant_pollutant": "no2"
            },
            {
                "name": "Chennai",
                "state": "Tamil Nadu",
                "population": "7,088,000",
                "coordinates": [13.0827, 80.2707],
                "aqi": 65,
                "dominant_pollutant": "pm25"
            },
            {
                "name": "Pune",
                "state": "Maharashtra",
                "population": "6,430,000",
                "coordinates": [18.5204, 73.8567],
                "aqi": 71,
                "dominant_pollutant": "pm25"
            },
            {
                "name": "Jaipur",
                "state": "Rajasthan",
                "population": "4,850,000",
                "coordinates": [26.9124, 75.7873],
                "aqi": 158,
                "dominant_pollutant": "pm10"
            },
            {
                "name": "Lucknow",
                "state": "Uttar Pradesh",
                "population": "3,382,000",
                "coordinates": [26.8467, 80.9462],
                "aqi": 145,
                "dominant_pollutant": "pm25"
            },
            {
                "name": "Kanpur",
                "state": "Uttar Pradesh",
                "population": "3,226,000",
                "coordinates": [26.4499, 80.3319],
                "aqi": 187,
                "dominant_pollutant": "pm10"
            }
        ]
    };
}
async function loadAQIData() {
    try {
        console.log("📡 Fetching AQI data from data/aqi_snapshot.json...");
        const response = await fetch("data/aqi_snapshot.json", {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            cache: "no-cache"
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("✅ AQI data loaded successfully:", data.cities.length, "cities");
        
        appState.cities = data.cities;
        appState.filteredCities = [...appState.cities];
        
        // Update last updated time
        document.getElementById("last-updated").textContent = formatDate(data.last_updated);
        
        return data;
    } catch (error) {
        console.error("❌ Error loading AQI data:", error);
        console.error("Error message:", error.message);
        console.log("💡 Tip: To serve files locally, run: python -m http.server 8000");
        console.log("   Then open: http://localhost:8000");
        
        // Use mock data for demonstration
        console.log("📋 Loading mock data for demonstration...");
        const mockData = getMockAQIData();
        appState.cities = mockData.cities;
        appState.filteredCities = [...appState.cities];
        
        document.getElementById("last-updated").innerHTML = 
            `<span style="color: #f39c12;">⚠️ Mock Data (Run with HTTP server for live data)</span>`;
        
        return mockData;
    }
}

/**
 * Place markers on map
 */
function placeMarkers() {
    // Clear existing markers
    appState.markersLayer.clearLayers();
    appState.markers = [];

    appState.filteredCities.forEach((city) => {
        const [lat, lng] = city.coordinates;
        const markerElement = createMarkerElement(city.aqi);
        
        // Create custom marker with larger icon size to accommodate pulse ring
        const marker = L.marker([lat, lng], {
            icon: L.divIcon({
                html: markerElement.outerHTML,
                className: "",
                iconSize: [60, 60],
                iconAnchor: [30, 30]
            })
        });

        // Add click event
        marker.on("click", () => {
            displayCityInfo(city);
        });

        marker.addTo(appState.markersLayer);
        appState.markers.push({ marker, city });
    });
}

/**
 * Display city information in the info card
 */
function displayCityInfo(city) {
    appState.selectedCity = city;
    const category = getAQICategory(city.aqi);

    // Update info card
    document.getElementById("info-city-name").textContent = city.name;
    document.getElementById("info-city-state").textContent = city.state;
    document.getElementById("info-aqi-value").textContent = city.aqi;
    document.getElementById("info-aqi-label").textContent = category.label;
    document.getElementById("info-tier-badge").textContent = category.label.toUpperCase();
    document.getElementById("info-tier-badge").className = `aqi-tier-badge ${getAQIClass(city.aqi)}`;
    document.getElementById("info-population").textContent = city.population;
    document.getElementById("info-pollutant").textContent = city.dominant_pollutant.toUpperCase();
    document.getElementById("info-coords").textContent = 
        `${city.coordinates[0].toFixed(4)}°, ${city.coordinates[1].toFixed(4)}°`;
    
    // Add health recommendation
    document.getElementById("health-message").textContent = getHealthRecommendation(city.aqi);

    // Update AQI display color
    const aqiDisplay = document.querySelector(".aqi-display");
    aqiDisplay.style.borderColor = category.color;
    aqiDisplay.style.backgroundColor = `rgba(0, 212, 255, 0.05)`;

    // Show info card
    const infoCard = document.getElementById("city-info");
    infoCard.classList.add("active");
    
    // Smart positioning - check available viewport space
    positionInfoCard();

    // Center map on city with animation
    appState.map.flyTo(city.coordinates, 7, {
        duration: 0.8,
        easeLinearity: 0.25
    });
}

/**
 * Smart positioning for info card to avoid going off-screen
 */
function positionInfoCard() {
    const infoCard = document.getElementById("city-info");
    const mapContainer = document.getElementById("map");
    
    const defaultRight = 30;
    const defaultBottom = 30;
    const cardWidth = 380;
    const cardHeight = 420;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let right = defaultRight;
    let bottom = defaultBottom;
    let topAligned = false;
    
    // Check if card would go off right edge
    if (defaultRight + cardWidth > viewportWidth - 20) {
        right = Math.max(20, viewportWidth - cardWidth - 20);
    }
    
    // Check if card would go off bottom edge
    if (defaultBottom + cardHeight > viewportHeight - 20) {
        bottom = Math.max(20, viewportHeight - cardHeight - 20);
        topAligned = true;
    }
    
    infoCard.style.right = right + "px";
    infoCard.style.bottom = bottom + "px";
    
    if (topAligned) {
        infoCard.classList.add("top-aligned");
    } else {
        infoCard.classList.remove("top-aligned");
    }
}

/**
 * Close city info card
 */
function closeCityInfo() {
    document.getElementById("city-info").classList.remove("active");
    appState.selectedCity = null;
}

/**
 * Update statistics
 */
function updateStatistics() {
    if (appState.filteredCities.length === 0) {
        document.getElementById("total-cities").textContent = "0";
        document.getElementById("avg-aqi").textContent = "--";
        document.getElementById("max-aqi").textContent = "--";
        return;
    }

    const aqiValues = appState.filteredCities.map(c => c.aqi);
    const totalCities = appState.filteredCities.length;
    const avgAQI = Math.round(aqiValues.reduce((a, b) => a + b, 0) / totalCities);
    const maxAQI = Math.max(...aqiValues);

    document.getElementById("total-cities").textContent = totalCities;
    document.getElementById("avg-aqi").textContent = avgAQI;
    document.getElementById("max-aqi").textContent = maxAQI;
}

/**
 * Populate city list in sidebar
 */
function populateCityList() {
    const cityList = document.getElementById("city-list");
    cityList.innerHTML = "";

    appState.filteredCities.forEach((city) => {
        const div = document.createElement("div");
        div.className = "city-item";
        
        const category = getAQICategory(city.aqi);
        
        div.innerHTML = `
            <div class="city-name" style="border-left: 3px solid ${category.color}; padding-left: 8px;">
                ${city.name}
            </div>
            <div class="city-aqi">AQI: ${city.aqi} (${category.label})</div>
        `;

        div.addEventListener("click", () => {
            displayCityInfo(city);
            // Highlight in list
            document.querySelectorAll(".city-item").forEach(item => item.classList.remove("active"));
            div.classList.add("active");
        });

        cityList.appendChild(div);
    });
}

/**
 * Filter cities based on search input
 */
function filterCities(searchTerm) {
    const term = searchTerm.toLowerCase();
    appState.filteredCities = appState.cities.filter((city) => {
        return (
            city.name.toLowerCase().includes(term) ||
            city.state.toLowerCase().includes(term)
        );
    });

    placeMarkers();
    populateCityList();
    updateStatistics();
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Search functionality
    document.getElementById("search-input").addEventListener("input", (e) => {
        filterCities(e.target.value);
    });

    // Close info card
    document.getElementById("close-info").addEventListener("click", closeCityInfo);
    
    // Close info card on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && appState.selectedCity) {
            closeCityInfo();
        }
    });

    // Reposition card on window resize
    window.addEventListener("resize", () => {
        if (appState.selectedCity) {
            positionInfoCard();
        }
    });

    // Close info card when clicking outside (but not on markers)
    document.addEventListener("click", (e) => {
        const infoCard = document.getElementById("city-info");
        const isMarkerContainer = e.target.closest(".aqi-marker-container");
        const isInfoCard = e.target.closest(".city-info-card");
        
        if (infoCard.classList.contains("active") && !isInfoCard && !isMarkerContainer) {
            // Don't close if clicking on the map
            if (e.target.closest("#map")) {
                // Check if it's not a marker click
                if (!isMarkerContainer) {
                    // Allow map clicks to close the card
                    // closeCityInfo();
                }
            }
        }
    });
}

/**
 * Main initialization function
 */
async function initializeApp() {
    console.log("🌍 Initializing National AQI Live-Mapping Terminal...");

    try {
        // Initialize map
        initializeMap();

        // Load AQI data
        const data = await loadAQIData();
        if (!data) {
            console.error("Failed to load AQI data and no mock data available");
            return;
        }

        // Place markers
        placeMarkers();

        // Populate city list
        populateCityList();

        // Update statistics
        updateStatistics();

        // Initialize event listeners
        initializeEventListeners();

        console.log("✅ Application initialized successfully!");
        console.log(`📊 Loaded data for ${appState.cities.length} cities`);
    } catch (error) {
        console.error("❌ Error during initialization:", error);
    }
}

/**
 * Refresh data periodically (every 10 minutes)
 */
function startAutoRefresh() {
    setInterval(async () => {
        console.log("🔄 Refreshing AQI data...");
        const data = await loadAQIData();
        if (data) {
            appState.filteredCities = [...appState.cities];
            placeMarkers();
            populateCityList();
            updateStatistics();
            console.log("✅ Data refreshed successfully!");
        }
    }, 10 * 60 * 1000); // 10 minutes
}

/**
 * Start application when DOM is ready
 */
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
} else {
    initializeApp();
}

// Start auto-refresh
startAutoRefresh();
