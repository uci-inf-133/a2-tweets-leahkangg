// only user-written text
let writtenTweets = [];

// turns raw tweets into tweet objects and keeps only user-written 
function parseTweets(runkeeper_tweets) {
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	console.log('Parsing tweets in descriptions:', runkeeper_tweets.length);
	
    // make tweet objects we can query
    tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
    // keep only completed tweets with extra user text
    writtenTweets = tweet_array.filter(tweet => tweet.written);
	console.log('Written tweets found:', writtenTweets.length);
}

// search box w live-filter in table
function addEventHandlerForSearch() {
	const searchBox = document.getElementById('textFilter');
	const searchCount = document.getElementById('searchCount');
	const searchText = document.getElementById('searchText');
	const tweetTable = document.getElementById('tweetTable');
	
	console.log('Setting up search event handler...');
	
	searchCount.innerText = '0';
	searchText.innerText = '';
	
	let searchTimeout;
	
	searchBox.addEventListener('input', function() {
		clearTimeout(searchTimeout);
		
        searchTimeout = setTimeout(() => {
			console.log('Search input changed:', this.value);
			const searchTerm = this.value.toLowerCase();
			
			searchText.innerText = this.value || '';
			
            // only search in the user-written 
            let filteredTweets = [];
            if (searchTerm && searchTerm.trim() !== '') {
                filteredTweets = writtenTweets.filter(tweet => 
                    (tweet.writtenText && tweet.writtenText.toLowerCase().includes(searchTerm))
                );
            }
			
			console.log('Filtered tweets:', filteredTweets.length);
			
			// update count
			searchCount.innerText = filteredTweets.length;
			
			tweetTable.innerHTML = '';
			
			const displayTweets = filteredTweets.slice(0, 100);
			displayTweets.forEach((tweet, index) => {
				tweetTable.innerHTML += tweet.getHTMLTableRow(index + 1);
			});
			
			//  message if there are more results
			if (filteredTweets.length > 100) {
				tweetTable.innerHTML += `<tr><td colspan="3">... and ${filteredTweets.length - 100} more results</td></tr>`;
			}
		}, 300); 
	});
}

document.addEventListener('DOMContentLoaded', function (event) {
	console.log('Descriptions page DOM loaded');
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets).catch(function(error) {
		console.error('Error loading tweets in descriptions:', error);
		window.alert('Error loading tweets: ' + error.message);
	});
});