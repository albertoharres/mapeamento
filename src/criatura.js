import Pontos from './Pontos.js'
import services from './services.js'

const EventEmitter = require('events');

class Criatura extends EventEmitter {
    constructor(criaturas){
        super();
        this.criaturas = criaturas;
        this.isConnected = true;
        this.pontos = [];
    }

    // when local creature is set from DB
    set(snapshot){
        //console.log('snapshot', snapshot)
        this.name = snapshot.val().name;
        this.color = snapshot.val().color;
        this.id = snapshot.ref.key;
        this.ref = snapshot.getRef();
        return this;
    }
    // returns data obj
    getData(){
        return {
            name: this.name,
            color: this.color,
            isConnected: this.isConnected,            
        }
    }

    addPonto(id, ponto){
        console.log('point added');
        this.pontos[id] = ponto;
        this.criaturas.emit('update', this);
    }
}

export default Criatura