import mapystyle from './json/map-style.json';
import services from './services.js'
import Ponto from './Ponto.js';

import _ from 'lodash';
import $ from 'jquery';

const EventEmitter = require('events');

class Map extends EventEmitter {
	constructor(DB){
		super();
		this.DB = DB;
		this.map = null
		this.isSet = false
		this.curPonto = null;
		this.curLatLng = {lat: 0, lng: 0};
		this.init();
		this.color = services.random_rgba();
	}

	init(){
		// add google maps to html
		var googlemaps = '<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCFacNeg2lg0_TPHTvl3mXr5_tEWtDIbFQ&callback=window.googlemapsLoaded"></script>'
		$('body').append(googlemaps);
		// listen to DB events			
		this.addEvents();
	}
	
	addEvents(){
		var self = this;		
		// listen to DB events
		this.DB.on('loaded',()=>{		
			// check if points are not set and map is loaded
			this.getPosition();
			if( this.map != null && !this.isSet ){
				this.drawAllPoints(this.DB.criaturas.data);
			}
		 })

		 this.DB.on('newPonto', function(criatura_id){
			console.log('novo ponto');
			if( self.map != null){
				self.drawCriatura(self.DB.data[criatura_id], criatura_id)			
			}
		 })

		 this.DB.criaturas.on('update', function(criatura){
		//	let pontos = criatura.pontos;
		 })
	}

	setMap(){
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 19,
		  center: {lat:0, lng:0},
		  styles: mapystyle
        });        		
		// draw points
		// check if points are not set and DB is loaded
		if(!this.isSet && this.DB.isLoaded){
			this.drawAllPoints(this.DB.data);
		}
		// add point on click 'test'
		// simulate position change
		var self = this;
		google.maps.event.addListener(this.map, 'click', function(event) {
		//	self.addPoint(event.latLng);
		});	
	}
	/*
		POSITION 
	*/
	setInitialPosition(latlng){		
		// set position		
		
		console.log('eu', this.DB.criaturas.data.eu)
		this.curLatLng = latlng

		var ponto = new Ponto(this.DB.criaturas.data.eu, latlng)
		this.setPonto(ponto);
		// start watching for position change	
		this.watchPosition();
	}

	setPosition(latlng){		
		// set position		
		console.log('eu', this.DB.criaturas.data.eu)
		
		var ponto = new Ponto(this.DB.criaturas.data.eu, latlng)
		this.setPonto(ponto);
		// start watching for position change	
	}
	
	setPonto(ponto){
		this.DB.pontos.save(ponto);
		this.curPonto = ponto;
		this.curLatLng = this.curPonto.latlng;
		console.log('position', this.curPonto.latlng)
		this.map.panTo(this.curPonto.getLatLng())
	}

	/*
	setPosition(_loc){		
		var loc = {lat: _loc.coords.latitude, lng: _loc.coords.longitude};
		// center starting point on screen
		if(this.map != null){
			var latlng = new google.maps.LatLng(_loc.coords.latitude, _loc.coords.longitude);
			this.map.panTo(latlng);
		}
		this.curPosition = this.DB.savePoint(loc);
		this.drawMyPosition(this.curPosition);
	}*/

	getPosition(){
		var self = this;
		console.log('get position');
		if(!navigator.geolocation) { 
			console.log('Votre navigateur ne prend malheureusement pas en charge la géolocalisation.');
			return;
		}
		var options = {
			timeout: 600000, // 50 seconds
			maximumAge: 600000, // one hour
			enableHighAccuracy: true
		};
		
		navigator.geolocation.getCurrentPosition(function(loc){
			self.setInitialPosition(loc)
		}, services.error, options);		
	}	

	watchPosition(){
		var self = this;		
		function watch(){		
			console.log('watch');
			navigator.geolocation.getAccurateCurrentPosition(function(loc){
				console.log(JSON.stringify(loc))
				$('#debug').html(JSON.stringify(loc.coords.accuracy))
				if(self.curLatLng.lat == loc.coords.latitude && self.curLatLng.lng == loc.coords.longitude){
					console.log('same position!')
				} else {
					console.log('new position!');
					self.setPosition(loc)
				}
			}, services.error, function(a){console.log('fetching position...')}, {desiredAccuracy: 20, maxWait:15000});
		}
		watch(); 
		setInterval(function(){ 
			watch(); 
		}, 15000);
		/*
		if(navigator.geolocation){
		   // timeout at 60000 milliseconds (60 seconds)
		   var options = {
			   timeout:60000,
			   maximumAge: 60000,
			   enableHighAccuracy: true
			};
			var geoLoc = navigator.geolocation;
		    geoLoc.watchPosition(function(loc){
			   if(self.curLatLng.lat == loc.coords.latitude && self.curLatLng.lng == loc.coords.longitude){
					console.log('same position!')
			   } else {
				   console.log('new position!');
				   self.setPosition(loc)
			   }
			}, services.error, options);
		} else {
		   alert("Sorry, browser does not support geolocation!");
		}
		*/
	}

	addPoint(latlng){		
		var loc = { 'lat': latlng.lat(), 'lng': latlng.lng() };
		var point = this.DB.savePoint(loc);
		this.drawPoint(point);
	}
	/*
		DRAW 
	*/
	drawPoint(point){
		var color = this.color;
		var marker = new google.maps.Marker({
			map: this.map,
			position: point.latlng,
			title: "Hello World!",
			visible: true,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 5,
				fillColor: point.color,
				strokeColor: point.color,
				fillOpacity: 1
			},
		});	
	}

	drawMyPosition(point){
		var color = this.color;
		if(this.curPositionMarker == null){
			this.curPositionMarker = new google.maps.Marker({
				map: this.map,
				position: point.latlng,
				title: "Hello World!",
				visible: true,
				optimized: false,
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 4,
					fillColor: point.color,
					strokeColor: point.color,
					fillOpacity: 1
				},
			});	
		} else {
			this.curPositionMarker.setPosition(point.latlng);
		}
	}

	drawShape(coordinates, criatura_id){

		var color = this.color;

		for(var i in coordinates) {
			this.drawPoint(coordinates[i], criatura_id)
		}
		var shape = new google.maps.Polyline({
			path: coordinates,
			strokeColor: color,
			strokeOpacity: 1.0,
			strokeWeight: 2
		  });
		  shape.setMap(this.map);
	}

	drawAllPoints(data){
		console.log('draw all points', data)
		this.isSet = true;
		
		for(var i in data){
			this.drawCriatura(data[i], i);		
		}
	}

	drawCriatura(criatura, criatura_id){
		console.log('draw criatura')
		var _pontos = [];
		for(var i in criatura.pontos){
			_pontos.push(criatura.pontos[i].latlng);
		}
		if(_pontos.length > 0 ) this.drawShape(_pontos, criatura_id);
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
			console.log('accuracy', position.coords.accuracy, options.desiredAccuracy)
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

export default Map