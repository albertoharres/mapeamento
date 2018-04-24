const EventEmitter = require('events');

class Percurso extends EventEmitter {
    constructor(criatura, pontos){
        super();
        this.criatura = criatura;
        this.pontos = pontos;
        var path = this.getPath();        
        this.polyline = new google.maps.Polyline({
            path: path,
            strokeColor: this.criatura.color,
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
    }

    getPath(){
        let coord = [];
        for(let p in this.pontos){
            coord.push(this.pontos[p].latlng);
        }
        return coord
    }

    addPonto(ponto){
        this.pontos[ponto.id] = ponto;
        this.coordinates.push(ponto.latlng);  
        updatePolyline();     
    }

    updatePolyline(){
        var path = this.polyline.getPath();
        this.polyline.setPath(this.coordinates);
    }

    draw(map){
        this.polyline.setMap(map);
    }
}

export default Percurso