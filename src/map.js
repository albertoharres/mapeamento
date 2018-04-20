import mapystyle from './json/map-style.json'
import services from './services.js'
import Geolocation from './geolocation.js'
import Ponto from './Ponto.js'

import _ from 'lodash';
import $ from 'jquery';

const EventEmitter = require('events');

class Map extends EventEmitter {
	constructor(DB){
		super();
		// classes
		this.DB = DB;
		this.geolocation = new Geolocation();
		// objects
		this.map = null
		this.curPonto = null;
		// state 
		this.isSet = false
		// init!
		this.init();
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
		// on DB ready
		this.DB.on('loaded',()=>{
			// check if points are not set and map is loaded
			this.geolocation.get();
			if( this.map != null && !this.isSet ){
				this.loadCriaturas(this.DB.criaturas.data);
			}
		 })

		 // on new point from DB
		 this.DB.on('newPonto', function(criatura_id){
			console.log('novo ponto');
			if( self.map != null){							
				self.drawCriatura(self.DB.data[criatura_id], criatura_id)			
			}
		 })

		 // on latlng point found!!!
		 this.geolocation.on('found', function(loc){

		 })

		 this.DB.criaturas.on('update', function(criatura){
		//	let pontos = criatura.pontos;
		 })
	}

	setMap(){
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 19,
		  center: {lat:0, lng:0},
		  styles: mapystyle,
		  streetViewControl: false,
		  fullscreenControl: false
        });
		// draw points
		// check if points are not set and DB is loaded
		if(!this.isSet && this.DB.isLoaded){
			this.drawAllPoints(this.DB.data);
		}
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

	drawShape(coordinates, criatura){

		var color = criatura.color;

		for(var i in coordinates) {
			this.drawPoint(coordinates[i], criatura.id)
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
		if(_pontos.length > 0 ) this.drawShape(_pontos, criatura);
	}
}

export default Map