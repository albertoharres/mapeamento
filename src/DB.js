import Criaturas from './Criaturas.js'

const EventEmitter = require('events')
var firebase = require('firebase');

class DB extends EventEmitter {
	constructor () {
		super();
		this.initialDataLoaded= false;
		this.data = {}
		var config = {
			apiKey: process.env.API_KEY,
			authDomain: process.env.AUTH_DOMAIN,
			databaseURL: process.env.DATABASE_URL,
			projectId: process.env.PROJECT_ID,
			storageBucket: "",
			messagingSenderId: process.env.MESSAGING_SENDER_ID
		};
		
		var app = firebase.initializeApp(config);
		
		this.criaturas = new Criaturas(firebase.app().database().ref('/controle/criaturas'))
		
		this.pontos_db = firebase.app().database().ref('/controle/pontos');		
				
		this.loadInitialData();
		this.addEvents();
	}

	loadInitialData(){
		var self = this;
		// load inital criaturas			
		this.pontos_db.once('value', function(snapshot){			
			snapshot.forEach(function(childSnapshot) {				
				// push pontos para dentro do objeto				
				// error 
				if ( self.data[ childSnapshot.val().criatura_id ] == undefined ) {
				//	console.log('error', self.data, childSnapshot.val().criatura_id)
				} else {
					self.data[ childSnapshot.val().criatura_id ].pontos.push({
						latlng: childSnapshot.val().latlng, 
						timestamp: childSnapshot.val().timestamp,
						ref: childSnapshot.ref_.path.pieces_.join("/")
					})				
				}					
			});	
			self.initialDataLoaded = true;
			self.emit('loaded', null);			
		});		

	}

	addEvents(){
		var self = this;		
		// get new ponto		
		this.pontos_db.limitToLast(1).on('value', function(snapshot) {
			if(self.initialDataLoaded){
				// console.log('val', Object.keys(snapshot.val())[0]);

				let key = Object.keys(snapshot.val())[0];
				// check if criatura is already set ( if is actually new )
				let criatura_id = snapshot.val()[key]['criatura_id'];
				let ponto_id = snapshot.val()[key]['id'];
				// console.log(self.data[criatura_id], criatura_id, self.data);

				if( ( criatura_id in self.data) ){
					// criatura exists !
					let obj = {
						latlng: snapshot.val()[key]['latlng'], 
						timestamp: snapshot.val()[key]['timestamp']
					}		
					// set local data
					// console.log('data', self.data[ criatura_id ].pontos)
					self.data[ criatura_id ].pontos.push(obj);			 
					// emit event
					self.emit('newPonto', criatura_id)
				} else {
					console.log('criatura from point doesnt exist')
					return; 
				}
			}
		});
	}

	savePoint(latlng){
		let ponto_id = makeId();
		let criatura_id = window['criatura']['id']; 
		console.log('criatura_id', criatura_id)
		// set obj to be sent to db		
		let ponto = {
			id: ponto_id,
			latlng: latlng,
			timestamp: new Date().getTime(),
			criatura_id: criatura_id			
		}
		// add to local data
		this.data[criatura_id].pontos.push({
			latlng: latlng,
			timestamp: new Date().getTime()
		});
		// push to DB
		this.pontos_db.push(ponto);

		return ponto;
	}
	
}

export default DB
