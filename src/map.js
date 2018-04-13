import _ from 'lodash';
import $ from 'jquery';

var leaflet = require('leaflet')

var Map = function(){
	var el, map, DB;
	
	var points = [];
	var points_ids = []; 

	function init(_DB){
		console.log('init!', _DB)	
		DB = _DB;	
		el = document.createElement('div');
		el.id = 'map';
		document.body.appendChild(el);
		setMap();

		addEvents();
	}
	function setMap(){
		var uluru = {lat: -25.363, lng: 131.044};
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 19,
          center: uluru
        });        
		getPosition();		
		getPointsFromDB();
	}
	function addEvents(){
		// add point on click 'test'
		google.maps.event.addListener(map, 'click', function(event) {
			addPoint(event.latLng);
		 });
		 var isInitialLoad = true;
		 DB.pontos_db.on('value', function(snapshot) {		
			if(isInitialLoad) {
				isInitialLoad = false;
				return 
			}
			snapshot.forEach(function(childSnapshot) {
				// key will be "ada" the first time and "alan" the second time
				var key = childSnapshot.key;
				let hasFound = false;
				for(let i = 0; i < points_ids.length; i++){
					if(key == points_ids[i]) hasFound = true;
				}
				if(!hasFound) {
					console.log('is new data', childSnapshot.val())
					var new_point = childSnapshot.val();				
					points_ids.push(key);	
					// draw point to map 
					var latlng = new google.maps.LatLng(new_point.latlng.lat, new_point.latlng.lng);
					drawPoint(latlng)
				}
			});
		});
		 
	}
	function setInitialPosition(loc){
		var latlng = new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude);

		var loc = {lat: loc.coords.latitude, lng: loc.coords.longitude};
		// center starting point on screen 
		map.panTo(latlng)		
		// save point to database
		savePoint(loc)
	}

	function addPoint(latlng){
		drawPoint(latlng);
		var loc = { 'lat': latlng.lat(), 'lng': latlng.lng() };
		savePoint(loc);
	}		

	function drawPoint(latlng){		
		var marker = new google.maps.Marker({
			position: latlng,
			map: map,
			title:"Hello World!",
      		visible: false
		});	
	}

	function drawShape(coordinates, criatura_id){

		

		var shape = new google.maps.Polyline({
			path: coordinates,
			strokeColor: '#'+(Math.random()*0xFFFFFF<<0).toString(16),
			strokeOpacity: 1.0,
			strokeWeight: 2
		  });
		
		  shape.setMap(map);
	}

	function getPointsFromDB(){
		DB.pontos_db.once("value").then(function(snapshot) {
			snapshot.forEach(function(childSnapshot) {
				// key will be "ada" the first time and "alan" the second time
				var key = childSnapshot.key;				
				points_ids.push(key);
				// childData will be the actual contents of the child
				var childData = childSnapshot.val();
				points.push(childData);			
				
				if(!isNaN(childData.latlng.lat) && !isNaN(childData.latlng.lng)){
					var latlng = new google.maps.LatLng(childData.latlng.lat, childData.latlng.lng);
					drawPoint(latlng);
				} else {
					console.log('bad latlng');
				}	
			});
			var grouped = groupByCriaturaId(points);
			console.log('grouped', grouped)
			drawAllPoints(grouped);			
		});		

	}

	function drawAllPoints(grouped){
		for(var i in grouped){
			drawShape(grouped[i], i);
		}
	}

	function groupByCriaturaId(list){
		var grouped_list = {};
		list.forEach(function(a){
			grouped_list[a.criatura_id] = grouped_list[a.criatura_id] || [];
			grouped_list[a.criatura_id].push({lat: a.latlng.lat, lng: a.latlng.lng})
		})
		return grouped_list;
	}

	function savePoint(loc){
		DB.savePoint(loc)
	}


	function getPosition(){
		console.log('get position');
		if(!navigator.geolocation) { 
			console.log('Votre navigateur ne prend malheureusement pas en charge la géolocalisation.');
			return;
		}
		var options = {timeout:50000};
		
		navigator.geolocation.getCurrentPosition(setInitialPosition, error, options);

		function error(err) {
			console.warn('ERROR(' + err.code + '): ' + err.message);
		  };
	}	
	return {
		init: init
	}
}

export default Map