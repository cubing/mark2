// Quick hack to time the effect of certain 3x3x3 optimizations using node.js.

var DEFAULT_NUM = 100;

// Timing methods

function run(num) {

var currentTime = function() {
	return (new Date()).getTime();
}

var startTime;
var startNow = function() {
	startTime = currentTime();
}

var elapsedTime = function() {
	return currentTime() - startTime;
}

// From http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
// Closest thing we have to simulating web-worker-style includes.
// Define IN_BROWSER before calling this code to avoid trying node-style imports.
if (typeof IN_BROWSER === "undefined") {
	var fs = require('fs');
	eval(fs.readFileSync('../../inc/scramblers/scramble_333.js')+'');
	eval(fs.readFileSync('../../inc/mersennetwister.js')+'');
}

var randomSource = new MersenneTwisterObject(0);
//Math.random = undefined; // So we won't use it by accident

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

    console.log("");
    console.log("Starting 3x3x3 benchmark.");
	console.log("Running benchmark with " + num + " trials.");
    console.log("");

	startNow();

	console.log("[" + elapsedTime() + "ms] Initializing...");

	scramblers["333"].initialize(null, randomSource);

	var iniTime = elapsedTime();
	console.log("[" + iniTime + "ms] Done initializing.");

	var runs = [];

	for (var i = 0; i < num; i++) {
		preTime = currentTime();
		thunk();
		postTime = currentTime();
		runs.push(postTime - preTime);
		console.log("[" + elapsedTime() + "ms] " + (i + 1) + "/" + num + ": " + (postTime - preTime) + "ms");
	}

	console.log("");
	console.log("Initialization time: " + iniTime + "ms");
	console.log("Mean scramble generation time: " + mean(runs) + "ms");
	console.log("Median scramble generation time: " + median(runs) + "ms");
	console.log("");
}

var thunk = scramblers["333"].getRandomScramble;

benchmark(thunk, num);

console.log("[" + elapsedTime() + "ms] Done with 3x3x3 benchmark.");
}

if (typeof IN_BROWSER === "undefined") {
	// Assume bind isn't available.
	setTimeout(function (){run(DEFAULT_NUM);}, 0);
};