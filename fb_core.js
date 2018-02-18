var logic = require('./fb_logic');
var request = require('request');
var config = require('./config');
var analytics = require('./analytics.js');

/*
 * Send a text message using the Send API.
 *
 */
this.sendTextMessage = function(recipientId, messageText) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText,
			metadata: "DEVELOPER_DEFINED_METADATA"
		}
	};

	this.callSendAPI(messageData);
}

this.callSendAPI = function(messageData) {
	this.callSendAPIAndCallback(messageData, null);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
this.callSendAPIAndCallback = function(messageData, callback) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: config.fbPageAccessToken },
		method: 'POST',
		json: messageData

		}, function (error, response, body) {
			analytics.track(messageData.recipient.id, messageData.message);
			if (callback != null) {
				callback();
			}
			if (!error && response.statusCode == 200) {
				var recipientId = body.recipient_id;
				var messageId = body.message_id;

				if (messageId) {
					console.log("Successfully sent message with id %s to recipient %s", 
							messageId, recipientId);
				} else {
					console.log("Successfully called Send API for recipient %s", 
							recipientId);
				}
			} else {
				console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
			}
		});  
}