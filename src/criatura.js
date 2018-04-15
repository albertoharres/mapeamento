import services from './services.js'

const EventEmitter = require('events');

class Criatura extends EventEmitter {
    constructor(criaturas){
        super();                        
        this.criaturas = criaturas;
        this.pontos = [];
        this.connected = true;
    }    

    // when local creature is set from DB
    set(snapshot){
        this.name = snapshot.val().name;
        this.color = snapshot.val().color;        
        let pathArray = snapshot.ref_.path.pieces_;
        this.ref = pathArray.join("/");    
        this.id = pathArray[pathArray.length-1];
        // add to criaturas list
        return this;
    }

    getData(){
        return {
            name: this.name,
            color: this.color,
            isConnected: this.connected,            
        }
    }

    save(data){
        let ref = this.criaturas.ref.push(data).ref;
        let pathArray = ref.path.pieces_;
        this.id = pathArray[pathArray.length-1];
        this.emit('saved');                        
    }
    
    /*
    store(){
        this.data = {
			name: this.name,
            color: this.color,			
            isConnected: true, 
			pontos:[]
		}
		// save to local data
        this.criaturas.data[this.id] = this.data;
    }
    */
    
    addPosition(ponto){
        this.pontos.push(ponto);
    }
}

export default Criatura