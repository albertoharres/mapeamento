import mapystyle from './json/map-style.json'
import services from './services.js'
import Geolocation from './geolocation.js'
import Ponto from './ponto.js'
import Percurso from './percurso.js'

import _ from 'lodash';
import $ from 'jquery';

const EventEmitter = require('events');

class Mapeamento extends EventEmitter {
	constructor(DB){
		super();
		// state 
		this.isSet = false
		this.hasFoundInitialPosition = false; 
		// classes
		this.DB = DB;
		this.geolocation = new Geolocation();
		// objects
		this.map = null
		// add google maps to html
		var googlemaps = '<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCFacNeg2lg0_TPHTvl3mXr5_tEWtDIbFQ&callback=window.googlemapsLoaded"></script>'
		$('body').append(googlemaps);
		// listen to DB events
		this.bounds = {
			sw: {lat: 999999, lng: 999999},
			ne: {lat: -999999, lng: -999999}
		}
		this.addEvents();
	}

	addEvents(){
		var self = this;						
		// on DB ready
		this.DB.on('loaded',()=>{
			
			this.geolocation.watch();
			// check if points are not set and map is loaded
			if( this.map != null && !this.isSet ){									
				console.log( this.DB.criaturas.data.eu.pontos, 'data ball')
				for( let i in this.DB.criaturas.data ){					
					this.drawCriatura(this.DB.criaturas.data[i]);
				}
			}
		 })
		 
		 this.DB.criaturas.on('newPercurso', function(percurso){
			console.log('newPercurso', percurso)
			self.drawPercurso(percurso);
		 });

		 // on latlng point found!!!
		 this.geolocation.on('found', function(loc){
			console.log('point found', loc);
			self.addPosition(loc)
			// self.setPosition(loc);
		 })
	}

	setMap(){		
		var options = {
			zoom: 19,
			center: {lat:-22.970722, lng:-43.182365},
			styles: mapystyle,
			streetViewControl: false,
			fullscreenControl: false
		}
        this.map = new google.maps.Map(document.getElementById('map'), options);
		window['map'] = this.map;
	}

	addPosition(latlng){		
		console.log('eu', this.DB.criaturas.data.eu)
		var timestamp = new Date().getTime();
		// criatura , posição, canal, tempo
		var ponto = new Ponto(this.DB.criaturas.data.eu, latlng, this.DB.canal, accuracy, timestamp)
		this.map.panTo(ponto.getLatLng());
		if(!this.hasFoundInitialPosition) {
			this.hasFoundInitialPosition = true;
		}
		this.DB.pontos.save(ponto)
	}

	drawCriatura(criatura){
		for(var j in criatura.pontos){
			if(criatura.pontos[j].latlng){
				let l = criatura.pontos[j].latlng;
				this.bounds.sw.lat = Math.min(this.bounds.sw.lat, l.lat)
				this.bounds.sw.lng = Math.min(this.bounds.sw.lng, l.lng)
				this.bounds.ne.lat = Math.max(this.bounds.ne.lat, l.lat)
				this.bounds.ne.lng = Math.max(this.bounds.ne.lng, l.lng)														
			}
		}
		criatura.setPercursos();
		criatura.draw(this.map);
	}

	drawPercurso(percurso){
		percurso.draw(this.map);
	}
	
}

export default Mapeamento