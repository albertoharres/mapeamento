import services from './services.js'
import $ from 'jquery';

const EventEmitter = require('events');

class Geolocation extends EventEmitter {
    constructor(){
        super();        
        this.list = []
        this.curLoc = {'lat': 0, 'lng': 0}; 
        this.isMobile = services.checkMobile();
        // debug
        this.debug = true;
    }
    get(){
		var self = this;
		this.print('get position');
		if(!navigator.geolocation) { 
			this.print('Votre navigateur ne prend malheureusement pas en charge la géolocalisation.');
			return;
		}
		var options = {
			timeout: 600000, // 50 seconds
			maximumAge: 600000, // one hour
			enableHighAccuracy: true
		};
		
		navigator.geolocation.getCurrentPosition(function(loc){
			self.onFound(loc)
		}, services.error, options);		
	}
	watch(interval = 15000){
		var self = this;
		function watch(){		
			navigator.geolocation.getAccurateCurrentPosition(function(loc){
                if(loc == undefined) return
			
                // $('#debug').html(JSON.stringify(loc.coords.accuracy))
                if(loc.coords.accuracy > 21 && self.isMobile) { 
                    self.print('low accuracy')   
                   // return; 
                }
				if(self.curLoc.lat == loc.coords.latitude && self.curLoc.lng == loc.coords.longitude){
                    self.print('same position!')
				} else {                    
                    self.print('new position!');
					self.onFound(loc);
				}
			}, services.error, function(a){console.log('fetching position...')}, {desiredAccuracy: 20, maxWait:interval});
        }        
        watch(); 
		setInterval(function(){ 
			watch(); 
		}, interval);
    }
    
    onFound(loc){
        this.curLoc = {'lat': loc.coords.latitude, 'lng':  loc.coords.longitude};
        this.emit('found', loc);
    }    

    print(str){
        if(!this.debug) return 
        console.log('Geolocation:', str)
    }
}

navigator.geolocation.getAccurateCurrentPosition = function (geolocationSuccess, geolocationError, geoprogress, options) {
    var lastCheckedPosition,
        locationEventCount = 0,
        watchID,
        timerID;
 
    options = options || {};

    var checkLocation = function (position) {
        lastCheckedPosition = position;
        locationEventCount = locationEventCount + 1;
        // We ignore the first event unless it's the only one received because some devices seem to send a cached
		// location even when maxaimumAge is set to zero
		
		
        if ((position.coords.accuracy <= options.desiredAccuracy) && (locationEventCount > 1)) {
            clearTimeout(timerID);
            navigator.geolocation.clearWatch(watchID);
            foundPosition(position);
        } else {
            geoprogress(position);
        }
    };

    var stopTrying = function () {
        navigator.geolocation.clearWatch(watchID);
        foundPosition(lastCheckedPosition);
    };

    var onError = function (error) {
        clearTimeout(timerID);
        navigator.geolocation.clearWatch(watchID);
        geolocationError(error);
    };

    var foundPosition = function (position) {
        geolocationSuccess(position);
    };

    if (!options.maxWait)            options.maxWait = 10000; // Default 10 seconds
    if (!options.desiredAccuracy)    options.desiredAccuracy = 20; // Default 20 meters
    if (!options.timeout)            options.timeout = options.maxWait; // Default to maxWait

    options.maximumAge = 0; // Force current locations only
    options.enableHighAccuracy = true; // Force high accuracy (otherwise, why are you using this function?)

    watchID = navigator.geolocation.watchPosition(checkLocation, onError, options);
    timerID = setTimeout(stopTrying, options.maxWait); // Set a timeout that will abandon the location loop
};


export default Geolocation