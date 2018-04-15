import services from './services.js'
import _ from 'lodash';
import $ from 'jquery';

const EventEmitter = require('events');

class Map extends EventEmitter {
	constructor(DB){
		super();
		// database is equal to DB object
		this.DB = DB;
		// have the points been draw ?
		isSet = false
		// map variable
		this.map = null
		// store current position		
		this.curPosition = {
			latlng: {lat:0,lng:0}
		}
		// store marker that displays current position
		this.curPositionMarker = null;	
		// start to load google maps
		this.init();
	}

	init(){
		// add google maps to html
		var googlemaps = '<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCFacNeg2lg0_TPHTvl3mXr5_tEWtDIbFQ&callback=window.googlemapsLoaded"></script>'
		$('body').append(googlemaps);
		// listen to DB events		
		this.getPosition();	
		this.addEvents();
	}
	
	addEvents(){
		var self = this;		
		// listen to DB events
		this.DB.on('loaded',()=>{		
			// check if points are not set and map is loaded	
			if( this.map != null && !this.isSet ){
				this.drawAllPoints(this.DB.data);
			}
		 })

		 this.DB.on('newPonto', function(criatura_id){
			console.log('novo ponto');
			if( self.map != null){
				self.drawCriatura(self.DB.data[criatura_id], criatura_id)			
			}
		 })
	}

	setMap(){
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 19,
          center: this.curPosition.latlng
        });        		
		// draw points
		// check if points are not set and DB is loaded
		if(!this.isSet && this.DB.initialDataLoaded){
			this.drawAllPoints(this.DB.data);
		}
		
		// add point on click 'test'
		// simulate position change
		var self = this;
		google.maps.event.addListener(this.map, 'click', function(event) {
			self.addPoint(event.latLng);
		 });	
	}
	/*
		POSITION 
	*/
	setInitialPosition(loc){		
		// set position
		this.setPosition(loc);
		// start watching for position change	
		this.watchPosition();
	}

	setPosition(_loc){		
		var loc = {lat: _loc.coords.latitude, lng: _loc.coords.longitude};
		// center starting point on screen
		if(this.map != null){
			var latlng = new google.maps.LatLng(_loc.coords.latitude, _loc.coords.longitude);
			this.map.panTo(latlng);
		}
		this.curPosition = this.DB.savePoint(loc);
		this.drawMyPosition(this.curPosition);
	}

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
		if(navigator.geolocation){
		   // timeout at 60000 milliseconds (60 seconds)
		   var options = {
			   timeout:60000,
			   maximumAge: 60000,
			   enableHighAccuracy: true
			};
			var geoLoc = navigator.geolocation;
		    geoLoc.watchPosition(function(loc){
			   if(self.curPosition.latlng.lat == loc.coords.latitude && self.curPosition.latlng.lng == loc.coords.longitude){
					//console.log('same position!')
			   } else {
				   console.log('new position!');
				   self.setPosition(loc)
			   }
			}, error, options);
		} else {
		   alert("Sorry, browser does not support geolocation!");
		}		
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
		var color = point.color;
		var marker = new google.maps.Marker({
			map: this.map,
			position: point.latlng,
			title: "Hello World!",
			visible: true,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 1.5,
				fillColor: point.color,
				strokeColor: point.color,
				fillOpacity: 1
			},
		});	
	}

	drawMyPosition(point){
		var color = point.color;
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
		// console.log('coordinates', coordinates)

		var color = this.DB.data[criatura_id]['color'] || window['criatura']['color'];
		//console.log(color);

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

	drawAllPoints(grouped){		

		this.isSet = true;
		
		for(var i in grouped){
			this.drawCriatura(grouped[i], i);		
		}
	}

	drawCriatura(criatura, criatura_id){
		var _pontos = [];
		for(var i in criatura.pontos){
			_pontos.push(criatura.pontos[i].latlng);
		}
		if(_pontos.length > 1 ) this.drawShape(_pontos, criatura_id);
	}
}

export default Map