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
		// classes
		this.DB = DB;
		this.geolocation = new Geolocation();
		// objects
		this.map = null
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
				for( let i in this.DB.criaturas.data ){
					this.drawPercursos(this.DB.criaturas.data[i]);
				}
				// draw existing points
			}
		 })
		 // on new point from DB
		 this.DB.on('newPonto', function(criatura_id){
			console.log('novo ponto');
			if( self.map != null){							
				console.log('novo ponto');
			}
		 })

		 this.DB.criaturas.on('update', function(criatura){
			//console.log('criatura update', criatura)
			// draw new points
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
		// set position
		console.log('eu', this.DB.criaturas.data.eu)
		var ponto = new Ponto(this.DB.criaturas.data.eu, latlng)
		this.map.panTo(ponto.getLatLng());
		//this.DB.pontos.save(ponto)

	}

	drawPercursos(criatura){
		if( Object.keys(criatura.pontos).length < 2 ) return

		var minute = 1000 * 60;
		var hour = minute * 60;
		var day = hour * 24;
		
		var sorted = []
		for(let i in criatura.pontos){
			var date = Math.round(criatura.pontos[i].timestamp / day )
			if(sorted[date] == undefined) sorted[date] = []			
			sorted[date].push(criatura.pontos[i])
		}

		for(let i in sorted){
			let pontos = sorted[i];
			var percurso = new Percurso(criatura, pontos);
			percurso.draw(this.map)
		}

	}
}

export default Mapeamento