import Criatura from './Criatura.js'
import Eu from './eu.js'

const EventEmitter = require('events');

class Criaturas extends EventEmitter {
    constructor(ref){
        super();
        this.name = "criatura";
        this.ref = ref;
        this.data = {};
        this.isLoaded = false;        
        this.load();
        this.addEvents();
    }

    setSelf(){
        let eu = new Eu(this);
        return eu;
    }    

    load(){
        var self = this;
        // initial load criatuas
        this.ref.once('value', function(snapshot){
            // iterar cada criatura
			snapshot.forEach(function(childSnapshot) {
                let pathArray = childSnapshot.ref_.path.pieces_;
                let id = pathArray[pathArray.length-1];``
                var criatura = new Criatura(self);
                // put criatura in obj using id as key
                self.data[id] = criatura.set(childSnapshot, id);
            });
            self.emit('loaded', null);
        });
    }   
    
    getCriatura(criatura_id){
        if(criatura_id in this.data){
            return this.data[criatura_id]
        } else {
            return false; 
        }
    }

    getCenter(){
        var positions = []
        for(var i in this.data){
            var criatura = this.data[i]
            for(var j in criatura.pontos){
                positions.push(criatura.pontos[j].latlng)
            }
        }

        function avarage(array){
            var x 
        }
    }

    addEvents(){
        var self = this;
        this.ref.limitToLast(1).on('value', function(snapshot) {
			if(self.isLoaded){
                console.log('new critura!');
                var criatura = new Criatura(self);                     
                let id = Object.keys(snapshot.val())[0];     
                 // put criatura in obj using id as key
                self.data[id] = criatura.set(snapshot, id);
				//self.emit('new', self.data[id])
			}
		});
        
        this.on('loaded', ()=>{
            this.isLoaded = true;
            this.data['eu'] = this.setSelf();
            // set percursos for each criatura
            for(let i in this.data){
                this.data[i].setPercursos();
            }
        })

        this.on('newPonto', function(ponto){
           // console.log('novo ponto');
        })

        this.on('update', function(criatura){
          // console.log(criatura, 'updated');   
           self.data[criatura.id] = criatura;
        })
    }

    onDisconnect(){
        console.log(this.data['eu'])
        var el = this.ref.child(this.data['eu'].id+'/isConnected').set(false)
        console.log('el', el);
    }
}

export default Criaturas