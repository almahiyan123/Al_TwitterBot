/*
1) Project is a twitter bot that focuses on poetry. It retweets famous poems, occasionally posts a quote, 
and responds to follows and mentions. I personally like poetry, so I thought a bot that acts like 
a poetry enthusiast would be neat. 
2) Link: https://twitter.com/AL_MCRobot123


*/


// Our Twitter library
var Twit = require('twit');


// We need to include our configuration file
var T = new Twit(require('./config.js'));

//search for the latests tweets using poem tag
var hashtagSearch = { q: '#poem', count: 10, result_type: 'recent'}

//a user stream
var userstream = T.stream('user')
//when followed
userstream.on('follow', ifFollowed)
userstream.on('tweet', tweetPost)

//tweet event
function tweetPost (tweet) {
	//reply to 
	var replied = tweet.in_reply_to_screen_name
	//who sent
	var username = tweet.user.screen_name
	//text
	var screentext = tweet.text
	
	//if repyling to me
	console.log(replied, username, screentext)
	if (replied === 'selftwitterhandle') {
		
		//no @mention
		screentext = screentext.replace(/@selftwitterhandle/g, '')
		
		//reply
		var reply = 'Hey! @' + username + ' ' + ', Thanks for the mention! :D:D)'
		
		console.log(reply)
		// post tweet
		T.post('statuses/update', {status: reply }, checkTweeted)
	}
}

// finds #poem tweet and tweets it
function retweetLatest () {
  T.get('search/tweets', hashtagSearch, function (error, data) {
    var tweetData = data.statuses
    for (var i = 0; i < tweetData.length; i++) {
      console.log(tweetData[i].text)
    }
    // If no errors upon server search
    if (!error) {
      // grab the tweet id to retweet
      var retweetRequest = data.statuses[0].id_str
      // we retweet
      T.post('statuses/retweet/' + retweetRequest, {}, checkTweeted)
    }
    //if search had an error, print here
    else {
      if (debug) {
        console.log('There was an error with your search:', error)
      }
    }
  })
}

// check if tweets work, print to console
function checkTweeted (err, reply) {
  if (err !== undefined) {
    console.log(err)
  } else {
    console.log('Tweeted: ' + reply)
  }
}

//see follower details (username, screen name) and thank them
function ifFollowed (event) {
	var username = event.source.name
	var nameOnScreen = event.source.screen_name
	var answer = 'Thanks for the follow!, ' + username + ' @' + nameOnScreen
	//post 
	T.post('statuses/update', {status: answer}, checkTweeted)
	
	console.log('Welcome new follower!: '+ username + ' @' + nameOnScreen)
}


// Try to retweet something as soon as we run the program...
retweetLatest();
// ...and then every hour after that. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
setInterval(retweetLatest, 1000 * 60 * 30);
