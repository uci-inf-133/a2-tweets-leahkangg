// takes the raw tweets, parses them into tweet objects, and builds the charts
function parseTweets(runkeeper_tweets) {
	console.log('parseTweets called with:', runkeeper_tweets);
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	// make tweet objects we can query with getters
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// only care about completed tweets for activity counts
	const completedTweets = tweet_array.filter(tweet => tweet.source === 'completed_event');
	console.log('Total completed tweets:', completedTweets.length);
	
	// distance-based means tweets that actually have a num distance
	const distanceBasedTweets = completedTweets.filter(tweet => tweet.distance > 0);
	console.log('Distance-based tweets:', distanceBasedTweets.length);
	
	// count how many of each activity
	const activityCounts = {};
	completedTweets.forEach(tweet => {
		const activityType = tweet.activityType || 'unknown';
		activityCounts[activityType] = (activityCounts[activityType] || 0) + 1;
	});
	
	console.log('Activity counts:', activityCounts);
	
	console.log('Sample distance-based tweets:');
	distanceBasedTweets.slice(0, 5).forEach((tweet, i) => {
		console.log(`Tweet ${i+1}:`, {
			text: tweet.text.substring(0, 100) + '...',
			activityType: tweet.activityType,
			distance: tweet.distance,
			dayOfWeek: tweet.time.toLocaleDateString('en-US', {weekday: 'long'})
		});
	});
	
	console.log('All activity types in distance-based tweets:');
	const allActivityTypes = [...new Set(distanceBasedTweets.map(tweet => tweet.activityType))];
	console.log('Unique activity types:', allActivityTypes);
	
	allActivityTypes.forEach(activityType => {
		const count = distanceBasedTweets.filter(tweet => tweet.activityType === activityType).length;
		console.log(`${activityType}: ${count} tweets`);
	});
	
	console.log('All activity types in completed tweets:');
	const allActivityCounts = {};
	completedTweets.forEach(tweet => {
		const activityType = tweet.activityType;
		allActivityCounts[activityType] = (allActivityCounts[activityType] || 0) + 1;
	});
	console.log('All activity counts:', allActivityCounts);
	
	//  pick top 3 for the scatter/means plots
	const distanceActivityCounts = {};
	distanceBasedTweets.forEach(tweet => {
		const activityType = tweet.activityType || 'unknown';
		distanceActivityCounts[activityType] = (distanceActivityCounts[activityType] || 0) + 1;
	});

	const sortedActivities = Object.entries(distanceActivityCounts)
		.sort(([,a], [,b]) => b - a)
		.slice(0, 3);
	
	console.log('Sorted activities:', sortedActivities);
	console.log('Activity counts:', activityCounts);
	
	document.getElementById('numberActivities').innerText = Object.keys(activityCounts).length;
	document.getElementById('firstMost').innerText = sortedActivities[0] ? sortedActivities[0][0] : 'N/A';
	document.getElementById('secondMost').innerText = sortedActivities[1] ? sortedActivities[1][0] : 'N/A';
	document.getElementById('thirdMost').innerText = sortedActivities[2] ? sortedActivities[2][0] : 'N/A';
	
	// turn the counts into an array for vega-lite
	const activityData = Object.entries(activityCounts).map(([activity, count]) => ({
		activity: activity,
		count: count
	}));

	// spec for the bar chart of activity counts
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityData
	  },
	  "mark": "bar",
	  "encoding": {
	    "x": {
	      "field": "activity", 
	      "type": "nominal", 
	      "sort": "-y"
	    },
	    "y": {
	      "field": "count", 
	      "type": "quantitative"
	    }
	  }
	};
	
	console.log('Creating activity chart with data:', activityData);
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false}).then(function(result) {
		console.log('Activity chart rendered successfully');
	}).catch(function(error) {
		console.error('Error rendering activity chart:', error);
	});

	const topThreeActivities = sortedActivities.map(([activity]) => activity);
	console.log('Top three activities:', topThreeActivities);
	
	// data points of scatter plot: only top 3 distance activities
	const distanceData = distanceBasedTweets
		.filter(tweet => topThreeActivities.includes(tweet.activityType))
		.map(tweet => ({
			activity: tweet.activityType,
			distance: Math.min(tweet.distance, 300), 
			dayOfWeek: tweet.time.toLocaleDateString('en-US', {weekday: 'long'})
		}));
	
	console.log('Distance data:', distanceData.length, 'entries');
	console.log('Sample distance data:', distanceData.slice(0, 10));
	
	const distances = distanceData.map(d => d.distance);
	console.log('Distance range:', Math.min(...distances), 'to', Math.max(...distances));
	console.log('Average distance:', distances.reduce((a, b) => a + b, 0) / distances.length);
	
	const highDistances = distances.filter(d => d > 200);
	console.log('High distances (>200):', highDistances);
	console.log('Max distance:', Math.max(...distances));

	// spec for thee scatter
	distance_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Interactive distance visualization for top 3 activities",
		"data": {"values": distanceData},
		"mark": {"type": "point", "size": 60, "opacity": 0.7},
		"encoding": {
			"x": {
				"field": "dayOfWeek", 
				"type": "nominal", 
				"sort": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
				"axis": {"title": "time (day)"}
			},
			"y": {
				"field": "distance", 
				"type": "quantitative",
				"axis": {"title": "distance", "values": [0, 50, 100, 150, 200, 250, 300]},
				"scale": {"domain": [0, 300], "type": "linear"}
			},
			"color": {
				"field": "activity", 
				"type": "nominal",
				"scale": {
					"domain": topThreeActivities,
					"range": ["#1f77b4", "#ff7f0e", "#ff69b4"]
				}
			}
		},
		"width": 500,
		"height": 400,
		"params": [
			{
				"name": "aggregate",
				"value": false
			}
		]
	};
	
	console.log('Creating scatter plot with data:', distanceData.slice(0, 5));
	vegaEmbed('#distanceVis', distance_vis_spec, {actions:false}).then(function(result) {
		console.log('Scatter plot rendered successfully');
	}).catch(function(error) {
		console.error('Error rendering scatter plot:', error);
	});

	// group by activity + day = distance data
	const aggregatedData = {};
	distanceData.forEach(d => {
		const key = `${d.activity}-${d.dayOfWeek}`;
		if (!aggregatedData[key]) {
			aggregatedData[key] = {activity: d.activity, dayOfWeek: d.dayOfWeek, distances: []};
		}
		aggregatedData[key].distances.push(d.distance);
	});

	const meanData = Object.values(aggregatedData).map(group => ({
		activity: group.activity,
		dayOfWeek: group.dayOfWeek,
		meanDistance: group.distances.reduce((a, b) => a + b, 0) / group.distances.length
	}));

	window.distanceData = distanceData;
	window.meanData = meanData;
	window.topThreeActivities = topThreeActivities;
	
	document.getElementById('distanceVisAggregated').style.display = 'none';

	// move between raw  and average points when clicking  button
	let isAggregated = false;
	const aggregateButton = document.getElementById('aggregate');
	console.log('Setting up interactive button:', aggregateButton);
	
	aggregateButton.addEventListener('click', function() {
		console.log('Button clicked! Current state:', isAggregated);
		isAggregated = !isAggregated;
		
		this.innerText = isAggregated ? 'Show all activities' : 'Show means';
		console.log('Button text updated to:', this.innerText);
		
		const newSpec = {
			"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
			"description": isAggregated ? "Mean distance by day of week for top 3 activities" : "Distance by day of week for top 3 activities",
			"data": {"values": isAggregated ? window.meanData : window.distanceData},
			"mark": {
				"type": "point", 
				"size": isAggregated ? 100 : 60, 
				"opacity": isAggregated ? 0.8 : 0.7
			},
			"encoding": {
				"x": {
					"field": "dayOfWeek", 
					"type": "nominal", 
					"sort": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
					"axis": {"title": "time (day)"}
				},
				"y": {
					"field": isAggregated ? "meanDistance" : "distance", 
					"type": "quantitative",
					"axis": {
						"title": isAggregated ? "Mean of distance" : "distance",
						"tickCount": isAggregated ? 4 : undefined,
						"values": isAggregated ? undefined : [0, 50, 100, 150, 200, 250, 300]
					},
					"scale": isAggregated ? {"domain": [0, 20]} : {"domain": [0, 300], "type": "linear"}
				},
				"color": {
					"field": "activity", 
					"type": "nominal",
					"scale": {
						"domain": window.topThreeActivities,
						"range": ["#1f77b4", "#ff7f0e", "#ff69b4"]
					}
				}
			},
			"width": 500,
			"height": 400
		};
		
		console.log('Rendering chart with data:', isAggregated ? 'meanData' : 'distanceData');
		console.log('Data length:', isAggregated ? window.meanData.length : window.distanceData.length);
		
		vegaEmbed('#distanceVis', newSpec, {actions: false}).then(function(result) {
			console.log(isAggregated ? 'Mean chart rendered successfully' : 'Scatter plot rendered successfully');
		}).catch(function(error) {
			console.error('Error rendering interactive chart:', error);
		});
	});

	//  avg distance by activity 
	const activityMeans = {};
	topThreeActivities.forEach(activity => {
		const activityTweets = distanceBasedTweets.filter(tweet => tweet.activityType === activity);
		if (activityTweets.length > 0) {
			const meanDistance = activityTweets.reduce((sum, tweet) => sum + tweet.distance, 0) / activityTweets.length;
			activityMeans[activity] = meanDistance;
		}
	});

	const sortedByDistance = Object.entries(activityMeans).sort(([,a], [,b]) => b - a);
	document.getElementById('longestActivityType').innerText = sortedByDistance[0] ? sortedByDistance[0][0] : 'N/A';
	document.getElementById('shortestActivityType').innerText = sortedByDistance.length > 0 ? sortedByDistance[sortedByDistance.length - 1][0] : 'N/A';

	// split distances by weekdays vs weekends and compare means
	const weekdayData = distanceData.filter(d => 
		['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(d.dayOfWeek)
	);
	const weekendData = distanceData.filter(d => 
		['Saturday', 'Sunday'].includes(d.dayOfWeek)
	);

	let weekdayMean = 0;
	let weekendMean = 0;
	
	if (weekdayData.length > 0) {
		weekdayMean = weekdayData.reduce((sum, d) => sum + d.distance, 0) / weekdayData.length;
	}
	if (weekendData.length > 0) {
		weekendMean = weekendData.reduce((sum, d) => sum + d.distance, 0) / weekendData.length;
	}

	document.getElementById('weekdayOrWeekendLonger').innerText = 
		weekendMean > weekdayMean ? 'weekends' : 'weekdays';
}

document.addEventListener('DOMContentLoaded', function (event) {
	console.log('Activities page DOM loaded');
	console.log('About to load tweets...');
	loadSavedRunkeeperTweets().then(function(data) {
		console.log('Tweets loaded successfully, data length:', data.length);
		parseTweets(data);
	}).catch(function(error) {
		console.error('Error loading tweets in activities:', error);
		window.alert('Error loading tweets: ' + error.message);
	});
});