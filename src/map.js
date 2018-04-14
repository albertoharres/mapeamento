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
		google.maps.event.addListener(map, 'click', function(event) {
			self.addPoint(event.latLng);
		 });	
		 
		 this.DB.on('newPonto', function(ponto){
			console.log('novo ponto', ponto); 
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
			map: map,
			title:"Hello World!",
      		visible: false
		});	
	},

	drawShape(coordinates, criatura_id){
		var shape = new google.maps.Polyline({
			path: coordinates,
			strokeColor: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
			strokeOpacity: 1.0,
			strokeWeight: 2
		  });
		  shape.setMap(map);
	},

	drawAllPoints(grouped){
		for(var i in grouped){
			drawShape(grouped[i], i);
		}
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