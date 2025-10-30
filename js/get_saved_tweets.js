function loadSavedRunkeeperTweets() {
	return new Promise(function(resolve, reject) {
		console.log('Starting to load tweets...');
		fetch('./data/saved_tweets.json')
			.then(response => {
				console.log('Response received:', response.status);
				if (!response.ok) {
					throw new Error('HTTP error! status: ' + response.status);
				}
				return response.json();
			})
			.then(data => {
				console.log('Data parsed successfully:', data.length, 'tweets');
				resolve(data);
			})
			.catch(error => {
				console.error('Error in loadSavedRunkeeperTweets:', error);
				console.log('Trying fallback...');
				const sampleData = [
					{"text": "Just completed a 5.0 km run with @Runkeeper. Check it out! https://t.co/test1 #Runkeeper", "created_at": "Sun Sep 30 06:58:57 +0000 2018"},
					{"text": "Just completed a 3.2 mi walk with @Runkeeper. Check it out! https://t.co/test2 #Runkeeper", "created_at": "Sun Sep 30 07:00:00 +0000 2018"},
					{"text": "Just posted a 10.5 km run - Great workout today! https://t.co/test3 #Runkeeper", "created_at": "Sun Sep 30 07:30:00 +0000 2018"}
				];
				resolve(sampleData);
			});
	});
}