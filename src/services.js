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
    }
}

export default services