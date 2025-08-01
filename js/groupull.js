function GroupDataManager() {
	var locations = 
		[
			{name:'Chicago', n2:'IL'},
			{name:'Minneapolis', n2:'MN'},
			{name:'Tempe', n2:'AZ'},
			{name:'Fargo', n2:'ND'},
			{name:'North Hollywood', n2:'CA'},
			{name:'Los Angeles', n2:'CA'},
			{name:'Huntington Beach', n2:'CA'},
			{name:'Las Vegas', n2:'NV'},
			{name:'Honolulu', n2:'HI'},
			{name:'Orlando', n2:'FL'},
			{name:'New York', n2:'NY'},
			{name:'Napa', n2:'CA'},
			{name:'Montego Bay', n2:'JM'}, // Country code updated for better geocoding
			{name:'Kona', n2:'HI'},
			{name:'Kalapaki Beach', n2:'HI'}, // Name corrected for better geocoding
			{name:'Ixtapa', n2:'MX'}
		]
	;
	
	checkRefresh();	
	setInterval(checkRefresh, 300000); // 5 minutes

	// check to see if data needs to be refreshed
    function checkRefresh() {
		for (const location of locations) {
			// check the expiration, refresh every 5 minutes
			if (location.hasOwnProperty('xdate') && dateFns.isFuture(location.xdate)) { continue; }
			
			pullData(location);
		}
    }
	
	async function pullData(location) {
		// If we don't have lat/lon, get them first.
		if (!location.hasOwnProperty('latitude')) {
			const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location.name)}&count=1`;
			try {
				const response = await fetch(geoUrl);
				const geoData = await response.json();
				if (geoData.results && geoData.results.length > 0) {
					const result = geoData.results[0];
					location.latitude = result.latitude;
					location.longitude = result.longitude;
                    location.id = result.id; // Unique ID from geocoding
				} else {
					console.error("Geocoding failed for: ", location.name);
					return;
				}
			} catch (error) {
				console.error("Error fetching geocoding data:", error);
				return;
			}
		}
		
        // Now fetch weather data
		const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`;
		
		$.getJSON(weatherUrl, function(data) {
			location.data = data;
			
            const locationId = 'loc-' + location.id;
			let $span = $('#marquee-now>span#' + locationId);

			if ($span.length === 0) {
				$span = $(`<span id='${locationId}'></span>`).appendTo('#marquee-now');
			}

            const weatherText = mapWMOtoText(data.current.weather_code);
			$span.text(`${location.name}: ${Math.round(data.current.temperature_2m)}°F ${weatherText}`);
						
			// Set the expiration date/time (e.g., 5 minutes from now)
			location.xdate = dateFns.addMinutes(new Date(), 5);
		});
	}
}
var groupDataManager = new GroupDataManager;