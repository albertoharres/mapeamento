import _ from 'lodash';
import $ from 'jquery';

var leaflet = require('leaflet')

var Map = {
	isSet: false,
	el: $(''),
	map: null, 
	DB: null, 
	curLoc: {lat:0, lng: 0},
	geoLoc: null,
	init(DB){
		console.log('init!', DB)	
		// set DB 
		this.DB = DB;			
		
		var googlemaps = '<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCFacNeg2lg0_TPHTvl3mXr5_tEWtDIbFQ&callback=window.googlemapsLoaded"></script>'
		$('body').append(googlemaps);

		this.addEvents();
	},

	setMap(){
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 19,
          center: this.curLoc
        });        
		this.getPosition();			

		// draw points
		// check if points are not set and DB is loaded
		if(!this.isSet && this.DB.initialDataLoaded){
			this.drawAllPoints(this.DB.data);
		}
		
		// add point on click 'test'
		google.maps.event.addListener(this.map, 'click', function(event) {
			self.addPoint(event.latLng);
		 });	
	},
	
	addEvents(){
		var self = this;				 
		this.DB.on('loaded',()=>{		
			// check if points are not set and map is loaded	
			if( this.map != null && !this.isSet ){
				this.drawAllPoints(this.DB.data);
			}
		 })

		 this.DB.on('newPonto', function(criatura_id){
			if( this.map != null){
				self.drawCriatura(self.DB.data[criatura_id], criatura_id)			
			}
		 })
	},

	setInitialPosition(loc){
		var latlng = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude);
		var loc = {lat: loc.coords.latitude, lng: loc.coords.longitude};
		// center starting point on screen 
		this.map.panTo(latlng);
		// store cur pos
		this.curLoc = loc;
		// save point to database
		this.DB.saveUser();
		this.savePoint(loc);
		// listen to position change
		// 
		this.getLocationUpdate();
	},

	addPoint(latlng){
		this.drawPoint(latlng);
		var loc = { 'lat': latlng.lat(), 'lng': latlng.lng() };
		this.savePoint(loc);
	},	

	drawPoint(latlng, criatura_id = window['criatura']['id]']){

		var color = this.DB.data[criatura_id]['color'] || window['criatura']['color'];

		var marker = new google.maps.Marker({
			position: latlng,
			map: this.map,
			title: "Hello World!",
			visible: true,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 1,
				fillColor: color,
				strokeColor: color,
				fillOpacity: 1
			},
		});	
	},

	drawShape(coordinates, criatura_id){
		console.log('coordinates', coordinates)

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
	},

	drawAllPoints(grouped){		

		this.isSet = true;
		
		for(var i in grouped){
			this.drawCriatura(grouped[i], i);		
		}
	},

	drawCriatura(criatura, criatura_id){
		var _pontos = [];
		for(var i in criatura.pontos){
			_pontos.push(criatura.pontos[i].latlng);
		}
		if(_pontos.length > 1 ) this.drawShape(_pontos, criatura_id);
	},

	savePoint(loc){
		this.DB.savePoint(loc)
	},

	getPosition(){
		var self = this;
		console.log('get position');
		if(!navigator.geolocation) { 
			console.log('Votre navigateur ne prend malheureusement pas en charge la géolocalisation.');
			return;
		}
		var options = {
			timeout: 50000, // 5 seconds
			maximumAge: 60*6000000 // one hour
		};
		
		navigator.geolocation.getCurrentPosition(function(loc){
			self.setInitialPosition(loc)
		}, error, options);		
	},

	locationUpdate(loc){
		// check if location is the same as last one
		console.log(loc, this.curLoc)
	},	

	getLocationUpdate(){
		var self = this;
		if(navigator.geolocation){
		   // timeout at 60000 milliseconds (60 seconds)
		   var options = {timeout:60000};
		   this.geoLoc = navigator.geolocation;
		   var watchID = this.geoLoc.watchPosition(function(){
			   self.locationUpdate
			}, error, options);
		} else {
		   alert("Sorry, browser does not support geolocation!");
		}		
	 }
}

function error(err) {
	console.warn('ERROR(' + err.code + '): ' + err.message);
  };

export default Map