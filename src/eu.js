import Criatura from './criatura.js'
import services from './services.js'

const EventEmitter = require('events');

class Eu extends Criatura {
    constructor(criaturas){
        super(criaturas);
        this.addSelfEvents();     
        if(this.isSetInLocalStorage()){
            this.setFromLocalData(localStorage['criatura_id']);
        } else {
            this.create();
        }
    }

    addSelfEvents(){
        this.on('saved', ()=> {
            console.log('saved to', this.ref )
            this.setToLocalStorage();
        });

        this.on('created', ()=>{
            this.save(this.getData());
        });
    }

    // check if is set in local storage
    isSetInLocalStorage(){
        if(localStorage['criatura_id'] != null || undefined || 0){
            console.log('has found creature set in localStorage', localStorage['criatura_id']);
            if( localStorage['criatura_id'] in this.criaturas.data ) {            
                return true;
            } else {
                console.log('...but not in DB', this.criaturas.data);
                return false;
            }            
        } else {
            return false; 
        }
    }

    setToLocalStorage(){
        localStorage['criatura_id'] = this.id;
        console.log('saved to localStorage', localStorage['criatura_id'])
    }
    
    setFromLocalData(id){
        this.name = this.criaturas.data[id].name;
        this.color = this.criaturas.data[id].name;      
        this.ref = this.criaturas.data[id].ref;
        this.id = id;
        // add to criaturas list
        return this;
    }

    // when a new creature is created in client
    create(){		
		this.color = services.random_rgba();
        this.name = 'criatura';
        this.emit('created');
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
        this.ref = pathArray.join("/");    
        this.emit('saved');                        
    }
    
    addPosition(ponto){
        this.pontos.push(ponto);
    }    
}

export default Eu