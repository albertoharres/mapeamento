const EventEmitter = require('events');

class Ponto extends EventEmitter {
    constructor(criatura, latlng){
        super();
        this.criatura = criatura;
        //console.log('latlng', latlng)
        this.latlng = (latlng.lat) ? latlng : {lat: latlng.coords.latitude, lng: latlng.coords.longitude};
        this.criatura_id = criatura.id;
        this.timestamp = new Date().getTime();
    }

    getLatLng(){
        return new google.maps.LatLng(this.latlng.lat, this.latlng.lng);
    }    

    setId(ref){
        let pathArray = ref.path.pieces_;
        let ponto_id = pathArray[pathArray.length-1];
        this.id = ponto_id;        
    }

    draw(){

    }
}

export default Ponto