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
		
		var app = firebase.initializeApp(config);
		// children objs
		// criaturas são globais, independem do canal
		
		this.canal = '/'; // canal padrão na raiz
		if(!services.isLocalhost()) {
			var path = window.location.pathname;
			this.canal = path ;		
		}
		// pontos pertencem a canais
		this.criaturas = new Criaturas(firebase.app().database().ref('/criaturas'));
		this.pontos = new Pontos(firebase.app().database().ref('/pontos'), this.canal);
		
		// global db events
		this.addEvents();
	}

	addEvents(){
		// first load criaturas
		this.criaturas.on('loaded', ()=>{
			console.log('criaturas loaded');
			// then load pontos...
			this.pontos.init(this.criaturas);
		})
		// when points also loaded 
		this.pontos.on('loaded', ()=>{
			console.log('pontos loaded');
			// DB loaded ! 
			this.emit('loaded');
			this.isLoaded = true;
		})
	}
}

export default DB
