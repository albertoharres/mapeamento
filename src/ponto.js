const EventEmitter = require('events');

class Ponto extends EventEmitter {
    constructor(criatura, latlng, canal = '/', timestamp = null){
        super();
        this.criatura = criatura;   
        this.criatura_id = criatura.id;

        this.color = this.criatura.color;
        this.latlng = (latlng.lat) ? latlng : {lat: latlng.coords.latitude, lng: latlng.coords.longitude};
        this.canal = canal;
        this.timestamp = timestamp || new Date().getTime();
        
        this.setMarker();
    }

    getLatLng(){
        return new google.maps.LatLng(this.latlng.lat, this.latlng.lng);
    }    

    setId(ref){
        let pathArray = ref.path.pieces_;
        let ponto_id = pathArray[pathArray.length-1];
        this.id = ponto_id;        
    }

    setMarker(){
        this.marker = new google.maps.Marker({
			map: null,
			position: this.latlng,
			title: "Hello World!",
			visible: true,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 2,
				fillColor: this.color,
				strokeColor: this.color,
				fillOpacity: 1
			},
        });        
    }

    draw(map) {
        this.marker.setMap(map);
    }
}

export default Ponto