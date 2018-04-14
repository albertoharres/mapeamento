import DB from './DB.js'
import Map from './map.js'
import $ from 'jquery';

var App = {
    map: null,
    DB: null,
	init(){
        var self = this;
        this.DB = new DB();
        this.map = Map;         
               
        if(localStorage['criatura'] && false){
            window['criatura'] = localStorage['criatura'];
            console.log('set from local creature')
        } else {
            window['criatura'] = this.DB.storeUser();
            localStorage['criatura'] = window['criatura']; 
            console.log('set from newly created creature');
        }
        
        this.map.init(this.DB);
    },
    
    initMap(){
        console.log('map is set!')
        this.map.setMap();
    }
}

export default App