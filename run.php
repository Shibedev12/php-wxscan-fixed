<!DOCTYPE html>

<html>


<?php

$cache = 1;
$cacheStr = '?psy8a7z9m';

if ($cache==0) $cacheStr = '?' . date('l jS \of F Y h:i:s A');

?>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<title>Weatherscan</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css" integrity="sha512-M2wvCLH6DSRazYeZRIm1JnYyh22purTM+FDB5CsyxtQJYeKq83arPe5wgbNmcFXGqiSH2XR8dT/fJISVA1r/zQ==" crossorigin=""/>
  
	<link rel="stylesheet" href="js/leaflet/timedimension/leaflet.timedimension.control.min.css" />  
	<link rel="stylesheet" href="css/style.css<?=$cacheStr ?>" />  
	<link rel="stylesheet" href="css/slides.css<?=$cacheStr ?>" />  

</head>


<body>
	
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
	
	<script type="text/javascript" src="js/jplayer/jquery.jplayer.min.js"></script>
	
	<script src="https://unpkg.com/leaflet@1.2.0/dist/leaflet.js" integrity="sha512-lInM/apFSqyy1o6s89K4iQUKg6ppXEgsVxT35HbzUupEVRh2Eu9Wdl4tHj7dZO0s1uvplcYGmt3498TtHq+log==" crossorigin=""></script>
	<!--script type="text/javascript" src="https://unpkg.com/leaflet.nontiledlayer/dist/NonTiledLayer.js"></script-->
	<script type="text/javascript" src="js/leaflet/NonTiledLayer.src.js"></script>	
	<script type="text/javascript" src="js/leaflet/iso8601.min.js"></script>	
	<script type="text/javascript" src="js/leaflet/timedimension/leaflet.timedimension.min.js"></script>
	
	<script src="http://cdn.date-fns.org/v2.0.0-alpha0/date_fns.min.js"></script>
	<script src="https://cdn.jsdelivr.net/npm/jquery.marquee@1.5.0/jquery.marquee.min.js" type="text/javascript"></script>	
	
	<script type="text/javascript" src="js/utils.js<?=$cacheStr ?>"></script>
	<script type="text/javascript" src="js/radar.js<?=$cacheStr ?>"></script>
	<script type="text/javascript" src="js/audio.js<?=$cacheStr ?>"></script>
	<script type="text/javascript" src="js/groupull.js<?=$cacheStr ?>"></script>
	<script type="text/javascript" src="js/data-manager.js<?=$cacheStr ?>"></script>
	<script type="text/javascript" src="js/location.js<?=$cacheStr ?>"></script>
	<script type="text/javascript" src="js/loops.js<?=$cacheStr ?>"></script>
	<script type="text/javascript" src="js/slides-loop.js<?=$cacheStr ?>"></script>
	<script type="text/javascript" src="js/weather.js<?=$cacheStr ?>"></script>
	<script type="text/javascript" src="js/main.js<?=$cacheStr ?>"></script>
	
	<div id="main" class="container">
		
		<img id="template" src="images/template-4k.jpg" />			

		<div id="info-slides-container">
		
			<div id="info-slides-header">
				<div class="hscroller">
					<span class="city radar current">LOCAL RADAR</span>
				</div>
			</div>
			
			<div id='info-slide-container'>

				
				<!-- CURRENT CONDITIONS AND FORECAST-->
				<div class="info-slide city-info-slide" style="display:none">			
					<div class="info-subheader">
						<span id="subhead-title"></span><span id="subhead-city"></span>
					</div>
					<div class='blue curve left'></div>
					<div class='yellow curve left'></div>
					<div class='yellow curve right'></div>
					<div class='white curve right'></div>
					
					<div class='info-slide-content city-info' style="display:none">

						<div class='frost-pane left'>
							<div class='labels'></div>
							<div class='data'></div>
						</div>
						<div class='frost-pane right'>
							<div class='icon'></div>
							<div class='conditions'></div>
							<div class='temp'></div>
						</div>

					</div>
					
					<div class='info-slide-content forecast' style="display:none">
						<div class='frost-pane'>
							<div class='title'></div>
							<div class='content'></div>
						</div>											
					</div>			
				</div>			
				
			
				<!-- DOPPLER RADAR -->
				<div class="info-slide radar-slide">
					<div class="info-subheader">
						<span>Local Doppler Radar</span>
						<span class="radar-color-legend">Past 3 Hours<br>Light&nbsp;<img src="images/precip-legend.png" alt="Past 3 Hours" />&nbsp;Heavy</span>
					</div>
					<div id="radar-container" class="info-slide-content">
						<div id="radar-1" class="map"></div>
					</div>
				</div>								

			</div>
		</div>
		

		<div id="date-time">
			<div id="date"></div>
			<div id="time"></div>
		</div>
		
		<div id="city"></div>
		
		<div id="conditions-icon"></div>

		<div id="current-conditions">
			<div id="now">now</div>
			<div id="current-temp"></div>
			<div id="current-info"></div>
		</div>		
					
		<div id="minimap-title">PAST 3 HOURS</div>
		<div id="minimap"></div>
		<div id="logo-area"><img src="images/TEMP.png"/></div>
		
		<div id="forecast-shadow">
			<div id="forecast-header">
				<div id="forecast-city"></div><div id="forecast-title"></div>
			</div>
			<div id="forecast-text"><div>Retrieving forecast data...</div></div>
			<div id="forecast-tiles"></div>
		</div>
		
		
		<div id="marquee1" class="marquee">
			<div id="marquee-container">
				<div id="marquee-now"><span class="track-info"></span></div>
			</div>
		</div>
		<img id="arrow-img" src="images/now.png<?=$cacheStr ?>"/>
		
		<div id="marquee2" class="marquee">
		This is the original version of the WeatherScan simulator made by /u/AnonChickenWalker, a now deleted reddit user. It took some work to replace the outdated Yahoo Weather API with the OpenMetro API, but it was worth it. As the original version of the sim has not been updated in a blue moon, and AnonChickenWalker deleting his reddit, it is considered ABANDONWARE. GoldBlaze worked off of this code to create the version of the simulator we all fight over who owns today. The slides got broken in the process of fixing it, so enjoy an endless radar for now. When this restoration is done, it will be released under the WTFPL license, for everyone to use, build off of, and enjoy without any threating from GoldBlaze of legal action.
		</div>
					
	</div>

</body>
</html>
