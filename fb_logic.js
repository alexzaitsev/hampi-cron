var db = require('./db');
var core = require('./fb_core');

this.notifySearchResult = function(senderID, tweetText, tweetUrl) {
	sendTweet(senderID, tweetText, tweetUrl);
}

function sendTextMessage(senderID, messageText) {
	core.sendTextMessage(senderID, messageText);
}

function sendTweet(senderID, tweetText, tweetUrl) {
	sendTextMessage(senderID, tweetText + "\n👉 " + tweetUrl);
}

function sendErrorMessage(senderID) {
	sendTextMessage(senderID, strings.errorMessage);
}