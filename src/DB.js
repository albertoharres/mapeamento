const EventEmitter = require('events')

var firebase = require('firebase');

class DB extends EventEmitter {
	constructor () {
		super();
		this.initialDataLoaded = false;
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
		
		this.criaturas_db = firebase.app().database().ref('/controle/criaturas');
		this.pontos_db = firebase.app().database().ref('/controle/pontos');		
				
		this.loadInitialData();
		this.addEvents();
	}

	loadInitialData(){
		var self = this;
		// load inital criaturas
		this.criaturas_db.once('value', function(snapshot){			
			//self.data = snapshot.val();	
			//self.initialDataLoaded = true;
			snapshot.forEach(function(childSnapshot) {
				// key will be "ada" the first time and "alan" the second time				
				self.data[ childSnapshot.val().id ] = {
					name: childSnapshot.val().name, 
					color: childSnapshot.val().color,
					pontos: []
				}
			});
		});
		// load initial points
		this.pontos_db.once('value', function(snapshot){			
			//self.data = snapshot.val();	
			self.initialDataLoaded = true;
			snapshot.forEach(function(childSnapshot) {
				// push pontos para dentro do objeto  			
				self.data[ childSnapshot.val().criatura_id ].pontos.push({
					latlng: childSnapshot.val().latlng, 
					timestamp: childSnapshot.val().timestamp,
				})
			});
			console.log(self.data);
		});		
	}

	addEvents(){
		var self = this;
		// get new criatura
		this.criaturas_db.limitToLast(1).on('value', function(snapshot) {
			if(self.initialDataLoaded){
				let key = Object.keys(snapshot.val())[0];

				console.log('val', snapshot.val()[key]);
				// check if criatura is already set ( if is actually new )
				let criatura_id = snapshot.val()[key]['id'];				
				// is new !
				let obj = {
					name: snapshot.val()[key]['name'], 
					color: snapshot.val()[key]['color'],
					pontos: {}
				}						
				self.data[criatura_id] = obj;
				// emit event
				self.emit('newCriatura', obj)
			}
		});
		// get new ponto		
		this.pontos_db.limitToLast(1).on('value', function(snapshot) {
			if(self.initialDataLoaded){
				console.log('val', Object.keys(snapshot.val())[0]);

				let key = Object.keys(snapshot.val())[0];
				// check if criatura is already set ( if is actually new )
				let criatura_id = snapshot.val()[key]['criatura_id'];
				let ponto_id = snapshot.val()[key]['id'];
				console.log(self.data[criatura_id], criatura_id, self.data);

				if( ( criatura_id in self.data) ){
					// criatura exists !
					let obj = {
						latlng: snapshot.val()[key]['latlng'], 
						timestamp: snapshot.val()[key]['timestamp'],
					}		
					// set local data
					self.data[ criatura_id ].pontos[ponto_id] = obj;			 
					// emit event
					self.emit('newPonto', obj)
				} else {
					console.log('criatura from point doesnt exist')
					return; 
				}
			}
		});
	}

	savePoint(latlng){
		let ponto_id = makeId();
		let criatura_id = window['criatura_id']; 
		// set obj to be sent to db		
		let ponto = {
			id: ponto_id,
			latlng: latlng,
			timestamp: new Date().getTime(),
			criatura_id: criatura_id			
		}
		// add to local data
		this.data[criatura_id].pontos[ponto_id] = {
			latlng: latlng,
			timestamp: new Date().getTime()
		}
		// push to DB
		this.pontos_db.push(ponto);

		return ponto;
	}

	saveUser(){
		let criatura_id = makeId();
		let randomColor = random_rgba();
		var criatura = {
			id: criatura_id,
			name: 'criatura',
			color: randomColor
		}
		// save to local data
		this.data[criatura_id] = {
			name: 'criatura',
			color: randomColor,
			pontos:{}
		}
		// save criatura to local storage	
		window.localStorage.setItem('criatura_id', criatura_id);
		// save criatura as global var		
		window['criatura_id'] = criatura_id;
		// push to DB
		this.criaturas_db.push(criatura);

		return criatura;
	}
}

function makeId() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";			
	for (var i = 0; i < 15; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));			
	return text;
}

function random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}

export default DB
