const EventEmitter = require('events')

var firebase = require('firebase');

class DB extends EventEmitter {
	constructor () {
		super();
		this.data = {
			criaturas:[],
			pontos: []
		}
		var config = {
			apiKey: process.env.API_KEY,
			authDomain: process.env.AUTH_DOMAIN,
			databaseURL: process.env.DATABASE_URL,
			projectId: process.env.PROJECT_ID,
			storageBucket: "",
			messagingSenderId: process.env.MESSAGING_SENDER_ID
		};
		
		var app = firebase.initializeApp(config);
		
		this.controle_db = firebase.app().database().ref('/controle');
		this.criaturas_db = firebase.app().database().ref('/controle/criaturas');
		this.pontos_db = firebase.app().database().ref('/controle/pontos');		
				
		this.addEvents();
	}


	addEvents(){
		var self = this;
		var initialDataLoaded = false;
		//load the first time full database
		this.controle_db.once('value', function(data) {
			//console.log('data', data);
			initialDataLoaded = true;
		});

		this.criaturas_db.on('value', function(snapshot) {
			if(initialDataLoaded){
				//console.log('nova criatura!', snapshot.val())
			}
		});

		

		//when some child is changed
		this.controle_db.limitToLast(1).on('child_added', function(snapshot) {			
			if(!initialDataLoaded) return;
			//console.log('snapshot', snapshot.val());
			// var value = snapshot.val();
			// var id = value.x + ':' + value.y;
			// self.data[id] = value;
			// self.emit('onData', {0:value})
		});
	}
	savePoint(latlng){
		let pontoId = makeId();
		let criatura_id = window['criatura_id']; 
		this.data.pontos[pontoId] = {
			latlng: latlng,
			timestamp: new Date().getTime(),
			criatura_id: criatura_id
		}
		this.pontos_db.push(this.data.pontos[pontoId]);
	}
	saveUser(){
		let criatura_id = makeId();
		let randomColor = random_rgba();
		this.data.criaturas[criatura_id] = {
			id: criatura_id,
			name: 'criatura',
			color: randomColor
		}
		// save criatura to local storage
		window.localStorage.setItem('criatura_id', criatura_id);
		window['criatura_id'] = criatura_id;
		// push to database
		this.criaturas_db.push(this.data.criaturas[criatura_id]);

		return this.data.criaturas[criatura_id];
	}
}

function makeId() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";			
	for (var i = 0; i < 10; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));			
	return text;
}

function random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}

export default DB
