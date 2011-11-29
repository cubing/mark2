var console;
if (typeof window !== "undefined") {
	console = window.console;
}
else {
	console = {};
	console.log = function() {};
	console.error = function() {};
}

var workerScramblers = {};
var workerScramblersInitialized = {};
var initialized = false;
var randomSource = undefined;

var initialize = function(eventIDs, scramblerFiles, random_seed) {

	importScripts("mersennetwister.js");
	randomSource = new MersenneTwisterObject(random_seed);

	for (i in eventIDs) {

		importScripts(scramblerFiles[eventIDs[i]]);

		workerScramblers[eventIDs[i]] = scramblers[eventIDs[i]];
		workerScramblers[eventIDs[i]].setRandomSource(randomSource);

		workerScramblersInitialized[eventIDs[i]] = false;

	}

	initialized = true;

	postMessage({
		action: "initialized",
		info: ["Successfully initialized web worker for [" + eventIDs.toString() + "]."]
	});
}

var getRandomScramble = function (eventID, returnData) {

	if (!initialized) {
		postMessage({
			action: "echo_response",
			info: "Web worker for " + eventID + " is not initialized yet."
		});
	}

	if (!workerScramblersInitialized[eventID]) {

		postMessage({
			action: "get_random_scramble_initializing_scrambler",
			return_data: returnData
		});

		workerScramblers[eventID].initialize();

		workerScramblersInitialized[eventID] = true;

	}

	postMessage({
		action: "get_random_scramble_starting",
		return_data: returnData
	});

	var scramble = workerScramblers[eventID].getRandomScramble();
	postMessage({
		action: "get_random_scramble_response",
		scramble: scramble,
		event_id: eventID,
		return_data: returnData
	});
}


onmessage = function(e) {
	switch(e.data.action) {
		case "initialize":
			initialize(e.data.event_ids, e.data.scrambler_files, e.data.random_seed);
		break;

		case "get_random_scramble":
			getRandomScramble(e.data.event_id, e.data.return_data);
		break;

		case "echo":
			postMessage({action: "echo_response", info: e.data});
		break;

		default:
			console.error("Unknown message.");
		break;
	}
}