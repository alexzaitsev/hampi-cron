var twitterAPI = require('node-twitter-api');
var config = require('./config');
var db = require('./db');

var TWITTER_CALLBACK = config.twitterCallback;
var TWITTER_KEY = config.twitterConsumerKey;
var TWITTER_SECRET = config.twitterConsumerSecret;

function getTwitter() {
	return new twitterAPI({
	    consumerKey: TWITTER_KEY,
	    consumerSecret: TWITTER_SECRET,
	    callback: TWITTER_CALLBACK
	});
}

this.search = function(callback, queryData) {
	var twitter = getTwitter();
	var query = new Object();
	query.q = encodeURI(queryData.query);
	twitter.search(
		query,
	    queryData.access_token,
	    queryData.access_secret,
	    function(error, data, response) {
	        if (error) {
	            console.error(JSON.stringify(error));
	        } 
	        callback(error, data);
	    }
	);
}