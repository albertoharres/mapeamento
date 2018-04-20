import mapystyle from './json/map-style.json'
import services from './services.js'
import Geolocation from './geolocation.js'
import Ponto from './Ponto.js'

import _ from 'lodash';
import $ from 'jquery';

const EventEmitter = require('events');

class Mapeamento extends EventEmitter {
	constructor(DB){
		super();
		// state 
		this.isSet = false
		// classes
		this.DB = DB;
		this.geolocation = new Geolocation();
		// objects
		this.map = null
		// init!
		this.init();
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
			this.geolocation.get();
			// check if points are not set and map is loaded
			if( this.map != null && !this.isSet ){
				this.loadCriaturas(this.DB.criaturas.data);
			}
		 })

		 // on new point from DB
		 this.DB.on('newPonto', function(criatura_id){
			console.log('novo ponto');
			if( self.map != null){							
				self.drawCriatura(self.DB.data[criatura_id], criatura_id);
			}
		 })

		 // on latlng point found!!!
		 this.geolocation.on('found', function(loc){
			self.setPosition(loc);
		 })

		//this.DB.criaturas.on('update', function(criatura){
			// let pontos = criatura.pontos;
		//})
	}

	setMap(){
        this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: 19,
		  center: {lat:0, lng:0},
		  styles: mapystyle,
		  streetViewControl: false,
		  fullscreenControl: false
		});
		
		window['map'] = this.map;
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


	drawCriatura(criatura, criatura_id){
		var _pontos = [];
		for(var i in criatura.pontos){
			_pontos.push(criatura.pontos[i].latlng);
		}
		if(_pontos.length > 0 ) this.drawShape(_pontos, criatura);
	}
}

export default Map