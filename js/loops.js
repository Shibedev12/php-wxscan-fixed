
function Loops(bindDataManager) {
	var //dataManager,
		obsData, 
		foreDataDaily, 
		foreDataHourly;
	
	obsData = bindDataManager.observations;
	foreDataDaily = bindDataManager.forecasts('daily');
	foreDataHourly = bindDataManager.forecasts('hourly');


	// init the display loops
	displayAtmospheric(0);
	displayForecast(0);

	function displayAtmospheric(idx) {

		var displays = {	
	
				conditions() {
					return obsData(0).item.condition.text.toLowerCase();
				},

				wind(){ return 'wind ' + degToCompass(obsData(0).wind.direction) + ' ' + obsData(0).wind.speed; },

				gusts(){ 
					if ( obsData(1)!=undefined ) {
						return obsData(1).windGust.value!=null ? 'gusts ' + mps2mph( obsData(1).windGust.value ) : ''; 
					}
				},

				humidity(){ return 'humidity ' + obsData(0).atmosphere.humidity + '%'; },

				dewpoint(){ return 'dew point ' + dewPoint(obsData(0).item.condition.temp, obsData(0).atmosphere.humidity ) + '&deg;'; },

				heatindex_windchill(){
					if (parseInt(obsData(0).item.condition.temp)<80 && parseInt(obsData(0).wind.chill) < parseInt(obsData(0).item.condition.temp)) {
						return 'wind chill ' + obsData(0).wind.chill + '&deg;';	
					} else if (parseInt(obsData(0).item.condition.temp)>=80 && parseInt(obsData(0).atmosphere.humidity)>=40 ){
						return 'heat index ' + heatIndex(obsData(0).item.condition.temp, obsData(0).atmosphere.humidity) + '&deg;';
					}
					else return '';					
				},

				pressure(){ return 'pressure ' + (obsData(0).atmosphere.pressure*0.0295301).toFixed(2) + ' ' + ['S','R','F'][obsData(0).atmosphere.rising]; },

				visibility() { return 'visibility ' + obsData(0).atmosphere.visibility + ' mile' + (obsData(0).atmosphere.visibility != 1 ? 's' : ''); },

				uvindex() { return ''; }
				
		},
		keys = Object.keys(displays),
		text = displays[ keys[idx] ]();

		// increment the pointer
		idx = (++idx===keys.length ? 0 : idx);

		if (text) { 
			$('#current-info').html(text);
			setTimeout(function(){ displayAtmospheric(idx) }, 6000); // 6 second increment loop
		} else {
			// nothing to display - skip to the next one
			setTimeout(function(){ displayAtmospheric(idx) }, 0); 
		}	

	}  // end function
	
	
	function displayForecast(idx) {
		
		var displays = {		

				text1() {
					$('#forecast-title').text( possessiveForecast(foreDataDaily[0].name) );
					resizeText(foreDataDaily[0].detailedForecast);
				},
				text2() {
					$('#forecast-title').text( possessiveForecast(foreDataDaily[1].name) );		
					resizeText(foreDataDaily[1].detailedForecast);
				},

			    fiveday() {
					var newtile, weekend, icons;
					
					$('#forecast-title').text("5 DAY FORECAST");
					$('#forecast-tiles').empty();
					
					// New loop for Open-Meteo daily data (up to 5 days)
					for (var i = 0; i < 5 && i < foreDataDaily.length; i++) {
						const dayData = foreDataDaily[i];
						weekend = (dateFns.isWeekend(dayData.startTime) ? ' weekend' : '');
						newtile = $("<div class='forecast-tile daily" + weekend + "'></div>");
						
						$("<div class='header'></div>").appendTo(newtile).text(dateFns.format(dayData.startTime, 'ddd').toUpperCase());
						
						icons = dayData.icon; // Already a URL string from the adapter
						for (x = icons.length - 1; x >= 0; x--) {
							$("<img class='icon' src=''/>").appendTo(newtile).attr('src', icons[x]);	
						}
						
						$("<div class='high'></div>").appendTo(newtile).text(dayData.temperature);
						// The adapter in location.js provides 'temperatureLow'
						$("<div class='low'></div>").appendTo(newtile).text(dayData.temperatureLow); 
						
						$('#forecast-tiles').append(newtile);				
					}
					
					$('#forecast-tiles').css('display', 'flex');					
				},

			    hourly() {
					var newtile, icons, sizer, highbar,
					    indexes = calcHourlyReport(foreDataHourly),
						data, label, temps=[];
					
					$('#forecast-title').text( buildHourlyHeaderTitle(foreDataHourly[indexes[0]].startTime) );
					$('#forecast-tiles').empty();
					
					for (var i of indexes) {
						data = foreDataHourly[i];
						
						newtile = $("<div class='forecast-tile hourly'></div>");
						sizer   = $("<div class='width-sizer'></div>").appendTo(newtile);
						
						icons = mapNWSicons(data.icon);
						for (var x=icons.length-1; x>=0; x--){
							$("<img class='icon' src=''/>") .appendTo(sizer) .attr('src', icons[x]);	
						}
						
						$("<div class='footer'></div>") .appendTo(newtile) .text(buildHourlyTimeTitle(data.startTime));
						
						highbar = $("<div class='hourly-high'></div>") .appendTo(sizer);
						
						$("<div class='high'></div>") .appendTo(highbar) .text(data.temperature);
						temps.push(data.temperature);
						
						$("<div class='temp-bar'></div>") .appendTo(highbar);
						
						$('#forecast-tiles').append(newtile);				
					}
					
					$('#forecast-tiles').css('display','flex');
					
					// animate grow and show temp
					var min = Math.min(...temps),  // 54
						max = Math.max(...temps),  // 73
						range = (max-min),
						prange = (100-78), // percent range for bar height
						temp, value;  
					$('.forecast-tile').each(function(){
						temp = $(this).find('.high').first().text();
						value = ((temp-min)/range) * prange + 78;  // find percentage of range and translate to percent and add that to the starting css % height number
						$(this).find('.hourly-high').animate({height:value+"%"}, 1500,function(){
							$(this).find('.high').fadeTo('slow', 1);
						});											  
					})
				},		

				dummy(){}
	
			},
			keys = Object.keys(displays);
		
		displays[ keys[idx] ]();

		// increment the pointer
		idx = (++idx===keys.length ? 0 : idx);

		setTimeout(function(){ displayForecast(idx) }, 15000); // 15 second increment loop

	}
	
	function resizeText(text){
		var s = 38,
		$test = $('<div style="position:absolute;top:100%;"></div>') .appendTo('#forecast-text') .css('font-size', s + 'px') .html(text);
		$test.width($('#forecast-text').width() );
		//setTimeout(function() {
			while ($test.outerHeight(true) >= ($('#forecast-text').height()) ) {
				s -= 1;
				$test.css('font-size', s + 'px');
			}
			$('#forecast-text div') .text(text) .css('font-size', s + 'px');
			$test.remove();
			$('#forecast-tiles').hide();
		//},100);  // delay is a workaround for Interstate font not updating display 
	}	
	
	function possessiveForecast(text){		
		return text + (text.toUpperCase() != 'OVERNIGHT' ? "'S" : '') + ' FORECAST';		
	}

	
} // end Loops class


function buildHourlyHeaderTitle(time) {
	var today = new Date(), 
		tomorrow = dateFns.addDays(today, 1),
		sforecast = "'s Forecast";
	
	// title based on the first hour reported
	switch (dateFns.getHours(time)) {
			
	case 6: // 6 - Nextday's Forecast / Today's Forecast
		// if 6am today
		if (dateFns.isToday(time)) {
			return dateFns.format(today, 'dddd') + sforecast;	
		}
	case 0: // 0 - Nextday's Forecast
		return dateFns.format(tomorrow, 'dddd') + sforecast;

	case 12:
		return 'This Afternoon';

	case 15:
		return "Today's Forecast";

	case 17:
		return "Tonight's Forecast";

	case 20:
		return dateFns.format(today, 'ddd') + ' Night/' + dateFns.format(tomorrow, 'ddd');
	
	}

}


function buildHourlyTimeTitle(time){
	var hour=dateFns.getHours(time);
	
	if (hour===0) {
		return 'midnight';
	} else if (hour===12){
		return 'noon';
	}
	
	return dateFns.format(time,'h a');
}


// finds the intervals to report on the hourly forecast
function calcHourlyReport(data) {
	var ret = [],
		targets = [0, 6, 12, 15, 17, 20],   // hours that we report
		current = dateFns.getHours(new Date()),
		now = new Date(),
		//firsthour = targets[ getNextHighestIndex(targets, current) ],
		start,
		hour, i=0;
	
	switch (true) {
		case (current < 3):
			start = 6;
		case (current < 9):
			start = 12; break;
		case (current < 12):
			start = 15; break;
		case (current < 15):
			start = 17; break;
		case (current < 17):
			start = 20; break;
		case (current < 20):
			start = 0; break;
		default: 
			start = 6;			
	}
		
	while(ret.length<4){
			
		// hour must be equal or greater than current
		hour = dateFns.getHours( data[i].startTime );
		if ( dateFns.isAfter(data[i].startTime, now) && (hour==start || ret.length>0) )  {
			
			if ( targets.indexOf(hour)>=0 ) { // it is in our target list so record its index
				ret.push(i);
			}
			
		}
		i++;
	}
	return ret;
}

function mapNWSicons(url){
	var map = {
			skc:[26,25],
			few:[28,27],
			sct:[24,23],
			bkn:[22,21],
			ovc:[20,20],
			wind_skc:[26,25,47],
			wind_few:[28,27,47],
			wind_sct:[24,23,47],
			wind_bkn:[22,21,47],
			wind_ovc:[20,20,47],
			snow:[10,10],
			rain_snow:[2,2],
			rain_sleet:[38,38],
			snow_sleet:[3,3],
			fzra:[6,6],
			rain_fzra:[6,6],
			snow_fzra:[44,44],
			sleet:[13,13],
			rain:[8,8],
			rain_showers:[7,7],
			rain_showers_hi:[5,5],
			tsra:[1,1],
			tsra_sct:[29,37],
			tsra_hi:[29,37],
			tornado:[46,46],
			hurr_warn:[45,45],
			hurr_watch:[45,45],
			ts_warn:[45,45],
			ts_watch:[45,45],
			ts_hurr_warn:[45,45],
			dust:[14,14],
			smoke:[16,16],
			haze:[16,16],
			hot:[16,16],
			cold:[42,42],
			blizzard:[11,11],
			fog:[15,15]
	},
	matches = url.match(/icons\/land\/(day|night)\/([a-z_]*)\/?([a-z_]*)/),  // day or night followed by one or more condition codes
	idx = {day:0, night:1}[matches[1]], 
	ret=[], match;
	
	for (i=2; i<matches.length; i++){
		
		if (matches[i]) {
			match = map[ matches[i] ];
		
			ret.push( match[idx] );

			// some icons are 2 layered 
			if (match.length>2) {
				ret.push( match[2] );
			}
		}
	}
	
	// place word icons last so they render on top
	if (ret.length>1 && [15,47,41,42, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 20, 31, 33, 34, 38, 39, 40, 44].indexOf( ret[1] )>-1) {
		ret.swap(0,1);
	}
	
	return ret.map(function(num){
		return 'images/icons/' + ('0'+num).slice(-2) + '.png';
	});

}