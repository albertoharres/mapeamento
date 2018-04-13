import DB from './DB.js'
import Map from './map.js'
import $ from 'jquery';

var App = function(){
    var map;
	function init(){
        var self = this;
        this.DB = new DB();
        map = Map(); 
        setTimeout(function(){
            map.init(self.DB);
        }, 3000)
        if(localStorage['criatura'] && false){
            window['criatura'] = localStorage['criatura'];
            console.log('set from local creature')
        } else {
            window['criatura'] = this.DB.saveUser();
            localStorage['criatura'] = window['criatura']; 
            console.log('set from newly created creature');
        }               
    }	

    return {
        init: init
    }
}

export default App