function parseTweets(runkeeper_tweets) {
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	console.log('Parsing tweets:', runkeeper_tweets.length);

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	

	document.getElementById('numberTweets').innerText = tweet_array.length;
	
	const dates = tweet_array.map(tweet => tweet.time).sort((a, b) => a - b);
	const earliestDate = dates[0];
	const latestDate = dates[dates.length - 1];
	
	document.getElementById('firstDate').innerText = earliestDate.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
	document.getElementById('lastDate').innerText = latestDate.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
	
	const completedEvents = tweet_array.filter(tweet => tweet.source === 'completed_event');
	const liveEvents = tweet_array.filter(tweet => tweet.source === 'live_event');
	const achievements = tweet_array.filter(tweet => tweet.source === 'achievement');
	const miscellaneous = tweet_array.filter(tweet => tweet.source === 'miscellaneous');
	
	const completedEventsSpans = document.querySelectorAll('.completedEvents');
	completedEventsSpans.forEach(span => span.innerText = completedEvents.length);
	document.querySelector('.completedEventsPct').innerText = math.format((completedEvents.length / tweet_array.length) * 100, {notation: 'fixed', precision: 2}) + '%';
	
	document.querySelector('.liveEvents').innerText = liveEvents.length;
	document.querySelector('.liveEventsPct').innerText = math.format((liveEvents.length / tweet_array.length) * 100, {notation: 'fixed', precision: 2}) + '%';
	
	document.querySelector('.achievements').innerText = achievements.length;
	document.querySelector('.achievementsPct').innerText = math.format((achievements.length / tweet_array.length) * 100, {notation: 'fixed', precision: 2}) + '%';
	
	document.querySelector('.miscellaneous').innerText = miscellaneous.length;
	document.querySelector('.miscellaneousPct').innerText = math.format((miscellaneous.length / tweet_array.length) * 100, {notation: 'fixed', precision: 2}) + '%';
	
	const writtenTweets = completedEvents.filter(tweet => tweet.written);
	document.querySelector('.written').innerText = writtenTweets.length;
	document.querySelector('.writtenPct').innerText = math.format((writtenTweets.length / completedEvents.length) * 100, {notation: 'fixed', precision: 2}) + '%';
}

document.addEventListener('DOMContentLoaded', function (event) {
	console.log('DOM loaded, loading tweets...');
	loadSavedRunkeeperTweets().then(parseTweets).catch(function(error) {
		console.error('Error loading tweets:', error);
		window.alert('Error loading tweets: ' + error.message);
	});
});