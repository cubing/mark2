// Quick hack to time the effect of certain 3x3x3 optimizations using node.js.

var fs = require('fs');

// Timing methods

var currentTime = function() {
	return (new Date()).getTime();
}

var startTime = currentTime();

var elapsedTime = function() {
	return currentTime() - startTime;
}

console.log("[" + elapsedTime() + "ms] Starting 3x3x3 benchmark");

// From http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
// Closest thing we have to simulating web-worker-style includes.
eval(fs.readFileSync('../../inc/scramblers/scramble_333.js')+'');

console.log("[" + elapsedTime() + "ms] Initializing...");

scramblers["333"].initialize();

console.log("[" + elapsedTime() + "ms] Done initializing.");

var mean = function(arr) {
	var sum = 0;
	for (var i in arr) {
		sum += arr[i];
	}
	return sum / arr.length;
}

var median = function(arr) {
	return arr.sort(function(a, b){return a-b})[Math.floor(arr.length / 2)];
}

var benchmark = function(thunk, num) {

	var runs = [];

	for (var i = 0; i < num; i++) {
		preTime = currentTime();
		thunk();
		postTime = currentTime();
		runs.push(postTime - preTime);
		console.log("[" + elapsedTime() + "ms] " + (i + 1) + "/" + num + ": " + (postTime - preTime) + "ms");
	}

	console.log("Mean scramble generation time: " + mean(runs) + "ms");
	console.log("Median scramble generation time: " + median(runs) + "ms");
}

var thunk = scramblers["333"].getRandomScramble;

benchmark(thunk, 100);

console.log("[" + elapsedTime() + "ms] Done with 3x3x3 benchmark.");