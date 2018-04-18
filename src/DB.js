import Criaturas from './Criaturas.js'
import Pontos from './Pontos.js'

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
		
		var app = firebase.initializeApp(config);
		// children objs
		this.criaturas = new Criaturas(firebase.app().database().ref('/controle_carioca_18_04/criaturas'));	
		this.pontos = new Pontos(firebase.app().database().ref('/controle_carioca_18_04/pontos'));
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
