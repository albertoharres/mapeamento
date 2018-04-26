var services = {
    makeId() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";			
        for (var i = 0; i < 15; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));			
        return text;
    },    
    random_rgba() {
        var o = Math.round, r = Math.random, s = 255;
        return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
    },

    error(err) {
        console.warn('ERROR(' + err.code + '): ' + err.message);
    },

    getAccurateCurrentPosition() {
        getAccurateCurrentPosition
    },

    isArray(a) {
        return (!!a) && (a.constructor === Array);
    },

    isObject(a) {
        return (!!a) && (a.constructor === Object);
    },

    getDay(timestamp){
        var minute = 1000 * 60;
		var hour = minute * 60;
        var day = hour * 24;
        return Math.round(timestamp / day)
    },

    checkMobile(){
        if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
        ){
           return true;
        }
        else {
           return false;
        }
    },

    isLocalhost(){
        let href = window.location.href
        if(/0.0.0.0/.test(href) || /localhost/.test(href)){
            return true
        } else {
            return false 
        }
    }
}

export default services