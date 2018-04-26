import Criaturas from './Criaturas.js'
import Pontos from './Pontos.js'
import services from './services.js'

const EventEmitter = require('events')
var firebase = require('firebase');

class DB extends EventEmitter {
	constructor () {
		super();
		var config = {
			apiKey: process.env.API_KEY,
			authDomain: process.env.AUTH_DOMAIN,
			databaseURL: process.env.DATABASE_URL,
			projectId: process.env.PROJECT_ID,
			storageBucket: "",
			messagingSenderId: process.env.MESSAGING_SENDER_ID
		};
		
		// if is deploy enveiroment
		var Canal = '/global'; // canal padrão na raiz
		if(!services.isLocalhost()) Canal = window.location.pathname;
		console.log('Canal', Canal)
		var app = firebase.initializeApp(config);
		// children objs
		this.criaturas = new Criaturas(firebase.app().database().ref( Canal + '/criaturas' ));	
		this.pontos = new Pontos(firebase.app().database().ref( Canal + '/pontos' ));
		// global db events
		this.addEvents();
	}

	addEvents(){		
		this.criaturas.on('loaded', ()=>{
			console.log('criaturas loaded');
			// load pontos
			this.pontos.init(this.criaturas);
		})

		this.pontos.on('loaded', ()=>{
			console.log('pontos loaded');
			// load pontos
			this.emit('loaded');
			this.isLoaded = true;
		})
	}
}

export default DB
