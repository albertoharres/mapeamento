import Criatura from './Criatura.js'
import Eu from './eu.js'

const EventEmitter = require('events');

class Criaturas extends EventEmitter {
    constructor(ref){
        super();
        this.ref = ref;
        this.data = {};
        this.load();   
        this.addEvents();
        // current user is not yet set, waiting for data from users to be loaded                
           
    }

    setSelf(){
        let eu = new Eu(this);        
        return eu; 
    }

    load(){
        var self = this;
        this.ref.once('value', function(snapshot){						            
			snapshot.forEach(function(childSnapshot) {                                        
                let pathArray = childSnapshot.ref_.path.pieces_;
                let id = pathArray[pathArray.length-1];                
                var criatura = new Criatura(self);
                self.data[id] = criatura.set(childSnapshot);
            });
            self.emit('loaded', null);
        });
    }    

    addEvents(){
        var self = this;
        this.ref.limitToLast(1).on('value', function(snapshot) {
			if(self.isLoaded){          
                console.log('new!');
                var criatura = new Criatura(self);
				let id = Object.keys(snapshot.val())[0];                               
                self.data[id] = criatura.set(snapshot.val()[id]);
				self.emit('new', obj)
			}
		});
        
        this.on('loaded', ()=>{
            this.isLoaded = true;
            // create own user after all users are loaded, 
            // to make sure it is not created without need 
            this.eu = this.setSelf();
        })
    }    
}

export default Criaturas