import services from './services.js'
import Percurso from './percurso.js'
import Pontos from './pontos.js'

const EventEmitter = require('events');

class Criatura extends EventEmitter {
    constructor(criaturas){
        super();
        this.name = 'name'
        this.criaturas = criaturas;
        this.isConnected = true;
        this.color = services.random_rgba();
        this.pontos = {};
        this.percursos = {};
        this.addEvents()
    }

    addEvents(){
        var self = this;
        this.on('update', function(ponto_id){
            var ponto = self.pontos[ponto_id]
            let date_key = services.getDay(ponto.timestamp)
            console.log('new ponto', ponto, ponto_id, self.pontos)
            if(self.percursos[date_key] == undefined){
                console.log('date key undefined!')
                // if percurso is new
                var percurso = new Percurso(self, {ponto_id: ponto})
                self.percursos[date_key] = percurso;
                self.percursos[date_key].addPonto(ponto)
                self.criaturas.emit('newPercurso', percurso);
            } else {
                // if is current percurso
                self.percursos[date_key].addPonto(ponto)
            }
        })
    }

    // when local creature is set from DB
    set(snapshot, id){       
        let data = snapshot.val()
        this.name = data.name;
        this.color = data.color;
        this.id = id;
        this.ref = snapshot.getRef();
        return this;
    }

    getLastPoint(){
        return 'alou'
        return this.sortByTimestamp(this.pontos)[0];
    }

    getSorted(){
        var sorted = {};    
        var pontos = this.sortByTimestamp(this.pontos);
        for( let i in pontos ){        
            let date_key = services.getDay(pontos[i].timestamp)
            sorted[date_key] = sorted[date_key] == undefined ? {} : sorted[date_key]
            sorted[date_key][i] = pontos[i]
        }
        return sorted;
    }

    sortByTimestamp(pontos){
        var array = []
        for(let i in pontos){
            array.push(pontos[i])
        }
        array.sort(function(a, b){
            if (a.timestamp > b.timestamp) {
                return 1;
              }
              if (a.timestamp < b.timestamp) {
                return -1;
              }
              // a must be equal to b
              return 0;
        })
        return array;
    }

    setPercursos(){
        var sorted = this.getSorted();
        for(var i in sorted){
            var percurso = new Percurso(this, sorted[i])
            this.percursos[i] = percurso; 
        }
    }

    // returns data obj
    getData(){
        return {
            name: this.name,
            color: this.color,
            isConnected: this.isConnected,
        }
    }

    draw(map){
        for(var i in this.percursos){
            this.percursos[i].draw(map)
        }
    } 
}

export default Criatura