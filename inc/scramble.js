//TODO: color animation
// Rename trID variable to scramle_ID


// Offline Caching
window.applicationCache.addEventListener('updateready', function() {
	window.applicationCache.swapCache();
	setTimeout(function() {location.reload(true)}, 1000); // Function.prototype.bind doesn't work for this, anyhow... :-(
}, false);

window.applicationCache.addEventListener('downloading', function() {
	document.body.innerHTML="<br><br><h1>Updating cache...<br><br>Page will reload in a moment.</h1>";
	document.body.style.setProperty("background", "#00C0C0");
	scramble.terminateWebWorkers(); // Call this last in case it's not defined yet.
}, false);


// Implementation of bind() for Safari.
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP
                                 ? this
                                 : oThis || window,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

scramble = (function() {

	var version = "December 23, 2011";

	var eventsPerRow = 5;
	var defaultNumGroups = 1;

	var usingWebWorkers = false;

	var defaultDrawingWidth = 200;
	var defaultDrawingHeight = 120;

	var events = {
		// Official WCA events as of November 24, 2011
		"333": {name: "Rubik's Cube", scrambler_file: "scramble_333.js", default_round: ["avg", 5], default_num_rounds: 1, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"444": {name: "4x4 Cube", scrambler_file: "scramble_NNN.js", default_round: ["avg", 5], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"555": {name: "5x5 Cube", scrambler_file: "scramble_NNN.js", default_round: ["avg", 5], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"222": {name: "2x2 Cube", scrambler_file: "scramble_222.js", default_round: ["avg", 5], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"333bf": {name: "3x3 blindfolded", scrambler_file: "scramble_333.js", default_round: ["best", 3], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"333oh": {name: "3x3 one-handed", scrambler_file: "scramble_333.js", default_round: ["avg", 5], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"333fm": {name: "3x3 fewest moves", scrambler_file: "scramble_333.js", default_round: ["best", 2], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1}, //TODO: FCF support
		"333ft": {name: "3x3 with feet", scrambler_file: "scramble_333.js", default_round: ["avg", 5], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"minx": {name: "Megaminx", scrambler_file: "scramble_minx.js", default_round: ["avg", 5], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"pyram": {name: "Pyraminx", scrambler_file: "scramble_pyram.js", default_round: ["avg", 5], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"sq1": {name: "Square-1", scrambler_file: "scramble_sq1.js", default_round: ["avg", 5], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"clock": {name: "Rubik's Clock", scrambler_file: "scramble_clock.js", default_round: ["avg", 5], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"666": {name: "6x6 Cube", scrambler_file: "scramble_NNN.js", default_round: ["mean", 3], default_num_rounds: 0, drawing_dimensions: [200, 150], scrambles_per_row: 1},
		"777": {name: "7x7 Cube", scrambler_file: "scramble_NNN.js", default_round: ["mean", 3], default_num_rounds: 0, drawing_dimensions: [200, 150], scrambles_per_row: 1},
		//"magic": {name: "Rubik's Magic", scrambler_file: "scramble_magic.js", default_round: ["avg", 5], default_num_rounds: 0},
		//"mmagic": {name: "Master Magic", scrambler_file: "scramble_mmagic.js", default_round: ["avg", 5], default_num_rounds: 0},
		"444bf": {name: "4x4 blindfolded", scrambler_file: "scramble_NNN.js", default_round: ["best", 3], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"555bf": {name: "5x5 blindfolded", scrambler_file: "scramble_NNN.js", default_round: ["best", 3], default_num_rounds: 0, drawing_dimensions: [200, 120], scrambles_per_row: 1},
		"333mbf": {name: "3x3 multi blind", scrambler_file: "scramble_333.js", default_round: ["mbf", 20], default_num_rounds: 0, drawing_dimensions: [80, 60], scrambles_per_row: 2}, //TODO: 3x3x3 with smaller images?
		
		// Unofficial events
		//"skewb": {name: "Skewb", scrambler_file: "scramble_skewb.js", default_round: ["avg", 5]},
	}

	// Javascript object don't retain key order in all browsers.
	var eventOrder = [
		"222",
		"333",
		"444",
		"555",
		"666",
		"777",
		"333bf",
		"333oh",
		"333fm",
		"333ft",
		"minx",
		"pyram",
		"sq1",
		"clock",
		//"magic",
		//"mmagic",
		"444bf",
		"555bf",
		"333mbf",
		//"skewb"
	];

	var workerGroups = [
		{events: ["333", "333bf", "333oh", "333fm", "333ft", "333mbf"], auto_ini: true},
		{events: ["222", "444", "555", "666", "777", "444bf", "555bf", "minx", "pyram", "clock"], auto_ini: false},
		{events: ["sq1"], auto_ini: false}
	];

	// alg.garron.us puzzle ID mapping.
	eventIDToAlgPuzzleID = {
		"333": "3x3x3",
		"444": "4x4x4",
		"555": "5x5x5",
		"222": "2x2x2",
		"333bf": "3x3x3",
		"333oh": "3x3x3",
		"333fm": "3x3x3",
		"333ft": "3x3x3",
		"333mbf": "3x3x3",
		"666": "6x6x6",
		"777": "7x7x7",
		"444bf": "4x4x4",
		"555bf": "5x5x5",
	}

	var workers = {};

	var roundNames = {
		"avg": "Average of",
		"best": "Best of",
		"combined": "Combined Round of",
		"mean": "Mean of"
	}

	var initialize = function() {
		initializeRandomSource();
		initializeData();
		initializeEventIDSelect();
		initializeWorkers();
	};

	var handleWorkerMessage = function(e) {
		switch(e.data.action) {
			case "initialized":
				console.log("Web worker initialized successfully: " + e.data.info);
			break;

			case "get_random_scramble_starting":
				startScramble(
					e.data.return_data.trID,
					e.data.event_id,
					e.data.return_data.num
				);
			break;

			case "console_log":
				console.log("[Web worker log]", e.data.data);
			break;

			case "console_error":
				console.log("[Web worker error]", e.data.data);
			break;

			case "message_exception":
				console.error("[Web worker exception]", e.data.data);
			break;

			case "initialize_benchmark_response":
				console.log("Benchmark initialized for worker " + e.data.worker_id + ".");
			break;

			case "get_random_scramble_initializing_scrambler":
				iniScramblerNotice(
					e.data.return_data.trID,
					e.data.event_id,
					e.data.return_data.num
				);
			break;

			case "get_random_scramble_response":
				//console.log("Received a " + events[e.data.event_id].name +	 " scramble: " + e.data.scramble.scramble);
				insertScramble(
					e.data.return_data.trID,
					e.data.event_id,
					e.data.return_data.num,
					e.data.scramble.scramble,
					e.data.scramble.state
				);
			break;

			case "echo_response":
				console.log("Echo response:");
				console.log(e.data);
			break;

			default:
				console.error("Unknown message. Action was: " + e.data.action);
			break;
		}
	}

	var initializeWorkers = function() {
		
		// From http://www.html5rocks.com/en/tutorials/workers/basics/#toc-inlineworkers

		if (typeof Worker === "undefined") {
			console.log("No web worker support. :-(");
			return;
		}

		try {

			for (i in workerGroups) {

				var worker = new Worker("inc/web_worker_manager.js");
				var scramblerFiles = {};

				for (j in workerGroups[i].events) {
					events[workerGroups[i].events[j]].worker = worker;
					scramblerFiles[workerGroups[i].events[j]] = "scramblers/" + events[workerGroups[i].events[j]].scrambler_file;
				}
				worker.onmessage = handleWorkerMessage;

				workers[i] = worker;

				worker.postMessage({action: "initialize", worker_id: i, event_ids: workerGroups[i].events, auto_ini: workerGroups[i].auto_ini, scrambler_files: scramblerFiles, random_seed: getRandomSeed()});
			}

			usingWebWorkers = true;

		}
		catch (e) {
			console.log("Starting the web workers failed. This happens with Chrome when run from file://");
			console.log("This was the web worker error:", e);
		}

	}

	var initializeEventIDSelect = function() {

		//var eventIDSelect = document.getElementById("eventID");
		var selectSetsTable = document.getElementById("select_sets");
		var eventAmountsTable = document.getElementById("event_amounts");
		var currentEventAmountsTR;

		for (var i =0; i < eventOrder.length; i++) {
			eventID = eventOrder[i]

			events[eventID].initialized = false;

			if (i % eventsPerRow === 0) {
				currentEventAmountsTR = createNewElement(eventAmountsTable, "tr");
			}

			var eventTD = createNewElement(currentEventAmountsTR, "td", "event_amount_label", null, "" + eventID + ":");

			var val = createNewElement(currentEventAmountsTR, "td", "event_amount_value_td", "");
			var valInput = createNewElement(val, "input", "event_amount_value");
			valInput.setAttribute("value", numCurrentRounds(eventID));
			valInput.setAttribute("id", "amount_value_" + eventID);
			valInput.setAttribute("type", "number");
			valInput.setAttribute("min", "0");
			valInput.setAttribute("onchange", "scramble.changeNumRounds(\"" + eventID + "\", parseInt(this.value));");
			valInput.setAttribute("onmouseup", "scramble.changeNumRounds(\"" + eventID + "\", parseInt(this.value));");
			valInput.setAttribute("onkeyup", "scramble.changeNumRounds(\"" + eventID + "\", parseInt(this.value));");
			valInput.setAttribute("oninput", "scramble.changeNumRounds(\"" + eventID + "\", parseInt(this.value));");
		}
	}


	function getHashParameter(name, alt) {
		var results = RegExp( "[#&]"+name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]")+"=([^&#<]*)" ).exec( window.location.href );
		if (results == null) {
			return alt;
		}
		else {
			return results[1];
		}
	};


	var initializeData = function() {

		var competitionNameHash = getHashParameter("competition_name", null);

		if (competitionNameHash !== null) {
			var competitionName = decodeURIComponent(competitionNameHash);
			document.getElementById("competitionName").value = competitionName;
		}

		var roundsHash = getHashParameter("rounds", null);

		if (roundsHash === null) {
			for (i in eventOrder) {
				eventID = eventOrder[i]
				for (var i = numCurrentRounds(eventID); i < events[eventID].default_num_rounds; i++) {
					addRound(eventID);
				}
			}
		}
		else {
			var rounds = JSON.parse(decodeURIComponent(roundsHash));
			resetRounds();
			addRounds(rounds);
		}

		updateHash();
	}

	var updateHash = function() {

		var competitionName = encodeURIComponent(document.getElementById('competitionName').value);
		var roundsHash = encodeURIComponent(JSON.stringify(getRounds()));
		location.hash = "#competition_name=" + competitionName + "&rounds=" + roundsHash;
	}

	var resetRounds = function() {
		document.getElementById("events_tbody").innerHTML = "";
	}

    var addRounds = function(rounds) {
    	for (var i in rounds) {
	    	addRound(rounds[i][0], rounds[i][1], rounds[i][2], rounds[i][3]);
	    }
    }

    var getRounds = function() {
    	
		var rounds = [];

		var eventsTBody = document.getElementById("events_tbody").children;

		for (var i = 0; i < eventsTBody.length; i++) {

			var tr = eventsTBody[i];

			var eventID = tr.getAttribute("data-event-id");

			var roundName = tr.getElementsByClassName("round_name")[0].value;
			var numSolves = parseInt(tr.getElementsByClassName("num_solves")[0].value);

			var numGroups = parseInt(tr.getElementsByClassName("num_groups")[0].value);

			rounds.push([eventID, roundName, numGroups, numSolves]); // TODO Find a better way to handle multi-line round names.
		}

		return rounds;
    }

    var getPages = function() {

    	var rounds = getRounds();
    	pages = [];

		for (var i = 0; i < rounds.length; i++) {

			var eventID = rounds[i][0];
			var roundName = rounds[i][1];
			var numGroups = rounds[i][2];
			var numSolves = rounds[i][3];

			for (var j = 1; j <= numGroups; j++) {
				var groupString = ((numGroups === 1) ? ("") : ("<br>Group " + intToLetters(j)));
				pages.push([eventID, roundName + groupString, numSolves]); // TODO Find a better way to handle multi-line round names.
			}
		}

		return pages;
    }

	var numCurrentRounds = function(eventID) {
		return document.getElementsByClassName("event_tr_" + eventID).length;
	}

	var changeNumRounds = function(eventID, newNum) {
		var currentNum = numCurrentRounds(eventID);

		if (currentNum < newNum) {
			for (var i = 0; i < newNum - currentNum; i++) {
				addRound(eventID);
			}
		}
		else if (newNum < currentNum) {
			for (var i = 0; i < currentNum - newNum; i++) {
				removeLastRound(eventID);
			}
		}

		if (parseInt(document.getElementById("amount_value_" + eventID).value) !== newNum) {
			document.getElementById("amount_value_" + eventID).value = newNum;
		}

		updateHash();
	}

	var removeRound = function(eventID, trID) {
		document.getElementById("events_tbody").removeChild(document.getElementById(trID));
		document.getElementById("amount_value_" + eventID).value = numCurrentRounds(eventID);

		updateHash();
	}

	var removeLastRound = function(eventID) {
		var rounds = document.getElementsByClassName("event_tr_" + eventID);
		var lastRound = rounds[rounds.length - 1];
		document.getElementById("events_tbody").removeChild(lastRound);
	}

	var addRound = function(eventID, roundNameOpt, numGroupsOpt, numSolvesOpt) {

		var roundName = roundNameOpt;
		if (roundNameOpt === undefined) {
			roundName = "Round " + (numCurrentRounds(eventID)+1);
		}

		var numGroups = numGroupsOpt;
		if (numGroupsOpt === undefined) {
			numGroups = defaultNumGroups;
		}

		var numSolves = numSolvesOpt;
		if (numSolvesOpt === undefined) {
			numSolves = events[eventID].default_round[1];
		}

		var eventTBody = document.getElementById("events_tbody");


		var newEventTR_ID = nextID();
		var newEventTR = createNewElement(eventTBody, "tr", "event_tr_" + eventID, newEventTR_ID);
			newEventTR.setAttribute("data-event-id", eventID);

		var nameTD = createNewElement(newEventTR, "td", "event_name", null, events[eventID].name);
		
		var roundNameTD = createNewElement(newEventTR, "td");
		var roundNameInput = createNewElement(roundNameTD, "input", "round_name");
			roundNameInput.setAttribute("value", roundName);

		var numSolvesTD = createNewElement(newEventTR, "td", null);
		var numSolvesInput = createNewElement(numSolvesTD, "input", "num_groups");
			numSolvesInput.setAttribute("type", "number");
			numSolvesInput.setAttribute("value", numGroups);
			numSolvesInput.setAttribute("min", "1");

		var numSolvesTD = createNewElement(newEventTR, "td", null);
		var numSolvesInput = createNewElement(numSolvesTD, "input", "num_solves");
			numSolvesInput.setAttribute("type", "number");
			numSolvesInput.setAttribute("value", numSolves);
			numSolvesInput.setAttribute("min", "1");

		var removeTD = createNewElement(newEventTR, "td", "round_remove");
		var removeButton = createNewElement(removeTD, "button", null, null, "&nbsp;&nbsp;X&nbsp;&nbsp;");
			removeButton.setAttribute("onclick", "scramble.removeRound(\"" + eventID + "\", \"" + newEventTR_ID + "\")");
	}

	var randomSource = undefined;

	var initializeRandomSource = function() {
		
		var numEntropyValuesPerSource = 32;
		var entropy = [];

		// Get some pseudo-random numbers for entropy.
		for (var i = 0; i < numEntropyValuesPerSource; i++) {
			entropy.push(Math.floor(Math.random()*0xffffffff));
		}

		// Get some even better pseudo-random numbers for entropy if we can.
		try {
			var cryptoEntropy = new Uint8Array(numEntropyValuesPerSource);

			window.crypto.getRandomValues(cryptoEntropy);
			
			// Uint8Array doesn't haave a .map(...) method.
			for (var i = 0; i < numEntropyValuesPerSource; i++) {
				entropy.push(cryptoEntropy[i]);
			}

			console.log("Successfully used crypto for additional randomness.");	
		}
		catch (e) {
			console.log("Unable to use crpyto for additional randomness (that's okay, though).", e);
		}

		// We use the date to get the main entropy.
		var seed = new Date().getTime();
		

		// Make sure we don't accidentally use deterministic initialization.
		if (isFinite(seed)) {
			randomSource = new MersenneTwisterObject(seed, entropy);
			console.log("scramble.js: Seeded Mersenne Twister.");
			Math.random = undefined; // So we won't use it by accident.

		}
		else {
			randomSource = Math;
  			console.log("WARNING: Seeding Mersenne Twister did not work. Falling back to Math.random().");
  		}
	}

	// For seeding the workers.
	var getRandomSeed = function() {
		return (new Date().getTime() + Math.floor(randomSource.random()*0xffffffff));
	}


	var createNewElement = function(elementToAppendTo, type, className, id, content) {

		var newElement = document.createElement(type);
		if (className) {
			newElement.setAttribute("class", className);
		}
		if (content) {
			newElement.innerHTML = content
		}
		if (id) {
			newElement.setAttribute("id", id);
		}
		elementToAppendTo.appendChild(newElement);
		return newElement;
	};

	var doneCreatingRounds = false;
	var scramblesStillAwaiting = [];

	var currentID = "0";

	var nextID = function() {
		return "auto_id_" + (currentID++);
	}

	var startScramble = function(trID, eventID, num) {
					
		var scrambleTD = document.getElementById(trID + "_scramble");
		scrambleTD.innerHTML = "Generating scramble #" + num + "...";
		scrambleTD.classList.remove("loading_scrambler");
		scrambleTD.classList.add("loading_scramble");
	}

	var iniScramblerNotice = function(trID, eventID, num) {
					
		var scrambleTD = document.getElementById(trID + "_scramble");
		scrambleTD.innerHTML = "Initializing scrambler...";
		scrambleTD.classList.add("loading_scrambler");
	}

	// Specific to alg.garron.us right now.
	var scrambleLink = function(eventID, scramble) {

		var puzzleID = eventIDToAlgPuzzleID[eventID];

		if (typeof puzzleID === "undefined") {
			return scramble;
		}

		return "<a href=\"http://alg.garron.us/?ini=" + encodeURIComponent(scramble) + "&cube=" + puzzleID + "&name=" + encodeURIComponent(events[eventID].name + " Scramble") + "&notation=WCA\" target=\"_blank\" class=\"scramble_link\">" + scramble + "</a>";
	}

	var insertScramble = function(trID, eventID, num, scramble, state) {

		if (usingWebWorkers) {

			var index = scramblesStillAwaiting.indexOf(trID);
			scramblesStillAwaiting.splice(index, 1)

			var stillRemainingString = " " + scramblesStillAwaiting.length + " scramble" + (scramblesStillAwaiting.length === 1 ? "" : "s") + " still remaining overall."
			if (!doneCreatingRounds) {
				stillRemainingString = " At least" + stillRemainingString;
			}

			addUpdateSpecific("Generated " + eventID + " scramble #" + num + " for some round." + stillRemainingString);

			if (scramblesStillAwaiting.length === 0 && doneCreatingRounds) {
				addUpdateGeneral("\n\nDone generating all scrambles for all rounds.\n");
			}
		}
					
		var scrambleTD = document.getElementById(trID + "_scramble");
		scrambleTD.classList.remove("loading_scramble");
		var scrambleHTML = scrambleLink(eventID, scramble);
		scrambleTD.innerHTML = scrambleHTML;

		var drawingTD = document.getElementById(trID + "_drawing");
		var drawingWidth = events[eventID].drawing_dimensions[0];
		var drawingHeight = events[eventID].drawing_dimensions[1];
		scramblers[eventID].drawScramble(drawingTD, state, drawingWidth, drawingHeight);
	}

	var generate_scramble_set = function(continuation, competitionName, tBody, eventID, scrambler, num, numTotal, options) {
		
		var scrambleTR = createNewElement(tBody, "tr");

		var scramblesInThisRow = Math.min(events[eventID].scrambles_per_row, numTotal - num + 1);

		for (var i = 0; i < scramblesInThisRow; i++) {

			var trID = nextID();
		
			createNewElement(scrambleTR, "td", "number number_" + eventID, trID + "_number", "" + (num + i) + ".");
			createNewElement(scrambleTR, "td", "scramble scramble_" + eventID, trID + "_scramble",  "[Space for Scramble #" + num + "]");
			createNewElement(scrambleTR, "td", "drawing drawing_" + eventID, trID + "_drawing");

			if (usingWebWorkers) {

				scramblesStillAwaiting.push(trID);

				console.log(events[eventID]);

				events[eventID].worker.postMessage({
					action: "get_random_scramble",
					event_id: eventID,
					return_data: {
						trID: trID,
						num: num
					}
				});
			}
			else {
				var scramble = scrambler.getRandomScramble();
				insertScramble(trID, eventID, num, scramble.scramble, scramble.state);
			}
		}

		var call;
		if (num < numTotal) {
			call = generate_scramble_set.bind(null, continuation, competitionName, tBody, eventID, scrambler, num + scramblesInThisRow, numTotal, options);
		}
		else {
			hideUpdatesSpecific();
			call = continuation;
		}
		setTimeout(call, 0);
	}

	var add_page = function(continuation, competitionName, eventID, roundName, numScrambles) {

		var pages = document.getElementById("scramble_sets");

		if (!events[eventID]) {
			var newPage = createNewElement(pages, "div", "unupported", null, "Sorry, but \"" + eventID + "\" scrambles are not currently supported.");
			return;
		}

		var scrambler = scramblers[eventID];

		// Create a new Page.
		
		var newPage = createNewElement(pages, "div", "scramble_set");

			// Header Table

			var newInfoTable = createNewElement(newPage, "table", "info_table");
				var newInfoTHead = createNewElement(newInfoTable, "thead");
					var newInfoTR = createNewElement(newInfoTHead, "tr");
						
						createNewElement(newInfoTR, "td", "puzzle_name", null, events[eventID].name);
						createNewElement(newInfoTR, "td", "competition_name", null, competitionName);
						createNewElement(newInfoTR, "td", "round_name", null, roundName);

			// Scrambles Table

			var newScramblesTable = createNewElement(newPage, "table", "scramble_table");
				var newScramblesTBody = createNewElement(newScramblesTable, "tbody");
					
			// Footer Table

			var newFooterTable = createNewElement(newPage, "table", "footer_table");
				var newFooterTHead = createNewElement(newFooterTable, "thead");
					var newFooterTR = createNewElement(newFooterTHead, "tr");

						createNewElement(newFooterTR, "td", null, null, '<u>Scrambles generated at:</u><br>' + (new Date().toString()));
						createNewElement(newFooterTR, "td", null, null, '<div style="text-align: right;"><u>' + events[eventID].name + ' Scrambler Version</u><br>' + scrambler.version + '</div>');
						createNewElement(newFooterTR, "td", null, null, '<img src="inc/wca_logo.svg" class="wca_logo">');
		
		// Generate those scrambles!
		
		addUpdateGeneral("Generating " + numScrambles + " scramble" + ((numScrambles === 1) ? "" : "s") + " for " + events[eventID].name + ": " + roundName + "");
		resetUpdatesSpecific("Details for " + events[eventID].name + ": " + roundName);
		
		var nextContinuation = generate_scramble_set.bind(null, continuation, competitionName, newScramblesTBody, eventID, scrambler, 1, numScrambles, {});
		var call;
		if (!usingWebWorkers && !events[eventID].initialized) {
		    addUpdateSpecific("Initializing " + events[eventID].name + " scrambler (only needs to be done once).");

		    var statusCallback = function(str) {
		    	addUpdateSpecific(str);

		    }

			call = scrambler.initialize.bind(null, nextContinuation, randomSource, statusCallback);
			events[eventID].initialized = true;
		}
		else {

			if (usingWebWorkers) {
			}
			else if (events[eventID].initialized) {
		    	addUpdateSpecific("" + events[eventID].name + " scrambler already initialized.");
			}
			call = nextContinuation;
		}
		setTimeout(call, 0);
	};

	var generate_scrambles = function(callback, competitionName, rounds) {

		var nextContinuation;
		if (rounds.length > 1) {
			nextContinuation = generate_scrambles.bind(null, callback, competitionName, rounds.slice(1));
		}
		else {
			nextContinuation = function(){

				if (usingWebWorkers) {
					addUpdateGeneral("Done creating all rounds. " + scramblesStillAwaiting.length + " scrambles still need to be filled in.");
					doneCreatingRounds = true;
				}
				else {
					addUpdateGeneral("Done creating all rounds.");
				}

				setTimeout(callback, 0);
			};
		}

		add_page(nextContinuation, competitionName, rounds[0][0], rounds[0][1], rounds[0][2]);
	}

	var hideElement = function(el) {
		el.style.display = "none";
	}

	var showElement = function(el) {
		el.style.display = "block";
	}

	var showUpdates = function() {
		showElement(document.getElementById("updates"));
	}

	var hideUpdates = function() {
		hideElement(document.getElementById("updates"));
	}

	var showUpdatesSpecific = function() {
		showElement(document.getElementById("updates_specific"));
	}

	var hideUpdatesSpecific = function() {
		hideElement(document.getElementById("updates_specific"));
	}

	var hideInterface = function() {
		var interfaceElements = document.getElementsByClassName("interface");
		for (var i=0; i < interfaceElements.length; i++) {
			hideElement(interfaceElements[i]);
		}
	}

	var showInterface = function() {
		var interfaceElements = document.getElementsByClassName("interface");
		for (var i=0; i < interfaceElements.length; i++) {
			hideElement(interfaceElements[i]);
		}
	}

	var benchmarkMode = false;
	var benchmarkString = "";

	var currentTime = function() {
		return (new Date()).getTime();
	}

	var updatesGeneralStartTime;
	var updatesGeneralLastTime;
	var resetUpdatesGeneral = function() {

		var updatesGeneralDiv = document.getElementById("updates_general");
		updatesGeneralDiv.innerHTML = "";
		createNewElement(updatesGeneralDiv, "h2", null, null, "Updates");

		showUpdates();

		updatesGeneralLastTime = updatesGeneralStartTime = currentTime();
	}

	var updatesSpecificStartTime;
	var updatesSpecificLastTime;
	var resetUpdatesSpecific = function(str) {

		var updatesSpecificDiv = document.getElementById("updates_specific");
		updatesSpecificDiv.innerHTML = "";
		createNewElement(updatesSpecificDiv, "h2", null, null, str);

		showUpdatesSpecific();

		updatesSpecificLastTime = updatesSpecificStartTime = currentTime();
	}

	var addUpdateGeneral = function(str) {

		console.log(str);
		var updatesGeneralDiv = document.getElementById("updates_general");

		createNewElement(updatesGeneralDiv, "li", null, null, str);

		if (benchmarkMode) {
			var cur = currentTime();
			benchmarkString = "- General [" + (cur - updatesGeneralLastTime) + "ms, " + (cur - updatesGeneralStartTime) + "ms] " + str + "\n" + benchmarkString;
			updatesGeneralLastTime = cur;
			document.getElementById("benchmark_details").innerHTML = "Benchmark In Progress:\n\n" + benchmarkString;
		}
	}

	var addUpdateSpecific = function(str) {

		console.log(str);
		var updatesSpecificDiv = document.getElementById("updates_specific");

		createNewElement(updatesSpecificDiv, "li", null, null, str);

		if (benchmarkMode) {
			var cur = currentTime();
			benchmarkString = "- Detail [" + (cur - updatesSpecificLastTime) + "ms, " + (cur - updatesSpecificStartTime) + "ms, " + (cur - updatesGeneralStartTime) + "ms] " + str + "\n" + benchmarkString;
			updatesSpecificLastTime = cur;
			document.getElementById("benchmark_details").innerHTML = "Benchmark In Progress:\n\n" + benchmarkString;
		}
	}

    // Converts 1, 2, ... to A, B, ..., Z, AA, AB, ..., ZZ, AAA, AAB, ...
    // A bit complicated right now, but should work fine.
	function intToLetters(int) {

      var numDigits;
      var maxForDigits = 1;
      var numWithThisManyDigits = 1;
    
      for (numDigits = 0; maxForDigits <= int; numDigits++) {
        numWithThisManyDigits *= 26;
        maxForDigits += numWithThisManyDigits;
      }
    
      var adjustedInt = int - (maxForDigits - numWithThisManyDigits);
    
      var out = "";
      for (var i = 0; i < numDigits; i++) {
        out = String.fromCharCode(65 + (adjustedInt % 26)) + out;
        adjustedInt = Math.floor(adjustedInt / 26);
      }
      return out;
    };

	var go = function() {

		resetUpdatesGeneral();
		hideInterface();

		var competitionName = document.getElementById('competitionName').value;

		if (competitionName === "") {
			document.title = "Scrambles from Mark 2";
			competitionName = "Mark 2";
		}
		else {
			document.title = "Scrambles for " + competitionName;
		}

		var pages = getPages();

		if (pages.length === 0) {
			addUpdateGeneral("Nothing to do, because there are no rounds to scramble.");
			return;
		}

		addUpdateGeneral("Generating " + pages.length + " round" + ((pages.length === 1) ? "" : "s") + " of scrambles.");

		generate_scrambles(hideUpdates, competitionName, pages);
	};

	var terminateWebWorkers = function() {
		for (var i in workers) {
			workers[i].terminate();
		}
		workers = {};
		console.log("Terminated all web workers.")
	}

	var restartWebWorkers = function() {
		terminateWebWorkers();
		initializeWorkers();
	}

	var benchmark = function(rounds) {

		restartWebWorkers();

		resetUpdatesGeneral();
		resetUpdatesSpecific();
		benchmarkMode = true;

		benchmarkString = "\nBenchmark Settings:\n" + 
			"- Web Workers: " + (usingWebWorkers? "yes" : "no") + "\n" +
			"- Benchmark version: 6 (December 18, 2011)";

		hideInterface();
		document.getElementById("benchmark").style.display="block";
		document.getElementById("updates").style.display="none";

		document.title = "Mark 2 Benchmark v6";

		// Give everyone the same benchmark.
		randomSource = new MersenneTwisterObject(333);

		for (i in workers) {
			workers[i].postMessage({action: "initialize_benchmark", random_seed: Math.floor(randomSource.random()*0xffffffff)});
		}

		var callback = function (){
			//document.getElementById("benchmark_details").innerHTML = "Benchmark Results:\n\nDone!\n\n" + benchmarkString;
		};

		var actualRounds = [
			["222", "Round 2x2x2", 5],
			["333", "Round 3x3x3", 5],
			["444", "Round 4x4x4", 5],
			["555", "Round 5x5x5", 5],
			["666", "Round 6x6x6", 3],
			["777", "Round 7x7x7", 3],
			["clock", "Round Clock", 5],
			["pyram", "Round Pyraminx", 5],
			["minx", "Round Megaminx", 5],
			["sq1", "Round Square-1", 5],
			["333mbf", "Round 3x3x3 Multi Blind",  20],
			["333", "Round 3x3x3 Again",  5]
		];
		if (typeof rounds !== "undefined") {
			actualRounds = rounds;
		}

		generate_scrambles(callback, "Benchmark", actualRounds);
	}

	var printKeyCodes = false;

	var keyDownHandler = function(e) {

		if (printKeyCodes) {
			console.log("Key pressed: " + e.keyCode);
		}

	 	switch (e.keyCode) {

			case 85: // "U" for ">U<pdates".
				showElement(document.getElementById("updates"));
				return true;
				break;

			case 98: // "B" for ">B<enchmark". (And "A>b<out?)
				showElement(document.getElementById("about"));
				return true;
				break;

			case 107: // "K" for "Show >K<eycodes"
				printKeyCodes = true;
				break;
		}
	}

	document.onkeypress = keyDownHandler;
	document.onkeydown = keyDownHandler;

	return {
		version: version,
		events: events,
		initialize: initialize,
		generate_scrambles: generate_scrambles,
		go: go,
		addRound: addRound,
		benchmark: benchmark,
		terminateWebWorkers: terminateWebWorkers,
		removeRound: removeRound,
		changeNumRounds: changeNumRounds,
		updateHash: updateHash
	};
})();