function Location() { 
	var that = this,
		$this = $(this),
		_forecasts = { daily: [], hourly: [] },
		_observations = [];	
	
    // --- Public Properties & Methods ---
	this.lat = null;
    this.long = null;
    this.city = '';
    this.stationUrl = null; // Kept for structural compatibility if needed elsewhere

	this.temperature = function() {
		if (_observations[0] && _observations[0].item.condition.temp) {
			return Math.round(_observations[0].item.condition.temp);					  
		}
        return 'N/A';
	}
			
	this.observations = (i) => _observations[i];
	this.forecasts = (type) => _forecasts[type];
	
	this.init = function(searchString){
        // searchString can be "lat,lon" or a city name for geocoding
		getCoordinates(searchString).then(() => {
            updateWeatherData();
        });
	};

    // NWS-specific functions are no longer needed
	this.initForecasts = function() { /* Deprecated */ };
	this.initNWSObservations = function(){ /* Deprecated */ };

    // --- Private Functions ---

    // Get Lat/Lon from either a string or by geocoding
    async function getCoordinates(searchString) {
        if (searchString.includes(',')) {
            const parts = searchString.split(',');
            that.lat = parseFloat(parts[0]);
            that.long = parseFloat(parts[1]);
            // Reverse geocode to get city name
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${that.lat},${that.long}&count=1`;
            const response = await fetch(geoUrl);
            const data = await response.json();
            if (data.results) {
                that.city = data.results[0].name;
            }
        } else {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchString)}&count=1`;
            const response = await fetch(geoUrl);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                that.lat = result.latitude;
                that.long = result.longitude;
                that.city = result.name;
            } else {
                 console.error("Geocoding failed for:", searchString);
            }
        }
    }

	// Single function to pull all weather data from Open-Meteo
    function updateWeatherData() {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${that.lat}&longitude=${that.long}&current=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=auto`;

		$.getJSON(url, function(data) {
            mapData(data);
            $this.trigger('refresh');

            if (that.first) {
                $this.trigger('init');
                that.first = false; 
            }
            // Set a timeout to refresh the data, e.g., every 5 minutes
			setTimeout(updateWeatherData, 300000);
		});
    }

    // Adapts Open-Meteo data to the application's expected format
	function mapData(omData) {
        // --- Map Current Conditions to _observations ---
        _observations[0] = {
            item: {
                condition: {
                    temp: omData.current.temperature_2m,
                    text: mapWMOtoText(omData.current.weather_code),
                    code: omData.current.weather_code
                },
                lat: that.lat,
                long: that.long,
            },
            location: { city: that.city, region: '', country: '' },
            wind: {
                chill: omData.current.apparent_temperature,
                direction: omData.current.wind_direction_10m,
                speed: omData.current.wind_speed_10m,
            },
            atmosphere: {
                humidity: omData.current.relative_humidity_2m,
                pressure: omData.current.surface_pressure / 33.8639, // Convert hPa to inHg
                rising: 0, // Trend not available in Open-Meteo basic API
                visibility: 10 // Not directly available, default value
            },
            astronomy: {
                sunrise: dateFns.format(new Date(omData.daily.sunrise[0] * 1000), 'h:mm a'),
                sunset: dateFns.format(new Date(omData.daily.sunset[0] * 1000), 'h:mm a')
            },
            lastBuildDate: new Date().toISOString(),
            ttl: 5 // minutes
        };

        // Mock second observation source with gust data
        _observations[1] = { windGust: { value: omData.current.wind_gusts_10m } };

        // --- Map Daily Forecast ---
        _forecasts.daily = omData.daily.time.map((t, i) => {
            const date = new Date(t * 1000);
            return {
                name: dateFns.format(date, 'dddd'),
                detailedForecast: `High of ${Math.round(omData.daily.temperature_2m_max[i])}°F and a low of ${Math.round(omData.daily.temperature_2m_min[i])}°F. Conditions will be ${mapWMOtoText(omData.daily.weather_code[i])}.`,
                temperature: Math.round(omData.daily.temperature_2m_max[i]),
                temperatureLow: Math.round(omData.daily.temperature_2m_min[i]), // Custom property for low
                icon: mapWMOtoIcons(omData.daily.weather_code[i]), // Note: loops.js expects a URL string, not an array
                startTime: date.toISOString(),
                isDaytime: true, // Simplified
            };
        });
        
        // --- Map Hourly Forecast ---
        _forecasts.hourly = omData.hourly.time.map((t, i) => {
             const date = new Date(t * 1000);
             return {
                temperature: Math.round(omData.hourly.temperature_2m[i]),
                icon: mapWMOtoIcons(omData.hourly.weather_code[i]),
                startTime: date.toISOString(),
                shortForecast: mapWMOtoText(omData.hourly.weather_code[i]),
             };
        });

        $this.trigger('ready');
	}
}