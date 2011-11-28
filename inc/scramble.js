
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

	var events = {
		
		// Official WCA events as of November 24, 2011
		"333": {name: "Rubik's Cube", scrambler: scramble_333, default_round: ["avg", 5], default_num_rounds: 1},
		"444": {name: "4x4 Cube", scrambler: scramble_444, default_round: ["avg", 5], default_num_rounds: 0},
		"555": {name: "5x5 Cube", scrambler: scramble_555, default_round: ["avg", 5], default_num_rounds: 0},
		"222": {name: "2x2 Cube", scrambler: scramble_222, default_round: ["avg", 5], default_num_rounds: 0},
		"333bf": {name: "3x3 blindfolded", scrambler: scramble_333, default_round: ["best", 3], default_num_rounds: 0},
		"333oh": {name: "3x3 one-handed", scrambler: scramble_333, default_round: ["avg", 5], default_num_rounds: 0},
		"333fm": {name: "3x3 fewest moves", scrambler: scramble_333, default_round: ["best", 2], default_num_rounds: 0}, //TODO: FCF support
		"333ft": {name: "3x3 with feet", scrambler: scramble_333, default_round: ["avg", 5], default_num_rounds: 0},
		"minx": {name: "Megaminx", scrambler: scramble_minx, default_round: ["avg", 5], default_num_rounds: 0},
		"pyram": {name: "Pyraminx", scrambler: scramble_pyram, default_round: ["avg", 5], default_num_rounds: 0},
		"sq1": {name: "Square-1", scrambler: scramble_sq1, default_round: ["avg", 5], default_num_rounds: 0},
		"clock": {name: "Rubik's Clock", scrambler: scramble_clock, default_round: ["avg", 5], default_num_rounds: 0},
		"666": {name: "6x6 Cube", scrambler: scramble_666, default_round: ["mean", 3], default_num_rounds: 0},
		"777": {name: "7x7 Cube", scrambler: scramble_777, default_round: ["mean", 3], default_num_rounds: 0},
		//"magic": {name: "Rubik's Magic", scrambler: scramble_magic, default_round: ["avg", 5], default_num_rounds: 0},
		//"mmagic": {name: "Master Magic", scrambler: scramble_mmagic, default_round: ["avg", 5], default_num_rounds: 0},
		"444bf": {name: "4x4 blindfolded", scrambler: scramble_444, default_round: ["best", 3], default_num_rounds: 0},
		"555bf": {name: "5x5 blindfolded", scrambler: scramble_555, default_round: ["best", 3], default_num_rounds: 0},
		//"333mbf": {name: "3x3 multi blind", scrambler: scramble_333, default_round: ["mbf"], default_num_rounds: 0}, //TODO: 3x3x3 with smaller images?
		
		// Unofficial events
		//"skewb": {name: "Skewb", scrambler: scramble_skewb, default_round: ["avg", 5]},
	}

	var roundNames = {
		"avg": "Average of",
		"best": "Best of",
		"combined": "Combined Round of",
		"mean": "Mean of"
	}

	var initialize = function() {

		initializeRandomSource();
		document.getElementById("goButton").focus();

		initializeEventIDSelect("333");
	};

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

			if (numEvents % 4 == 0) {
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

	var generate_scramble_set = function(continuation, competitionName, tBody, eventID, scrambler, num, numTotal, options) {
		
		addUpdateSpecific("Generating scramble #" + num + " of " + numTotal + ".");

		var scrambleTR = createNewElement(tBody, "tr");
		
		var scramble = scrambler.getRandomScramble();
		createNewElement(scrambleTR, "td", "", "" + num + ".");
		createNewElement(scrambleTR, "td", "scramble_" + eventID, scramble.scramble);
		var drawingTD = createNewElement(scrambleTR, "td", "drawing");
		//var drawingCenter = createNewElement(drawingTD, "center"); // It's 2011, and there's still not a better way to center this. :-/

		scrambler.drawScramble(drawingTD, scramble.state);


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

	var add_page = function(continuation, competitionName, eventID, roundName, numScrambles) {

		var pages = document.getElementById("scramble_sets");

		if (!events[eventID]) {
			var newPage = createNewElement(pages, "div", "unupported", "Sorry, but \"" + eventID + "\" scrambles are not currently supported.");
			return;
		}

		var scrambler = events[eventID].scrambler;

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
		if (!events[eventID].initialized) {
		    addUpdateSpecific("Initializing " + events[eventID].name + " scrambler (only needs to be done once).");

		    var statusCallback = function(str) {
		    	addUpdateSpecific(str);
		    }
			call = scrambler.initialize.bind(null, nextContinuation, statusCallback);
			events[eventID].initialized = true;
		}
		else {
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