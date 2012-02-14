"use strict";
Math.random = undefined; // So we won't use it by accident.

var web_worker_manager = (function() {

	importScripts("../lib/mersennetwister.js");

	var console;
	if (typeof window !== "undefined") {
		console = window.console;
	}
	else {
		console = {};
		// TODO: Handle multiple args.
		console.log = function(data) {
			postMessage({
				action: "console_log",
				data: data
			});
		};
		console.error = function(data) {
			postMessage({
				action: "console_error",
				data: data
			});
		};
	}

	var workerID;
	var workerScramblers = {};
	var importedFiles = [];
	var workerScramblersInitialized = {};
	var initialized = false;
	var randomSource = undefined;

	var initialize = function(iniWorkerID, eventIDs, auto_ini, scramblerFiles, randomSeed) {

		workerID = iniWorkerID;

		randomSource = new MersenneTwisterObject(randomSeed);

		for (var i = 0; i < eventIDs.length; i++) {
			var eventID = eventIDs[i];

			// Import script if not already done. (Allows multiple scramblers to use the same scrambler, like 3x3x3 events.)
			if (importedFiles.indexOf(scramblerFiles[eventID]) === -1) {
				importScripts(scramblerFiles[eventID]);
				importedFiles.push(scramblerFiles[eventID]);
			}

			workerScramblers[eventID] = scramblers[eventID];

			if (auto_ini) {
				workerScramblers[eventID].initialize(null, randomSource, console.log);
				workerScramblersInitialized[eventID] = true;
			}
			else {
				workerScramblersInitialized[eventID] = false;
			}

		}

		initialized = true;

		postMessage({
			action: "initialized",
			info: ["Successfully initialized web worker for [" + eventIDs.toString() + "]."]
		});
	}

	var getRandomScramble = function (eventID, returnData) {

		if (!initialized) {
			console.error("Web worker for " + eventID + " is not initialized yet.");
		}

		if (!workerScramblersInitialized[eventID]) {

			postMessage({
				action: "get_random_scramble_initializing_scrambler",
				return_data: returnData
			});

			workerScramblers[eventID].initialize(null, randomSource, console.log);

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
		try {
			switch(e.data.action) {
				case "initialize":
					initialize(e.data.worker_id, e.data.event_ids, e.data.auto_ini, e.data.scrambler_files, e.data.random_seed);
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
		catch (e) {
			postMessage({action: "message_exception", data: [e.toString(), JSON.stringify(e)]});
		}
	}

	return {
		console: console,
		onmessage: onmessage
	}
})();

var console = web_worker_manager.console;
onmessage = web_worker_manager.onmessage;
