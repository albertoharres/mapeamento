import Ponto from './Ponto.js'
import services from './services.js'

const EventEmitter = require('events');

class Pontos extends EventEmitter {
    constructor(ref){
        super();
        this.ref = ref;                
    }

    init(criaturas){
        this.criaturas = criaturas;
        this.load();
        this.addEvents();
    }
    // load initial data
    load(){
        var self = this; 
        this.ref.once('value', function(snapshot){			
			snapshot.forEach(function(childSnapshot) {			
                // first check if creatura with id exists or not
                let data = childSnapshot.val();      
                let id = childSnapshot.key;
                let timestamp = data.timestamp || 0;

                if(data.latlng == undefined || data.latlng == null) return                
                let latlng = data.latlng;
                var criatura = self.criaturas.getCriatura(data.criatura_id)
                if(!criatura || data.latlng == undefined) return;  
                
                let day = services.getDay(timestamp)

                var ponto = new Ponto(criatura, latlng, timestamp);
                criatura.pontos[id] = ponto;
			});	
			self.emit('loaded', null);	
        });		
        
        this.on('loaded', ()=>{
            this.isLoaded = true;            
        })
    }

    addEvents(){
        var self = this;
		// on new ponto
		this.ref.limitToLast(1).on('value', function(snapshot) {
			if(self.isLoaded){
				let id = Object.keys(snapshot.val())[0];
				let criatura_id = snapshot.val()[id]['criatura_id'];
				if( ( criatura_id in self.criaturas.data) ){
					// set data
                    let data = snapshot.val()[id];
                    // get criatura from criatura id
                    let criatura = self.criaturas.getCriatura(criatura_id);
                    if(!criatura || data.latlng == undefined) return;                                              
                    // create ponto              
                    var ponto = new Ponto(criatura,data.latlng, data.timestamp);
                    // add point to criatura
                    console.log('criatura novo ponto', criatura,  ponto )
                    criatura.pontos[id] = ponto;
                    criatura.emit('update', id);
				} else {
					console.log('criatura from point doesnt exist')
					return; 
				}
			}
		});
    }

    save(ponto){
        let obj = {
            latlng: ponto.latlng,
            timestamp: ponto.timestamp,
            criatura_id: ponto.criatura_id
        }
        // save to DB
        let ref = this.ref.push(obj).ref;
        // set id for point
        ponto.setId(ref);
        console.log('point saved', ponto.id);
        // save to criatura obj
        //ponto.criatura.addPonto(ponto.id, ponto);
    }
}

export default Pontos