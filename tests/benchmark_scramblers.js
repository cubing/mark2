// Initialization Data

var DEFAULT_NUM = 100;

var eventIDs = [
  "222",
  "333",
  "pyram",
  "clock",
  //"sq1", // Too slow right now.
];

var logln_browser = function() {};
var logln_both = function() {};
var log_node = function() {};
var log_file = function() {};



// Benchmark Mode Detection

var mode;
if (typeof IN_BROWSER === "undefined") {

	mode = "node";

	var fs = require('fs');

    // From http://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
    // Closest thing we have to simulating web-worker-style includes.

	eval(fs.readFileSync('../inc/mersennetwister.js')+'');

	eval(fs.readFileSync('../inc/scramblers/scramble_222.js')+'');
	eval(fs.readFileSync('../inc/scramblers/scramble_333.js')+'');
	eval(fs.readFileSync('../inc/scramblers/scramble_clock.js')+'');
	eval(fs.readFileSync('../inc/scramblers/scramble_minx.js')+'');
	eval(fs.readFileSync('../inc/scramblers/scramble_NNN.js')+'');
	eval(fs.readFileSync('../inc/scramblers/scramble_pyram.js')+'');
	eval(fs.readFileSync('../inc/scramblers/scramble_sq1.js')+'');

	var file = fs.openSync("benchmark_scramblers/" + ((new Date).getTime()) + ".benchmark.js", "w");

	log_node = function(str) {process.stdout.write(str);};
	logln_both = function(str) {process.stdout.write(str + "\n");};
	log_file = function(str) {fs.write(file, str)};

}
else {

	mode = "in_browser";

	logln_both = logln_browser = function(str) {console.log(str);};

}



// Timing Methods

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



// Math Functions

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



// Benchmark!

var benchmark = function(eventID, num) {

	logln_both("\nRunning " + eventID + " benchmark with " + num + " trials.");

	startNow();

	logln_browser("[" + elapsedTime() + "ms] Initializing...");

	scramblers[eventID].initialize(null, randomSource);

	var iniTime = elapsedTime();
	logln_both("[" + iniTime + "ms] Done initializing.");

	var trials = [];

	log_file("  " + eventID + ": {\n    trials: [");

	for (var i = 0; i < num; i++) {
	  
	  preTime = currentTime();
	  var scr = scramblers[eventID].getRandomScramble();
	  time = currentTime() - preTime;
	  
	  trials.push(time);
	  
	  log_node(".");
	  log_file("" + parseInt(time) +", ");
	  
	  logln_browser("[" + elapsedTime() + "ms] " + (i + 1) + "/" + num + ": " + (time) + "ms: " + scr.scramble_string);
	}

	log_node("\n");

	logln_browser("");
	logln_both("- " + eventID + " Initialization time: " + iniTime + "ms");
	logln_both("- " + eventID + " Mean scramble generation time: " + mean(trials) + "ms");
	logln_both("- " + eventID + " Median scramble generation time: " + median(trials) + "ms");
	logln_browser("");

	log_file("],\n    ini: " + iniTime + ",\n    mean: " + mean(trials) + ",\n    median: " + median(trials) + ",\n  },\n")

	logln_browser("[" + elapsedTime() + "ms] Done with " + eventID + " benchmark.");
}



// Run benchmarks if we're commandline

if (mode == "node") {
  log_file("[\n");
  for (var i in eventIDs) {
  	var eventID = eventIDs[i];
  	benchmark(eventID, DEFAULT_NUM);
  }
  log_file("]\n");
};