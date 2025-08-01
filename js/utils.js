//  Fisher-Yates shuffle
function shuffle (array) {
	var i = 0,
	    j = 0,
	    temp = null;

	for (i = array.length - 1; i > 0; i -= 1) {
		j = Math.floor(Math.random() * (i + 1));
		temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
	
	return array;
}

// Add this helper function at the top of the file or in a utility script
function mapWMOtoText(code) {
    const mapping = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        66: 'Light freezing rain', 67: 'Heavy freezing rain',
        71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
        85: 'Slight snow showers', 86: 'Heavy snow showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };
    return mapping[code] || 'N/A';
}

function mapWMOtoIcons(code) {
    // This is a sample mapping. The original icon set (01-47.png) seems based on Yahoo's codes.
    // A direct 1-to-1 mapping from WMO is not perfect and may need adjustments.
	const map = {
        0: [26, 25],  // Clear -> Sunny/Clear
        1: [28, 27],  // Mainly Clear -> Mostly Sunny/Mostly Clear
        2: [28, 27],  // Partly Cloudy -> Partly Cloudy
        3: [22, 21],  // Overcast -> Cloudy
        45: [15, 15], // Fog -> Fog
        48: [15, 15], // Fog -> Fog
        51: [8, 8],   // Drizzle -> Rain
        53: [8, 8],
        55: [8, 8],
        61: [7, 7],   // Rain -> Showers
        63: [7, 7],
        65: [5, 5],
        71: [10, 10], // Snow -> Snow
        73: [10, 10],
        75: [11, 11],
        80: [7, 7],   // Showers -> Showers
        81: [5, 5],
        82: [5, 5],
        85: [10, 10], // Snow showers
        86: [11, 11],
        95: [1, 1],   // Thunderstorm
        96: [1, 1],
        99: [1, 1]
	};
    // Simplified logic: Assume 'day' for now.
    const icons = map[code] || [22, 21]; // Default to cloudy
    return ['images/icons/' + ('0' + icons[0]).slice(-2) + '.png'];
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}


function getNextHighestIndex(arr, value) {
    var i = arr.length;
    while (arr[--i] > value);
    return ++i; 
}


function getUrlParameter(e) {
	return decodeURI((new RegExp(e + "=(.+?)(&|$)").exec(location.search) || [, null])[1])
}


		
// convert celsius to farenheight
function C2F(c){
	return Math.round( c * 9 / 5 + 32 );
}


// meters per second to mph
function mps2mph(meters) {
	return Math.round(  parseFloat(meters) * 2.23694 );
}
	

// array swap
Array.prototype.swap = function(a,b){ var tmp=this[a];this[a]=this[b];this[b]=tmp;};

	
function degToCompass(deg){
    val = Math.round((deg/22.5)+.5);
    arr=["N","NE","E","SE","S","SW","W","NW"];
    return arr[(val % 8)];
}
	


function distance(lat1, lon1, lat2, lon2) {
	var radlat1 = Math.PI * lat1/180,
		radlat2 = Math.PI * lat2/180,
		theta = lon1-lon2,
		radtheta = Math.PI * theta/180,
		dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
	return dist;
}


function dewPoint(tem, r){
    tem = -1.0*(tem-32)*5/9	;
    es = 6.112*Math.exp(-1.0*17.67*tem/(243.5 - tem));
    ed = r/100.0*es;
    eln = Math.log(ed/6.112);
    td = -243.5*eln/(eln - 17.67 );
    return Math.round( (td*9/5)+32 );	
}

function heatIndex(T, R) { // T = temp, R = relative humidity
	var T2 = T*T, R2= R*R,
		c1 = -42.379, c2 = 2.04901523, c3 = 10.14333127,
		c4 = -0.22475541, c5 = -6.83783*Math.pow(10,-3), c6 = -5.481717*Math.pow(10,-2),
		c7 = 1.22874*Math.pow(10,-3), c8 = 8.5282*Math.pow(10,-4), c9 = -1.99*Math.pow(10,-6);
		
	return Math.round(c1 + c2*T + c3 *R + c4*T*R + c5*T2 + c6*R2 + c7*T2*R + c8*T*R2 + c9*T2*R2);
}


// maps current condition code to icon
function getCCicon(ccCode){
	return "images/icons/" + ( "0" +  {0:1,1:1,2:1,3:1,4:1,5:2,6:38,7:3,8:4,9:5,10:6,11:7,12:7,13:9,14:10,15:39,16:12,17:13,18:13,19:17,20:15,21:16,22:14,23:18,24:18,25:42,26:20,27:21,28:22,29:23,30:24,31:25,32:26,33:27,34:28,35:38,36:41,37:31,38:31,39:31,40:30,41:12,42:9,43:12,44:24,45:1,46:10,47:1,3200:19}[ccCode]
	).slice(-2) + ".png";
}



// https://date-fns.org/docs/Getting-Started

