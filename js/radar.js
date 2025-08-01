// A valid API key for weather.com is required.
var api_key = '8de2d8b3a93542c9a2d8b3a935a2c909'; // <--- IMPORTANT: REPLACE WITH YOUR WEATHER API KEY

// A valid Mapbox access token is required for the basemap.
var map_key = 'pk.eyJ1Ijoid2VhdGhlciIsImEiOiJjbHAxbHNjdncwaDhvMmptcno1ZTdqNDJ0In0.iywE3NefjboFg11a11ON0Q'; // <--- IMPORTANT: REPLACE WITH YOUR MAPBOX KEY

function Radar(divIDin, intervalHoursIn, zoomIn, latitudeIn, longitudeIn, withSat) {

    var map,
        divID = divIDin,
        zoom = zoomIn,
        latitude = latitudeIn,
        longitude = longitudeIn,
        timeLayers = [],
        animationInterval = null;

    this.setView = function(lat, long, zoomLevel) {
        map.setView(L.latLng(lat, long), zoomLevel)
    };

    // Main function to initialize the map and start the process
    function initialize() {
        // Clear any existing map instance in the container
        if (map) {
            map.remove();
        }

        map = L.map(divID, {
            zoom: zoom,
            fullscreenControl: false,
            center: [latitude, longitude],
            attributionControl: false
        });

        // Use the specified Mapbox basemap from radar.js
        L.tileLayer('https://api.mapbox.com/styles/v1/goldbblazez/ckgc8lzdz4lzh19qt7q9wbbr9/tiles/{z}/{x}/{y}?access_token=' + map_key, {
            tileSize: 512,
            zoomOffset: -1,
            attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        loadAndAnimateImages();
    }

    // Fetches image timestamps and sets up the animation
    function loadAndAnimateImages() {
        // Clear existing layers and animation interval
        if (animationInterval) {
            clearInterval(animationInterval);
        }
        timeLayers.forEach(layer => layer.remove());
        timeLayers = [];

        const product = withSat ? 'satrad' : 'twcRadarMosaic';
        const fetchUrl = `https://api.weather.com/v3/TileServer/series/productSet/PPAcore?filter=${product}&apiKey=${api_key}`;

        fetch(fetchUrl)
            .then(response => response.json())
            .then(data => {
                const seriesInfo = data.seriesInfo[product];
                if (!seriesInfo || !seriesInfo.series) {
                    console.error("Could not find radar/satellite series data.");
                    return;
                }

                const sortedTimestamps = seriesInfo.series.sort((a, b) => a.ts - b.ts);

                // Create a Leaflet layer for each timestamp
                sortedTimestamps.forEach(timestamp => {
                    const tileUrl = `https://api.weather.com/v3/TileServer/tile/${product}?ts=${timestamp.ts}&xyz={x}:{y}:{z}&apiKey=${api_key}`;
                    const layer = L.tileLayer(tileUrl, {
                        opacity: 0, // Start with the layer invisible
                        tileSize: 256,
                        pane: 'tilePane' // Ensure it renders above the basemap
                    });
                    timeLayers.push(layer);
                    layer.addTo(map);
                });

                // Start the animation loop
                animateRadar();
            })
            .catch(console.error);
    }

    // Animation loop function
    function animateRadar() {
        let currentIndex = 0;

        const loop = () => {
            // Set opacity for all layers
            timeLayers.forEach((layer, index) => {
                layer.setOpacity(index === currentIndex ? 0.8 : 0);
            });

            currentIndex++;

            // If we've reached the end, pause and then restart the animation
            if (currentIndex >= timeLayers.length) {
                clearInterval(animationInterval);
                setTimeout(() => {
                    // Fetch fresh data before restarting
                    loadAndAnimateImages();
                }, 1500); // Pause for 1.5 seconds at the end
            }
        };

        // Start the animation, changing frames every 100ms
        animationInterval = setInterval(loop, 100);
    }

    // Start the process
    initialize();
}

/*
 * Workaround for 1px lines appearing in some browsers due to fractional transforms
 * and resulting anti-aliasing.
 * https://github.com/Leaflet/Leaflet/issues/3575
 */

(function() {
    var originalInitTile = L.GridLayer.prototype._initTile
    L.GridLayer.include({
        _initTile: function(tile) {
            originalInitTile.call(this, tile);

            var tileSize = this.getTileSize();

            tile.style.width = tileSize.x + 1 + 'px';
            tile.style.height = tileSize.y + 1 + 'px';
        }
    });
})();