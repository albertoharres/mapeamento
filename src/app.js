import DB from './DB.js'
import Map from './map.js'

var App = {
	init(){
        this.DB = new DB();
        //this.map = new Map(this.DB);               
    },
    // separate function for the googlemaps onLoad callback from 'script' tag    
    initMap(){
        console.log('map is set!')
        //this.map.setMap();
    }
}

export default App