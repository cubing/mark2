var console;
if (typeof window !== "undefined") {
	console = window.console;
}
else {
	console = {};
	console.log = function() {};
	console.error = function() {};
}

var scrambler;
var initialized = false;

var initialize = function(eventID, scramblerFile) {
	if (!initialized) {

		importScripts(scramblerFile);
		scrambler = scramblers[eventID];

		scrambler.initialize();

		initialized = true;
	}

	postMessage({
		action: "initialized",
		info: ["Successfully initialized web worker for " + eventID + "(version " + scrambler.version + ")"]
	});
}

var getRandomScramble = function (eventID, returnData) {

	postMessage({
		action: "get_random_scramble_starting",
		return_data: returnData
	});

	postMessage({action: "echo_response", info: "Event " + eventID + ", " + scrambler.version});

	var scramble = scrambler.getRandomScramble();
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
			initialize(e.data.event_id, e.data.scrambler_file);
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