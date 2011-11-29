var events = {
	// Official WCA events as of November 24, 2011
	"333": {name: "Rubik's Cube", scrambler: scramble_333},
	"444": {name: "4x4 Cube", scrambler: scramble_444},
	"555": {name: "5x5 Cube", scrambler: scramble_555},
	"222": {name: "2x2 Cube", scrambler: scramble_222},
	"333bf": {name: "3x3 blindfolded", scrambler: scramble_333},
	"333oh": {name: "3x3 one-handed", scrambler: scramble_333},
	"333fm": {name: "3x3 fewest moves", scrambler: scramble_333},
	"333ft": {name: "3x3 with feet", scrambler: scramble_333},
	"minx": {name: "Megaminx", scrambler: scramble_minx},
	"pyram": {name: "Pyraminx", scrambler: scramble_pyram},
	"sq1": {name: "Square-1", scrambler: scramble_sq1},
	"clock": {name: "Rubik's Clock", scrambler: scramble_clock},
	"666": {name: "6x6 Cube", scrambler: scramble_666},
	"777": {name: "7x7 Cube", scrambler: scramble_777},
	//"magic": {name: "Rubik's Magic", scrambler: scramble_magic},
	//"mmagic": {name: "Master Magic", scrambler: scramble_mmagic},
	"444bf": {name: "4x4 blindfolded", scrambler: scramble_444},
	"555bf": {name: "5x5 blindfolded", scrambler: scramble_555},
	//"333mbf": {name: "3x3 multi blind", scrambler: scramble_333},
	
	// Unofficial events
	//"skewb": {name: "Skewb", scrambler: scramble_skewb},
}

var console;
if (typeof window !== "undefined") {
	console = window.console;
}
else {
	console = {};
	console.log = function() {};
	console.error = function() {};
}

var initialize = function() {

	for (eventID in events) {
		events[eventID].initialized = false;
	}

	postMessage({
		action: "initialized",
		info: "Successfully initialized web worker."
	});
}

var initializeEventOnce = function(eventID) {
	if (!events[eventID].initialized) {
		events[eventID].scrambler.initialize();
		events[eventID].initialized = true;
	}
}

var initializeEvent = function(eventID) {
	events[eventID].scrambler.initialize();
	console.log("HEY THERE, FELLA.");
	postMessage({
		action: "initializedEvent",
		info: "Successfully initialized event " + eventID + "."
	});
}

var getRandomScramble = function (eventID, returnData) {

	postMessage({
		action: "get_random_scramble_starting",
		return_data: returnData
	});

	initializeEventOnce(eventID);
	var scramble = events[eventID].scrambler.getRandomScramble();
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
			initialize();
		break;

		case "initialize_event":
			initialize(e.data.eventID);
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