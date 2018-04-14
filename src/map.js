import _ from 'lodash';
import $ from 'jquery';

var leaflet = require('leaflet')

var Map = {
	el: $(''),
	map: null, 
	DB: null, 
	curLoc: {lat:0, lng: 0},
	geoLoc: null,
	init(DB){
		console.log('init!', DB)	
		// set DB 
		this.DB = DB;			
		
		this.setMap();

		this.addEvents();
	},

	setMap(){
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 19,
          center: this.curLoc
        });        
		this.getPosition();				
		//this.getPointsFromDB();
	},
	
	addEvents(){
		var self = this;
		// add point on click 'test'
		google.maps.event.addListener(this.map, 'click', function(event) {
			self.addPoint(event.latLng);
		 });	
		 
		 this.DB.on('loaded', function(){
			console.log('loaded!', self.DB.data);
			self.drawAllPoints(self.DB.data)			
		 })

		 this.DB.on('newPonto', function(criatura_id){
			self.drawCriatura(self.DB.data[criatura_id], criatura_id)			
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
		this.savePoint(loc);
		this.DB.saveUser();
		// listen to position change
		// 
		this.getLocationUpdate();
	},

	addPoint(latlng){
		this.drawPoint(latlng);
		var loc = { 'lat': latlng.lat(), 'lng': latlng.lng() };
		this.savePoint(loc);
	},	

	drawPoint(latlng){
		var marker = new google.maps.Marker({
			position: latlng,
			map: this.map,
			title:"Hello World!",
			visible: true,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 1
			},
		});	
	},

	drawShape(coordinates, criatura_id){
		console.log('coordinates', coordinates)

		var color = this.DB.data[criatura_id]['color'] || window['criatura']['color'];
		//console.log(color);

		for(var i in coordinates) {
			this.drawPoint(coordinates[i])
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
		var options = {timeout:50000};
		
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