const EventEmitter = require('events');

class Percurso extends EventEmitter {
    constructor(criatura, pontos){
        super();
        this.criatura = criatura;
        this.pontos = pontos;
        this.path = this.getPath();        
        this.polyline = new google.maps.Polyline({
            path: this.path,
            strokeColor: this.criatura.color,
            strokeOpacity: 0.9,
            strokeWeight: 2.2
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
        this.path.push(ponto.latlng);  
        this.updatePolyline();     
    }

    updatePolyline(){
        this.polyline.setPath(this.path);
        console.log('polyline updated!')
    }

    draw(map){
        this.polyline.setMap(map);
    }
}

export default Percurso