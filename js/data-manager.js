function DataManager(){
	var $this = $(this),
		that = this;
	
	var _locations = [];

	this.locations = _locations;	
	
	this.location = function(id) { // search by lat,long string or other unique id
		return _locations.find(x => `${x.lat},${x.long}` === id);
	}
	
	this.init = function (searchString) {
		_locations[0] = new Location();
		
		$(_locations[0])
			.on('refresh', function(){ $this.trigger('refresh') })
			.on('ready',   function(){ $this.trigger('ready:main'); })
			.on('init', initLocations);
            
		_locations[0].first = true;			
		_locations[0].init(searchString);
	};
		
	// This function is now simplified. It no longer fetches nearby stations.
    // It's triggered once the main location is initialized.
	function initLocations(){
        // The logic for finding other locations is now handled by groupull.js
        // and the main weather.js initialization. This manager now primarily
        // serves as a container for the location objects.
		
        // We can add other predefined locations here if needed, or just let
        // other parts of the app populate the manager.
        
        // This trigger now signifies that the primary location is fully ready
        // and other modules can proceed.
		$this.trigger('allinit');	
	}
}