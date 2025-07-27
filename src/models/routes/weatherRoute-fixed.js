const express = require('express');
const router = express.Router();
const axios = require('axios');

// Weather API endpoint - Fixed version
router.get('/forecast', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        
        if (!lat || !lon) {
            return res.status(400).json({ 
                error: 'Latitude and longitude are required' 
            });
        }

        // Validate lat/lon values
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        if (isNaN(latitude) || isNaN(longitude) || 
            latitude < -90 || latitude > 90 || 
            longitude < -180 || longitude > 180) {
            return res.status(400).json({ 
                error: 'Invalid latitude or longitude values' 
            });
        }

        // Construct the API URL properly - simplified approach
        const baseUrl = 'https://api.open-meteo.com/v1/forecast';
        const params = {
            latitude: latitude,
            longitude: longitude,
            current_weather: true,
            hourly: 'temperature_2m,precipitation,relativehumidity_2m,windspeed_10m,winddirection_10m,uv_index',
            daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max',
            timezone: 'auto'
        };
        
        console.log('Requesting weather from Open-Meteo API:', baseUrl, params);
        
        const response = await axios.get(baseUrl, { params });
        
        // Process and format the weather data
        const weatherData = {
            current: response.data.current_weather || {},
            hourly: response.data.hourly || {},
            daily: response.data.daily || {},
            location: {
                latitude: latitude,
                longitude: longitude
            }
        };
        
        res.json({
            success: true,
            data: weatherData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Weather API Error:', error);
        
        if (error.response) {
            res.status(error.response.status).json({ 
                success: false, 
                error: 'Weather service error',
                details: error.response.data?.reason || error.response.statusText 
            });
        } else if (error.request) {
            res.status(503).json({ 
                success: false, 
                error: 'Weather service unavailable',
                details: 'Unable to reach weather service' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Internal server error',
                details: error.message 
            });
        }
    }
});

// Get weather for multiple locations
router.post('/batch-forecast', async (req, res) => {
    try {
        const { locations } = req.body;
        
        if (!locations || !Array.isArray(locations)) {
            return res.status(400).json({ 
                error: 'Locations array is required' 
            });
        }

        const weatherPromises = locations.map(async (location) => {
            const params = {
                latitude: parseFloat(location.lat),
                longitude: parseFloat(location.lon),
                current_weather: true
            };
            
            const response = await axios.get('https://api.open-meteo.com/v1/forecast', { params });
            return {
                ...location,
                weather: response.data.current_weather
            };
        });

        const weatherData = await Promise.all(weatherPromises);
        
        res.json({
            success: true,
            data: weatherData
        });
        
    } catch (error) {
        console.error('Batch Weather API Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch batch weather data',
            details: error.message 
        });
    }
});

// Get weather alerts
router.get('/alerts', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        
        if (!lat || !lon) {
            return res.status(400).json({ 
                error: 'Latitude and longitude are required' 
            });
        }

        // Mock alerts for now
        const alerts = [
            {
                type: 'info',
                title: 'Weather Update',
                message: 'Clear skies expected for the next 3 days',
                severity: 'low',
                timestamp: new Date().toISOString()
            }
        ];
        
        res.json({
            success: true,
            alerts
        });
        
    } catch (error) {
        console.error('Weather Alerts API Error:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch weather alerts',
            details: error.message 
        });
    }
});

module.exports = router;
