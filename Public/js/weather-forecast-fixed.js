// Weather Forecast JavaScript
class WeatherForecast {
    constructor() {
        // Use the Express server port instead of Live Server port
        this.apiBaseUrl = 'http://127.0.0.1:3000/api/weather';
        this.currentLocation = {
            lat: 12.9716,
            lon: 77.5946
        };
        this.init();
    }

    init() {
        this.loadWeatherData();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const latInput = document.getElementById('latitude');
        const lonInput = document.getElementById('longitude');
        
        if (latInput) latInput.addEventListener('change', this.updateLocation.bind(this));
        if (lonInput) lonInput.addEventListener('change', this.updateLocation.bind(this));
    }

    updateLocation() {
        const lat = parseFloat(document.getElementById('latitude').value);
        const lon = parseFloat(document.getElementById('longitude').value);
        
        if (!isNaN(lat) && !isNaN(lon)) {
            this.currentLocation = { lat, lon };
            this.loadWeatherData();
        }
    }

    async loadWeatherData() {
        try {
            this.showLoading(true);
            
            const response = await fetch(
                `${this.apiBaseUrl}/forecast?lat=${this.currentLocation.lat}&lon=${this.currentLocation.lon}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Weather data received:', data);
            
            if (data.success) {
                this.displayWeatherData(data.data);
                this.displayHourlyForecast(data.data);
                this.displayDailyForecast(data.data);
                this.displayAgriculturalInsights(data.data);
                this.clearError();
            } else {
                throw new Error(data.error || 'Weather service returned error');
            }
            
        } catch (error) {
            console.error('Weather service error:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.showLoading(false);
        }
    }

    displayWeatherData(data) {
        // Current weather
        const current = data.current;
        if (!current) return;
        
        const tempElement = document.getElementById('currentTemp');
        const windElement = document.getElementById('currentWind');
        
        if (tempElement) tempElement.textContent = `${current.temperature}°C`;
        if (windElement) windElement.textContent = `${current.windspeed} km/h`;
        
        // Get additional data from hourly
        const hourly = data.hourly;
        if (hourly && hourly.relativehumidity_2m && hourly.uv_index) {
            const humidityElement = document.getElementById('currentHumidity');
            const uvElement = document.getElementById('currentUV');
            
            if (humidityElement) humidityElement.textContent = `${hourly.relativehumidity_2m[0]}%`;
            if (uvElement) uvElement.textContent = hourly.uv_index[0];
        }

        // Update current weather display
        const currentWeatherDiv = document.getElementById('currentWeather');
        if (currentWeatherDiv) {
            currentWeatherDiv.innerHTML = `
                <div class="text-center">
                    <i class="${this.getWeatherIcon(current.weathercode || 0)} text-6xl text-yellow-400 mb-4"></i>
                    <h4 class="text-2xl font-bold text-gray-800 mb-2">${current.temperature}°C</h4>
                    <p class="text-gray-600 mb-2">Wind: ${current.windspeed} km/h</p>
                    <p class="text-gray-600 mb-2">Direction: ${this.getWindDirection(current.winddirection)}</p>
                    <p class="text-sm text-gray-500">Last updated: ${new Date().toLocaleTimeString()}</p>
                </div>
            `;
        }
    }

    displayHourlyForecast(data) {
        const hourlyDiv = document.getElementById('hourlyForecast');
        if (!hourlyDiv || !data.hourly || !data.hourly.time) return;

        const hourly = data.hourly;
        let html = '';
        
        // Show next 24 hours
        for (let i = 0; i < Math.min(24, hourly.time.length); i++) {
            const time = new Date(hourly.time[i]);
            const temp = hourly.temperature_2m[i];
            const precipitation = hourly.precipitation[i];
            
            html += `
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-sm text-gray-600">${time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    <div class="flex items-center space-x-2">
                        <i class="${this.getWeatherIcon(precipitation > 0)} text-lg"></i>
                        <span class="text-sm font-medium">${temp}°C</span>
                    </div>
                </div>
            `;
        }

        hourlyDiv.innerHTML = html;
    }

    displayDailyForecast(data) {
        const dailyDiv = document.getElementById('dailyForecast');
        if (!dailyDiv || !data.daily || !data.daily.time) return;

        const daily = data.daily;
        let html = '';
        
        for (let i = 0; i < Math.min(7, daily.time.length); i++) {
            const date = new Date(daily.time[i]);
            const maxTemp = daily.temperature_2m_max[i];
            const minTemp = daily.temperature_2m_min[i];
            const precipitation = daily.precipitation_sum[i];
            const uvIndex = daily.uv_index_max[i];
            
            html += `
                <div class="bg-white/50 rounded-lg p-4 hover-lift transition-all">
                    <div class="text-center">
                        <p class="font-semibold text-gray-800">${date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                        <p class="text-xs text-gray-500 mb-2">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <i class="${this.getWeatherIcon(precipitation > 0)} text-2xl mb-2"></i>
                        <p class="text-lg font-bold">${maxTemp}°</p>
                        <p class="text-sm text-gray-600">${minTemp}°</p>
                        <p class="text-xs text-gray-500 mt-1">${precipitation}mm</p>
                    </div>
                </div>
            `;
        }

        dailyDiv.innerHTML = html;
    }

    displayAgriculturalInsights(data) {
        const plantingAdvice = document.getElementById('plantingAdvice');
        const irrigationAdvice = document.getElementById('irrigationAdvice');
        
        if (!plantingAdvice || !irrigationAdvice) return;

        const current = data.current;
        const daily = data.daily;
        
        if (!current || !daily) return;

        // Get weather conditions
        const temp = current.temperature;
        const windSpeed = current.windspeed;
        const precipitation = daily.precipitation_sum[0] || 0;
        
        // Generate planting recommendations
        let plantingRec = '';
        if (temp > 30) {
            plantingRec = 'High temperatures - consider heat-resistant crops like sorghum or millet. Ensure adequate shade and water.';
        } else if (temp < 15) {
            plantingRec = 'Cool weather - good for leafy vegetables, peas, and root crops. Monitor for frost.';
        } else if (precipitation > 5) {
            plantingRec = 'Good rainfall expected - ideal for planting rice, corn, and other water-intensive crops.';
        } else {
            plantingRec = 'Moderate conditions - suitable for most crops. Consider drought-resistant varieties.';
        }

        // Generate irrigation recommendations
        let irrigationRec = '';
        if (precipitation === 0) {
            irrigationRec = 'No rainfall expected - increase irrigation frequency. Water early morning or late evening.';
        } else if (precipitation < 2) {
            irrigationRec = 'Light rainfall - maintain regular irrigation schedule. Monitor soil moisture.';
        } else {
            irrigationRec = 'Adequate rainfall - reduce irrigation. Ensure proper drainage to prevent waterlogging.';
        }

        // Add wind considerations
        if (windSpeed > 20) {
            irrigationRec += ' High winds may increase evaporation - adjust irrigation timing.';
        }

        plantingAdvice.textContent = plantingRec;
        irrigationAdvice.textContent = irrigationRec;
    }

    getWeatherIcon(condition) {
        if (typeof condition === 'boolean') {
            return condition ? 'fas fa-cloud-rain text-blue-500' : 'fas fa-sun text-yellow-400';
        }
        
        // WMO Weather interpretation codes
        const iconMap = {
            0: 'fas fa-sun text-yellow-400', // Clear sky
            1: 'fas fa-sun text-yellow-300', // Mainly clear
            2: 'fas fa-cloud-sun text-gray-400', // Partly cloudy
            3: 'fas fa-cloud text-gray-500', // Overcast
            45: 'fas fa-smog text-gray-400', // Fog
            48: 'fas fa-smog text-gray-300', // Depositing rime fog
            51: 'fas fa-cloud-drizzle text-blue-400', // Light drizzle
            53: 'fas fa-cloud-drizzle text-blue-500', // Moderate drizzle
            55: 'fas fa-cloud-drizzle text-blue-600', // Dense drizzle
            61: 'fas fa-cloud-rain text-blue-400', // Slight rain
            63: 'fas fa-cloud-rain text-blue-500', // Moderate rain
            65: 'fas fa-cloud-rain text-blue-600', // Heavy rain
            71: 'fas fa-snowflake text-blue-200', // Slight snow
            73: 'fas fa-snowflake text-blue-300', // Moderate snow
            75: 'fas fa-snowflake text-blue-400', // Heavy snow
            95: 'fas fa-bolt text-yellow-500', // Thunderstorm
            96: 'fas fa-bolt text-yellow-600', // Thunderstorm with slight hail
            99: 'fas fa-bolt text-yellow-700'  // Thunderstorm with heavy hail
        };
        
        return iconMap[condition] || 'fas fa-sun text-yellow-400';
    }

    getWindDirection(degrees) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(degrees / 45) % 8];
    }

    showLoading(show) {
        const loadingElements = document.querySelectorAll('.loading-spinner');
        loadingElements.forEach(el => {
            if (el) el.style.display = show ? 'block' : 'none';
        });
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
        errorDiv.innerHTML = `
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline">${message}</span>
        `;
        
        const container = document.querySelector('.flex-1.p-8');
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }

    clearError() {
        const errorDivs = document.querySelectorAll('.bg-red-100.border-red-400');
        errorDivs.forEach(div => div.remove());
    }

    getErrorMessage(error) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            return 'Weather service timeout - please check your internet connection';
        } else if (error.message.includes('Failed to fetch')) {
            return 'Unable to connect to weather service - please check your internet connection';
        } else if (error.message.includes('HTTP')) {
            return `Weather service error: ${error.message}`;
        } else {
            return 'Failed to load weather data - please try again later';
        }
    }
}

// Global function for button click
function getWeatherForecast() {
    const weather = new WeatherForecast();
    weather.loadWeatherData();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    const weather = new WeatherForecast();
    
    // Add loading animation to buttons
    const buttons = document.querySelectorAll('button, .sidebar-item');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
});

// Logout function
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/Public/login.html';
}
