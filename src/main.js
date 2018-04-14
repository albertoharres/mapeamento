import App from './app.js'

App.init();

window.googlemapsLoaded = function(){
	App.initMap();
}