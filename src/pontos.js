import Ponto from './Ponto.js'
import services from './services.js'

const EventEmitter = require('events');

class Pontos extends EventEmitter {
    constructor(ref, canal = '/'){
        super();
        this.ref = ref;
        this.canal = canal;
        this.isGlobal = (canal == '/');
    }

    init(criaturas){
        this.criaturas = criaturas;
        this.load();
        this.addEvents();
    }
    // load initial data
    load(){
        var self = this; 
        let queryText = this.canal;
        this.ref.orderByChild('canal')
                .startAt(queryText)
                .endAt(queryText+"\uf8ff")
                .once("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                let data = childSnapshot.val();
                let id = childSnapshot.key;                
                self.setPonto(id, data);
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
            if(self.isLoaded) {
                let id = Object.keys(snapshot.val())[0];
                let data = snapshot.val()[id];
                self.setPonto(id, data)
            }
        });
                    
    }    

    setPonto(id, data){        
        // data                
        if(data.latlng == undefined || data.latlng == null) return
        let latlng = data.latlng;
        let canal = data.canal || '/';
        let timestamp = data.timestamp || 0;    
        let accuracy = data.accuracy || 10;
        // criatura
        var criatura = this.criaturas.getCriatura(data.criatura_id)
        if(!criatura) return;        
        // create ponto              
        var ponto = new Ponto(criatura, latlng, canal, accuracy, timestamp)
        // add point to criatura
        criatura.pontos[id] = ponto
        // if is not initial load ... 
        if(this.isLoaded) criatura.emit('update', id);
    }
    
    save(ponto){
        let obj = {
            latlng: ponto.latlng,
            timestamp: ponto.timestamp,
            criatura_id: ponto.criatura_id,
            canal: ponto.canal
        }
        // save to DB
        let ref = this.ref.push(obj).ref;
        // set id for point
        ponto.setId(ref);
        console.log('point saved', ponto);
        // save to criatura obj
        //ponto.criatura.addPonto(ponto.id, ponto);
    }
}

export default Pontos