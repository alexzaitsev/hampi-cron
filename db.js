'use strict';
const ObjectID = require('mongodb').ObjectID;
const config = require('./config');

Promise.prototype.thenReturn = function(value) {
    return this.then(function() {
        return value; 
    });
};

this.getQueries = function(db, callback, userType) {
	console.log("database: user.aggregate {type: %s}", userType);

	db.collection('user').aggregate([{$match: {'type': userType}}, {$group: {'_id': null, 'listId': {$push: "$_id"}}}], 
		function(err, results) {
			if(err) {
				console.error(JSON.stringify(err));
				callback(err, null);
			} 

			var userIds = results.map(function(a) {return a.listId;});
			var queryFindArgs = {'user_id': {$in: userIds[0]}, 'status': {$ne: config.QUERY_STATUS_OFF}};
			console.log("database: query.find(%s)", JSON.stringify(queryFindArgs));
			db.collection('query').find(queryFindArgs).toArray(function(err, results) {
				if(err) {
					console.error(JSON.stringify(err));
				}
				console.log(JSON.stringify(results));
				callback(err, results);
			});
		});
}

this.storeTweet = function(db, callback, queryId, tweetId) {
	var args = {'_id': queryId};
	var push = {$push: {'tweets': tweetId}};
	console.log("database: query.update(%s, %s)", JSON.stringify(args), JSON.stringify(push));
	db.collection('query').update(args, push, function(err, result) {
		if(err) {
			console.error(JSON.stringify(err));
			callback(err, null);
		} else {
			var inc = {$inc: {'tweets_size': 1}};
			console.log("database: query.update(%s, %s)", JSON.stringify(args), JSON.stringify(inc));
			db.collection('query').update(args, inc, function(err, result) {
				if(err) {
					console.error(JSON.stringify(err));
				}
				callback(err, result);
			});
		}
	});
}

this.checkTweetSize = function(db, queryIds, callback) {
	var maxTweets = config.MAX_TWEETS;
	var args = {'_id': {$in: queryIds}, 'tweets_size': {$gt: maxTweets}};
	console.log("database: deleting old tweets");
	db.collection('query').find(args).toArray(function(err, results) {
		if (err) {
			console.error(JSON.stringify(err));
			callback();
		} else {
			
			// now we have queries that need tweet clearing

			Promise.resolve(0).then(function loop(i) {
			    if (i < results.length) {
			        return new Promise(function(resolve) {

						var tweetsToRemove = [];
						for (var j=0; j<results[i].tweets_size-maxTweets; j++) {
							tweetsToRemove.push(results[i].tweets[j]);
						}
						if (tweetsToRemove.length > 0) {

							db.collection('query').update({'_id': results[i]._id}, {$pull: {'tweets': {$in: tweetsToRemove}}}, {multi: true},
								function(err, results1) {
									if(err) {
										console.error(JSON.stringify(err));
										resolve();
									} else {
										db.collection('query').update({'_id': results[i]._id}, {$set: {'tweets_size': maxTweets}}, 
											function(err, results2) {
												if (err) {
													console.error(JSON.stringify(err));
												}
												resolve();
											}
										);
									}
								});

						} else {
							resolve();
						}

			        }).thenReturn(i + 1).then(loop);
			    }
			}).then(function() {
				callback();				   
			}).catch(function(e) {
			    console.error(JSON.stringify(err));
			    callback();
			});

		}
	});
}
