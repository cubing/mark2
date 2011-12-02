
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

	var version = "November 23, 2011";

	var events;
	var eventsPerRow = 4;

	var usingWebWorkers = false;

	var initializeEvents = function()  {
		
		events = {
			// Official WCA events as of November 24, 2011
			"333": {name: "Rubik's Cube", scrambler_file: "scramble_333.js", default_round: ["avg", 5], default_num_rounds: 1},
			"444": {name: "4x4 Cube", scrambler_file: "scramble_NNN.js", default_round: ["avg", 5], default_num_rounds: 0},
			"555": {name: "5x5 Cube", scrambler_file: "scramble_NNN.js", default_round: ["avg", 5], default_num_rounds: 0},
			"222": {name: "2x2 Cube", scrambler_file: "scramble_222.js", default_round: ["avg", 5], default_num_rounds: 0},
			"333bf": {name: "3x3 blindfolded", scrambler_file: "scramble_333.js", default_round: ["best", 3], default_num_rounds: 0},
			"333oh": {name: "3x3 one-handed", scrambler_file: "scramble_333.js", default_round: ["avg", 5], default_num_rounds: 0},
			"333fm": {name: "3x3 fewest moves", scrambler_file: "scramble_333.js", default_round: ["best", 2], default_num_rounds: 0}, //TODO: FCF support
			"333ft": {name: "3x3 with feet", scrambler_file: "scramble_333.js", default_round: ["avg", 5], default_num_rounds: 0},
			"minx": {name: "Megaminx", scrambler_file: "scramble_minx.js", default_round: ["avg", 5], default_num_rounds: 0},
			"pyram": {name: "Pyraminx", scrambler_file: "scramble_pyram.js", default_round: ["avg", 5], default_num_rounds: 0},
			"sq1": {name: "Square-1", scrambler_file: "scramble_sq1.js", default_round: ["avg", 5], default_num_rounds: 0},
			"clock": {name: "Rubik's Clock", scrambler_file: "scramble_clock.js", default_round: ["avg", 5], default_num_rounds: 0},
			"666": {name: "6x6 Cube", scrambler_file: "scramble_NNN.js", default_round: ["mean", 3], default_num_rounds: 0},
			"777": {name: "7x7 Cube", scrambler_file: "scramble_NNN.js", default_round: ["mean", 3], default_num_rounds: 0},
			//"magic": {name: "Rubik's Magic", scrambler_file: "scramble_magic.js", default_round: ["avg", 5], default_num_rounds: 0},
			//"mmagic": {name: "Master Magic", scrambler_file: "scramble_mmagic.js", default_round: ["avg", 5], default_num_rounds: 0},
			"444bf": {name: "4x4 blindfolded", scrambler_file: "scramble_NNN.js", default_round: ["best", 3], default_num_rounds: 0},
			"555bf": {name: "5x5 blindfolded", scrambler_file: "scramble_NNN.js", default_round: ["best", 3], default_num_rounds: 0},
			//"333mbf": {name: "3x3 multi blind", scrambler_file: "scramble_333.js", default_round: ["mbf"], default_num_rounds: 0}, //TODO: 3x3x3 with smaller images?
			
			// Unofficial events
			//"skewb": {name: "Skewb", scrambler_file: "scramble_skewb.js", default_round: ["avg", 5]},
		}
	}

	var roundNames = {
		"avg": "Average of",
		"best": "Best of",
		"combined": "Combined Round of",
		"mean": "Mean of"
	}

	var initialize = function() {

		initializeRandomSource();
		initializeEvents();
		document.getElementById("goButton").focus();

		initializeEventIDSelect("333");

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

			case "get_random_scramble_response":
				console.log("Received a " + events[e.data.event_id].name +	 " scramble: " + e.data.scramble.scramble);
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

		if (!Worker) {
			console.log("No web worker support. :-(");
			return;
		}

		try {

			for (eventID in events) {

				var worker = new Worker("inc/web_worker_manager.js");
				events[eventID].worker = worker;
				worker.onmessage = handleWorkerMessage;
				
				console.log("inc/scramblers/" + events[eventID].scrambler_file);
				worker.postMessage({action: "initialize", event_id: eventID, scrambler_file: "scramblers/" + events[eventID].scrambler_file});
			}

			usingWebWorkers = true;

		}
		catch (e) {
			console.log("Starting the web workers failed. This happens with Chrome when run from file://");
		}

	}

	var initializeEventIDSelect = function(defaultSelectedEvent) {

		//var eventIDSelect = document.getElementById("eventID");
		var selectSetsTable = document.getElementById("select_sets");
		var eventAmountsTable = document.getElementById("event_amounts");
		var currentEventAmountsTR;

		var numEvents = 0;
		for (eventID in events) {

			events[eventID].initialized = false;

			/*
			var newOption = createNewElement(eventIDSelect, "option", "", events[eventID].name);
			newOption.setAttribute("value", eventID);
			if (eventID == defaultSelectedEvent) {
				newOption.setAttribute("selected", "true");
			}
			*/

			var newTBody = createNewElement(selectSetsTable, "tbody");
			newTBody.setAttribute("id", "tbody_" + eventID);

			if (numEvents % eventsPerRow == 0) {
				currentEventAmountsTR = createNewElement(eventAmountsTable, "tr");
			}

			createNewElement(currentEventAmountsTR, "td", "event_amount_id_td", eventID);

			var val = createNewElement(currentEventAmountsTR, "td", "event_amount_value_td", "");
			var valInput = createNewElement(val, "input", "event_amount_value");
				valInput.setAttribute("value", events[eventID].default_num_rounds);
				valInput.setAttribute("id", "amount_value_" + eventID);
				valInput.setAttribute("type", "number");
				valInput.setAttribute("min", "0");
				valInput.setAttribute("onchange", "scramble.changeNumRounds(\"" + eventID + "\");");
				valInput.setAttribute("onclick", "scramble.changeNumRounds(\"" + eventID + "\");");


			changeNumRounds(eventID);


			numEvents++;
		}
	}

	var changeNumRounds = function(eventID) {

		var eventTBody = document.getElementById("tbody_" + eventID);
		var prevNum = eventTBody.children.length;
		var num = document.getElementById("amount_value_"+eventID).value;

		if (num > prevNum) {
			for (var i = 0; i < num - prevNum; i++) {
				addRound(eventID, "Round " + (prevNum+i+1));
			}
		}
		else if (prevNum > num) {
			for (var i = 0; i < prevNum - num; i++) {
				eventTBody.removeChild(eventTBody.lastChild);
			}
		}
		
	}

	var addRound = function(eventID, roundName) {
		var eventTBody = document.getElementById("tbody_" + eventID);
		var newEventTR = createNewElement(eventTBody, "tr");

		var nameTD = createNewElement(newEventTR, "td", "event_name", events[eventID].name);
		
		var roundNameTD = createNewElement(newEventTR, "td");
		var roundNameInput = createNewElement(roundNameTD, "input", "round_name");
			roundNameInput.setAttribute("value", roundName);

		var roundTypeTD = createNewElement(newEventTR, "td");
		var roundTypeSelect = createNewElement(roundTypeTD, "select", "round_type");
			for (typeID in roundNames) {
				var roundTypeOption = createNewElement(roundTypeSelect, "option", "", roundNames[typeID]);
					roundTypeOption.setAttribute("value", typeID);	
			}
			roundTypeSelect.value = events[eventID].default_round[0];

		var numSolvesTD = createNewElement(newEventTR, "td");
		var numSolvesInput = createNewElement(numSolvesTD, "input", "num_solves");
			numSolvesInput.setAttribute("type", "number");
			numSolvesInput.setAttribute("value", events[eventID].default_round[1]);
			numSolvesInput.setAttribute("min", "0");

		var removeTD = createNewElement(newEventTR, "td");
		var removeButton = createNewElement(removeTD, "button", "", "X");
			removeButton.setAttribute("onclick", "this.parentElement.parentElement.parentElement.removeChild(this.parentElement.parentElement)");
	}

	var randomSource = Math;

	var initializeRandomSource = function() {
		
		console.log("scramble.js: Seeding Mersenne Twister.");

		// We use the date the the native PRNG to get some entropy.
		var seed = 1000;//new Date().getTime() + Math.floor(Math.random()*0xffffffff);
		
		// Make sure we don't actually use deterministic initialization.
		if (isFinite(seed)) {
			randomSource = new MersenneTwisterObject(seed);
		}
		else {
  			console.log("WARNING: Seeding Mersenne Twister did not work. Falling back to Math.random().");
  		}
	}


	var createNewElement = function(elementToAppendTo, type, className, content) {
		if (elementToAppendTo == "222") {
			console.log("ffff");
		}

		var newElement = document.createElement(type);
		if (className) {
			newElement.setAttribute("class", className);
		}
		if (content) {
			newElement.innerHTML = content
		}
		elementToAppendTo.appendChild(newElement);
		return newElement;
	};

	var currentID = "0";

	var nextID = function() {
		return "auto_id_" + (currentID++);
	}

	var startScramble = function(trID, eventID, num) {
					
		var scrambleTR = document.getElementById(trID);
		scrambleTR.innerHTML = "";
		var tempTD = createNewElement(scrambleTR, "td", "loading", "Generating scramble #" + num + "...");
			tempTD.setAttribute("colspan", 3);
	}

	var insertScramble = function(trID, eventID, num, scramble, state) {

		if (usingWebWorkers) {
			addUpdateSpecific("Generated " + eventID + " scramble #" + num + " for some round.");
		}
					
		var scrambleTR = document.getElementById(trID);
		scrambleTR.innerHTML = "";
		createNewElement(scrambleTR, "td", "", "" + num + ".");
		createNewElement(scrambleTR, "td", "scramble_" + eventID, scramble);
		var drawingTD = createNewElement(scrambleTR, "td", "drawing");
		//var drawingCenter = createNewElement(drawingTD, "center"); // It's 2011, and there's still not a better way to center this. :-/

		scramblers[eventID].drawScramble(drawingTD, state);
	}

	var generate_scramble_set = function(continuation, competitionName, tBody, eventID, scrambler, num, numTotal, options) {
		
		//addUpdateSpecific("Generating scramble #" + num + " of " + numTotal + ".");

		var scrambleTR = createNewElement(tBody, "tr");
		var trID = nextID();
		scrambleTR.setAttribute("id", trID);

		if (usingWebWorkers) {

			var tempTD = createNewElement(scrambleTR, "td", "", "[Space for Scramble #" + num + "]");
			tempTD.setAttribute("colspan", 3);

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

		var call;
		if (num < numTotal) {
			call = generate_scramble_set.bind(null, continuation, competitionName, tBody, eventID, scrambler, num+1, numTotal, options);
		}
		else {
			hideUpdatesSpecific();
			call = continuation;
		}
		setTimeout(call, 0);
	}

	var initializeEvent = function(eventID) {
		//worker.postMessage({action: "initialize_event", eventID: eventID});
	}

	var add_page = function(continuation, competitionName, eventID, roundName, numScrambles) {

		var pages = document.getElementById("scramble_sets");

		if (!events[eventID]) {
			var newPage = createNewElement(pages, "div", "unupported", "Sorry, but \"" + eventID + "\" scrambles are not currently supported.");
			return;
		}

		var scrambler = scramblers[eventID];

		// Create a new Page.
		
		var newPage = createNewElement(pages, "div", "scramble_set");

			// Header Table

			var newInfoTable = createNewElement(newPage, "table", "info_table");
				var newInfoTHead = createNewElement(newInfoTable, "thead");
					var newInfoTR = createNewElement(newInfoTHead, "tr");
						
						createNewElement(newInfoTR, "td", "puzzle_name", events[eventID].name);
						createNewElement(newInfoTR, "td", "competition_name", competitionName);
						createNewElement(newInfoTR, "td", "round_name", roundName);

			// Scrambles Table

			var newScramblesTable = createNewElement(newPage, "table", "scramble_table");
				var newScramblesTBody = createNewElement(newScramblesTable, "tbody");
					
			// Footer Table

			var newFooterTable = createNewElement(newPage, "table", "footer_table");
				var newFooterTHead = createNewElement(newFooterTable, "thead");
					var newFooterTR = createNewElement(newFooterTHead, "tr");

						createNewElement(newFooterTR, "td", "", '<u>Scrambles generated at:</u><br>' + (new Date().toString()));
						createNewElement(newFooterTR, "td", "", '<div style="text-align: right;"><u>' + events[eventID].name + ' Scrambler Version</u><br>' + scrambler.version + '</div>');
						createNewElement(newFooterTR, "td", "", '<img src="inc/wca_logo.svg" class="wca_logo">');
		
		// Generate those scrambles!
		
		addUpdateGeneral("Generating " + numScrambles + " scramble" + ((numScrambles == 1) ? "" : "s") + " for " + events[eventID].name + ": " + roundName + "");
		resetUpdatesSpecific("Details for " + events[eventID].name + ": " + roundName);
		
		var nextContinuation = generate_scramble_set.bind(null, continuation, competitionName, newScramblesTBody, eventID, scrambler, 1, numScrambles, {});
		var call;
		if (!usingWebWorkers && !events[eventID].initialized) {
		    addUpdateSpecific("Initializing " + events[eventID].name + " scrambler (only needs to be done once).");

		    var statusCallback = function(str) {
		    	addUpdateSpecific(str);

		    }
		    //initializeEvent(eventID);

			call = scrambler.initialize.bind(null, nextContinuation, statusCallback);
			events[eventID].initialized = true;
		}
		else {

			if (usingWebWorkers) {
			    if (scrambler.initializeDrawing) {
			    	console.log("Initializing drawing code for " + events[eventID].name + ".");
			    	scrambler.initializeDrawing();
			    }
			}

		    addUpdateSpecific("" + events[eventID].name + " scrambler already initialized.");
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
				addUpdateGeneral("Done scrambling all events.");
				setTimeout(callback, 0);
			};
		}

		document.title = "Scrambles for " + competitionName;

		add_page(nextContinuation, competitionName, rounds[0][0], rounds[0][1], rounds[0][2]);
	}

	var showUpdates = function() {
		document.getElementById("updates").style.display = "block";
	}

	var hideUpdates = function() {
		document.getElementById("updates").style.display = "none";
	}

	var showUpdatesSpecific = function() {
		document.getElementById("updates_specific").style.display = "block";
	}

	var hideUpdatesSpecific = function() {
		document.getElementById("updates_specific").style.display = "none";
	}

	var hideInterface = function() {
		var interfaceElements = document.getElementsByClassName("interface");
		for (var i=0; i < interfaceElements.length; i++) {
			interfaceElements[i].style.display = "none";
		}
	}

	var showInterface = function() {
		var interfaceElements = document.getElementsByClassName("interface");
		for (var i=0; i < interfaceElements.length; i++) {
			interfaceElements[i].style.display = "none";
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
		createNewElement(updatesGeneralDiv, "h2", "", "Updates");

		showUpdates();

		updatesGeneralLastTime = updatesGeneralStartTime = currentTime();
	}

	var updatesSpecificStartTime;
	var updatesSpecificLastTime;
	var resetUpdatesSpecific = function(str) {

		var updatesSpecificDiv = document.getElementById("updates_specific");
		updatesSpecificDiv.innerHTML = "";
		createNewElement(updatesSpecificDiv, "h2", "", str);

		showUpdatesSpecific();

		updatesSpecificLastTime = updatesSpecificStartTime = currentTime();
	}

	var addUpdateGeneral = function(str) {

		console.log(str);
		var updatesGeneralDiv = document.getElementById("updates_general");

		createNewElement(updatesGeneralDiv, "li", "", str);

		if (benchmarkMode) {
			var cur = currentTime();
			benchmarkString = "- General [" + (cur - updatesGeneralLastTime) + "ms, " + (cur - updatesGeneralStartTime) + "ms] " + str + "<br>" + benchmarkString;
			updatesGeneralLastTime = cur;
			document.getElementById("benchmark_details").innerHTML = "Benchmark Results:<br>" + benchmarkString;
		}
	}

	var addUpdateSpecific = function(str) {

		console.log(str);
		var updatesSpecificDiv = document.getElementById("updates_specific");

		createNewElement(updatesSpecificDiv, "li", "", str);

		if (benchmarkMode) {
			var cur = currentTime();
			benchmarkString = "- Specific [" + (cur - updatesSpecificLastTime) + "ms, " + (cur - updatesSpecificStartTime) + "ms] " + str + "<br>" + benchmarkString;
			updatesSpecificLastTime = cur;
			document.getElementById("benchmark_details").innerHTML = "Benchmark Results:<br>" + benchmarkString;
		}
	}

	var go = function() {

		resetUpdatesGeneral();
		hideInterface();

		var pages = [];
		var competitionName = document.getElementById('competitionName').value;

		for (eventID in events) {
			var eventTBodyChildren = document.getElementById("tbody_" + eventID).children;

			for (var i =0; i < eventTBodyChildren.length; i++) {
				var tr = eventTBodyChildren[i];
				var roundName = tr.getElementsByClassName("round_name")[0].value;
				var roundType = tr.getElementsByClassName("round_type")[0].value;
				var numSolves = tr.getElementsByClassName("num_solves")[0].value;

				pages.push([eventID, roundName + " (" + roundNames[roundType] + " " + numSolves + ")", numSolves]);
			}
		}

		addUpdateGeneral("Generating " + pages.length + " round" + ((pages.length == 1) ? "" : "s") + " of scrambles.");

		generate_scrambles(hideUpdates, competitionName, pages);
	};

	var benchmark = function() {

		resetUpdatesGeneral();
		resetUpdatesSpecific();
		benchmarkMode = true;

		benchmarkString = "<br>Benchmark Settings:<br>" + 
			"- Web Workers: " + (usingWebWorkers? "yes" : "no");

		document.getElementById("benchmark").style.display="block";
		document.getElementById("select_events_interface").style.display="none";
		document.getElementById("select_sets_interface").style.display="none";
		document.getElementById("updates").style.display="none";

		// Give everyone the same benchmark.
		randomSource = new MersenneTwisterObject(123);

		var callback = function (){
			document.getElementById("benchmark_details").innerHTML = "Benchmark Results:<br><br>Done!<br><br>" + benchmarkString;
		};
		generate_scrambles(callback, "Benchmark", [
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
			["333", "Round 3x3x3 Again", 5]
		]);
	}

	return {
		version: version,
		events: events,
		initialize: initialize,
		generate_scrambles: generate_scrambles,
		go: go,
		changeNumRounds: changeNumRounds,
		benchmark: benchmark
	};
})();