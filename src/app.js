import DB from './DB.js'
import Mapeamento from './mapeamento.js'

var googlemap;

var App = {
	init(){
        this.DB = new DB();
        this.mapeamento = new Mapeamento(this.DB);
        googlemap = this.mapeamento.map;
    },
    // separate function for the googlemaps onLoad callback from 'script' tag    
    initMap(){
        console.log('googlesmaps is set!')
        this.mapeamento.setMap();
    }
}

export default App