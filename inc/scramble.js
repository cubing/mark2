/*
 * Mark 2 Javascript Code
 *
 * Lucas Garron, Novermber/December 2011
 *
 */


// Offline Caching
if (typeof window.applicationCache !== "undefined") {
	window.applicationCache.addEventListener('updateready', function() {
		window.applicationCache.swapCache();
		setTimeout(function() {location.reload(true)}, 1000); // Function.prototype.bind doesn't work for this, anyhow... :-(
	}, false);

	window.applicationCache.addEventListener('downloading', function() {
		document.body.innerHTML="<br><br><h1>Updating cache...<br><br>Page will reload in a moment.</h1>";
		document.body.style.setProperty("background", "#00C0C0");
		scramble.terminateWebWorkers(); // Call this last in case it's not defined yet.
	}, false);
}



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



// Prevent errors if console.log doesn't exist (e.g. in IE when the console is not open).
if (typeof console === "undefined") {
	console = {};
}
if (typeof console.log === "undefined") {
	console.log = function() {};
}


scramble = (function() {

	/*
	 * Configuration Section
	 */

	var version = "December 31, 2011";

	var eventsPerRow = 5;
	var defaultNumGroups = 1;

	var events = {
		// Official WCA events as of November 24, 2011
		"333":    {name: "Rubik's Cube",     scrambler_file: "scramble_333.js",   default_round: {type: "avg",  num_scrambles: 5 }, drawing_dimensions: {w: 160, h: 120}, scrambles_per_row: 1},
		"444":    {name: "4x4 Cube",         scrambler_file: "scramble_NNN.js",   default_round: {type: "avg",  num_scrambles: 5 }, drawing_dimensions: {w: 160, h: 120}, scrambles_per_row: 1},
		"555":    {name: "5x5 Cube",         scrambler_file: "scramble_NNN.js",   default_round: {type: "avg",  num_scrambles: 5 }, drawing_dimensions: {w: 160, h: 120}, scrambles_per_row: 1},
		"222":    {name: "2x2 Cube",         scrambler_file: "scramble_222.js",   default_round: {type: "avg",  num_scrambles: 5 }, drawing_dimensions: {w: 160, h: 120}, scrambles_per_row: 1},
		"333bf":  {name: "3x3 blindfolded",  scrambler_file: "scramble_333.js",   default_round: {type: "best", num_scrambles: 3 }, drawing_dimensions: {w: 160, h: 120}, scrambles_per_row: 1},
		"333oh":  {name: "3x3 one-handed",   scrambler_file: "scramble_333.js",   default_round: {type: "avg",  num_scrambles: 5 }, drawing_dimensions: {w: 160, h: 120}, scrambles_per_row: 1},
		"333fm":  {name: "3x3 fewest moves", scrambler_file: "scramble_333.js",   default_round: {type: "best", num_scrambles: 2 }, drawing_dimensions: {w: 160, h: 120}, scrambles_per_row: 1}, //TODO: FCF support
		"333ft":  {name: "3x3 with feet",    scrambler_file: "scramble_333.js",   default_round: {type: "avg",  num_scrambles: 5 }, drawing_dimensions: {w: 160, h: 120}, scrambles_per_row: 1},
		"minx":   {name: "Megaminx",         scrambler_file: "scramble_minx.js",  default_round: {type: "avg",  num_scrambles: 5 }, drawing_dimensions: {w: 200, h: 120}, scrambles_per_row: 1},
		"pyram":  {name: "Pyraminx",         scrambler_file: "scramble_pyram.js", default_round: {type: "avg",  num_scrambles: 5 }, drawing_dimensions: {w: 200, h: 120}, scrambles_per_row: 1},
		"sq1":    {name: "Square-1",         scrambler_file: "scramble_sq1.js",   default_round: {type: "avg",  num_scrambles: 5 }, drawing_dimensions: {w: 200, h: 120}, scrambles_per_row: 1},
		"clock":  {name: "Rubik's Clock",    scrambler_file: "scramble_clock.js", default_round: {type: "avg",  num_scrambles: 5 }, drawing_dimensions: {w: 200, h: 120}, scrambles_per_row: 1},
		"666":    {name: "6x6 Cube",         scrambler_file: "scramble_NNN.js",   default_round: {type: "mean", num_scrambles: 3 }, drawing_dimensions: {w: 200, h: 150}, scrambles_per_row: 1},
		"777":    {name: "7x7 Cube",         scrambler_file: "scramble_NNN.js",   default_round: {type: "mean", num_scrambles: 3 }, drawing_dimensions: {w: 200, h: 150}, scrambles_per_row: 1},
		//"magic" 
		//"mmagic"
		"444bf":  {name: "4x4 blindfolded",  scrambler_file: "scramble_NNN.js",   default_round: {type: "best", num_scrambles: 3 }, drawing_dimensions: {w: 160, h: 120}, scrambles_per_row: 1},
		"555bf":  {name: "5x5 blindfolded",  scrambler_file: "scramble_NNN.js",   default_round: {type: "best", num_scrambles: 3 }, drawing_dimensions: {w: 160, h: 120}, scrambles_per_row: 1},
		"333mbf": {name: "3x3 multi blind",  scrambler_file: "scramble_333.js",   default_round: {type: "mbf",  num_scrambles: 20}, drawing_dimensions: {w: 80,  h: 60 }, scrambles_per_row: 2}
		
		// Unofficial events
		//"skewb"
	}

	// Javascript objects don't retain key order in all browsers, so we create this list for iteration.
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
		"333mbf"
		//"skewb"
	];

	var defaultRounds = [
		["333", "Round 1", 1, events["333"].default_round.num_scrambles]
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
		"555bf": "5x5x5"
	}

	// Round types are not currently used.
	/*
	var roundTypeNames = {
		"avg": "Average of",
		"best": "Best of",
		"combined": "Combined Round of",
		"mean": "Mean of",
		"mbf": "Multi Blind of"
	}
	*/



	/*
	 * Mark 2 Initialization
	 */

	var initialize = function() {
		initializeRandomSource();
		initializeEvents();
		initializeEventsTable();
		initializeWorkers();

		window.onhashchange = initializeEvents;
	};



	/*
	 * Events
	 */

	var initializeEventsTable = function() {

		var eventsTable = document.getElementById("events_table");
		var currentEventsTR;

		for (var i =0; i < eventOrder.length; i++) {
			eventID = eventOrder[i]

			events[eventID].initialized = false;

			if (i % eventsPerRow === 0) {
				currentEventsTR = createNewElement(eventsTable, "tr");
			}

			var eventTD = createNewElement(currentEventsTR, "td", "event_amount_label", null, "" + eventID + ":");

			var val = createNewElement(currentEventsTR, "td", "event_amount_value_td", "");
			var valInput = createNewElement(val, "input", "event_amount_value");
			valInput.setAttribute("value", numCurrentRounds(eventID));
			valInput.setAttribute("id", "event_amount_value_" + eventID);
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


	var initializeEvents = function() {

		var competitionNameHash = getHashParameter("competition_name", null);

		if (competitionNameHash !== null) {
			var competitionName = decodeURIComponent(competitionNameHash);
			document.getElementById("competitionName").value = competitionName;
		}

		var roundsHash = getHashParameter("rounds", null);

		if (roundsHash === null) {
			addRounds(defaultRounds);
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
		var roundsHash = encodeURIComponent(JSON.stringify(getRoundsJSON()));
		location.hash = "#competition_name=" + competitionName + "&rounds=" + roundsHash;
	}



	/*
	 * Rounds
	 */

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
			numSolves = events[eventID].default_round.num_scrambles;
		}

		var eventTBody = document.getElementById("rounds_tbody");


		var newEventTR_ID = nextAutoID();
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

    var addRounds = function(rounds) {
    	for (var i in rounds) {
	    	addRound(rounds[i][0], rounds[i][1], rounds[i][2], rounds[i][3]);
	    }
    }

	var removeRound = function(eventID, scrambleID) {
		document.getElementById("rounds_tbody").removeChild(document.getElementById(scrambleID));
		document.getElementById("event_amount_value_" + eventID).value = numCurrentRounds(eventID);

		updateHash();
	}

	var removeLastRound = function(eventID) {
		var rounds = document.getElementsByClassName("event_tr_" + eventID);
		var lastRound = rounds[rounds.length - 1];
		document.getElementById("rounds_tbody").removeChild(lastRound);
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

		if (parseInt(document.getElementById("event_amount_value_" + eventID).value) !== newNum) {
			document.getElementById("event_amount_value_" + eventID).value = newNum;
		}

		updateHash();
	}

	var resetRounds = function() {
		document.getElementById("rounds_tbody").innerHTML = "";
	}

    var getRoundsJSON = function() {
    	
		var rounds = [];

		var eventsTBody = document.getElementById("rounds_tbody").children;

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



	/*
	 * Scramble Sets
	 */

	var doneCreatingRounds = false;
	var scramblesStillAwaiting = [];

    var getScrambleSetsJSON = function() {

    	var rounds = getRoundsJSON();
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

	var markScrambleStarting = function(scrambleID, eventID, num) {
					
		var scrambleTD = document.getElementById(scrambleID + "_scramble");
		scrambleTD.innerHTML = "Generating scramble #" + num + "...";
		removeClass(scrambleTD, "loading_scrambler");
		addClass(scrambleTD, "loading_scramble");
	}

	var markScramblerInitializing = function(scrambleID, eventID, num) {
					
		var scrambleTD = document.getElementById(scrambleID + "_scramble");
		scrambleTD.innerHTML = "Initializing scrambler...";
		addClass(scrambleTD, "loading_scrambler");
	}

	var algGarronUSLink = function(eventID, scramble) {

		var puzzleID = eventIDToAlgPuzzleID[eventID];

		if (typeof puzzleID === "undefined") {
			return scramble;
		}

		return "<a href=\"http://alg.garron.us/?ini=" + encodeURIComponent(scramble) + "&cube=" + puzzleID + "&name=" + encodeURIComponent(events[eventID].name + " Scramble") + "&notation=WCA\" target=\"_blank\" class=\"scramble_link\">" + scramble + "</a>";
	}

	var scrambleLink = function(eventID, scramble) {
		// Specific to alg.garron.us right now.
		return algGarronUSLink(eventID, scramble);
	}

	var insertScramble = function(scrambleID, eventID, num, scramble, state) {

		if (webWorkersRunning) {

			var index = scramblesStillAwaiting.indexOf(scrambleID);
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
					
		var scrambleTD = document.getElementById(scrambleID + "_scramble");
		removeClass(scrambleTD, "loading_scramble");
		var scrambleHTML = scrambleLink(eventID, scramble);
		scrambleTD.innerHTML = scrambleHTML;

		var drawingTD = document.getElementById(scrambleID + "_drawing");
		drawingTD.innerHTML = "";
		drawingTD.width = events[eventID].drawing_dimensions.w; // Sadly, this is more robust than setProperty(...).
		var drawingWidth = events[eventID].drawing_dimensions.w;
		var drawingHeight = events[eventID].drawing_dimensions.h;
		scramblers[eventID].drawScramble(drawingTD, state, drawingWidth, drawingHeight);
	}

	var generateScrambleSet = function(continuation, competitionName, tBody, eventID, scrambler, num, numTotal, options) {
		
		var scrambleTR = createNewElement(tBody, "tr");

		var scramblesInThisRow = Math.min(events[eventID].scrambles_per_row, numTotal - num + 1);

		for (var i = 0; i < scramblesInThisRow; i++) {

			var scrambleID = nextAutoID();
		
			createNewElement(scrambleTR, "td", "number number_" + eventID, scrambleID + "_number", "" + (num + i) + ".");
			createNewElement(scrambleTR, "td", "scramble scramble_" + eventID, scrambleID + "_scramble",  "[Space for Scramble #" + (num + i) + "]");
			var drawingTD = createNewElement(scrambleTR, "td", "drawing drawing_" + eventID, scrambleID + "_drawing", "[Space for Drawing]");
			drawingTD.width = events[eventID].drawing_dimensions.w;
			drawingTD.height = events[eventID].drawing_dimensions.h;

			if (webWorkersRunning) {

				scramblesStillAwaiting.push(scrambleID);

				events[eventID].worker.postMessage({
					action: "get_random_scramble",
					event_id: eventID,
					return_data: {
						scramble_id: scrambleID,
						num: (num + i)
					}
				});
			}
			else {
				var scramble = scrambler.getRandomScramble();
				insertScramble(scrambleID, eventID, num, scramble.scramble_string, scramble.state);
			}
		}

		var call;
		if (num < numTotal) {
			call = generateScrambleSet.bind(null, continuation, competitionName, tBody, eventID, scrambler, num + scramblesInThisRow, numTotal, options);
		}
		else {
			hideUpdatesSpecific();
			call = continuation;
		}
		setTimeout(call, 0);
	}

	var addScrambleSet = function(continuation, competitionName, eventID, roundName, numScrambles) {

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
		
		var nextContinuation = generateScrambleSet.bind(null, continuation, competitionName, newScramblesTBody, eventID, scrambler, 1, numScrambles, {});
		var call;
		if (!webWorkersRunning && !events[eventID].initialized) {
		    addUpdateSpecific("Initializing " + events[eventID].name + " scrambler (only needs to be done once).");

		    var statusCallback = function(str) {
		    	addUpdateSpecific(str);

		    }

			call = scrambler.initialize.bind(null, nextContinuation, randomSource, statusCallback);
			events[eventID].initialized = true;
		}
		else {

			if (webWorkersRunning) {
			}
			else if (events[eventID].initialized) {
		    	addUpdateSpecific("" + events[eventID].name + " scrambler already initialized.");
			}
			call = nextContinuation;
		}
		setTimeout(call, 0);
	};

	var generateScrambleSets = function(callback, competitionName, rounds) {

		var nextContinuation;
		if (rounds.length > 1) {
			nextContinuation = generateScrambleSets.bind(null, callback, competitionName, rounds.slice(1));
		}
		else {
			nextContinuation = function(){

				if (webWorkersRunning) {
					addUpdateGeneral("Done creating all rounds. " + scramblesStillAwaiting.length + " scrambles still need to be filled in.");
					doneCreatingRounds = true;
				}
				else {
					addUpdateGeneral("Done creating all rounds.");
				}

				setTimeout(callback, 0);
			};
		}

		addScrambleSet(nextContinuation, competitionName, rounds[0][0], rounds[0][1], rounds[0][2]);
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

    var getCompetitionNameAndSetPageTitle = function() {
    	var competitionName = document.getElementById('competitionName').value;

		if (competitionName === "") {
			document.title = "Scrambles from Mark 2";
			competitionName = "Mark 2";
		}
		else {
			document.title = "Scrambles for " + competitionName;
		}

		return competitionName;
    }

	var go = function() {

		resetUpdatesGeneral();
		hideInterface();

		var competitionName = getCompetitionNameAndSetPageTitle();

		var pages = getScrambleSetsJSON();

		if (pages.length === 0) {
			addUpdateGeneral("Nothing to do, because there are no rounds to scramble.");
			return;
		}

		addUpdateGeneral("Generating " + pages.length + " round" + ((pages.length === 1) ? "" : "s") + " of scrambles.");

		generateScrambleSets(hideUpdates, competitionName, pages);
	};



	/*
	 * DOM Manipulation
	 */

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

	var currentAutoID = "0";

	var nextAutoID = function() {
		return "auto_id_" + (currentAutoID++);
	}

	var addClass = function(el, className) {
		if (typeof el.classList !== "undefined") {
			el.classList.add(className);
		}
	}

	var removeClass = function(el, className) {
		if (typeof el.classList !== "undefined") {
			el.classList.remove(className);
		}
		
	}



	/*
	 * Random Number Generation
	 */

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
			console.log("Seeded Mersenne Twister.");
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



	/*
	 * Displaying Progress Updates
	 */

	var showElement = function(el) {
		el.style.display = "block";
	}

	var hideElement = function(el) {
		el.style.display = "none";
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

	var showInterface = function() {
		var interfaceElements = document.getElementsByClassName("interface");
		for (var i=0; i < interfaceElements.length; i++) {
			hideElement(interfaceElements[i]);
		}
	}

	var hideInterface = function() {
		var interfaceElements = document.getElementsByClassName("interface");
		for (var i=0; i < interfaceElements.length; i++) {
			hideElement(interfaceElements[i]);
		}
	}

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

	}

	var addUpdateSpecific = function(str) {

		console.log(str);
		var updatesSpecificDiv = document.getElementById("updates_specific");

		createNewElement(updatesSpecificDiv, "li", null, null, str);

	}



	/*
	 * Web Workers
	 */

	var webWorkersRunning = false;
	var workers = {};

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

			webWorkersRunning = true;

		}
		catch (e) {
			console.log("Starting the web workers failed; Mark 2 will fall back to continuations. (This happens with Chrome when run from file://)", e);
		}

	}

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

	var handleWorkerMessage = function(e) {
		switch(e.data.action) {
			case "initialized":
				console.log("Web worker initialized successfully: " + e.data.info);
			break;

			case "get_random_scramble_starting":
				markScrambleStarting(
					e.data.return_data.scramble_id,
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

			case "get_random_scramble_initializing_scrambler":
				markScramblerInitializing(
					e.data.return_data.scramble_id,
					e.data.event_id,
					e.data.return_data.num
				);
			break;

			case "get_random_scramble_response":
				//console.log("Received a " + events[e.data.event_id].name +	 " scramble: " + e.data.scramble.scramble_string);
				insertScramble(
					e.data.return_data.scramble_id,
					e.data.event_id,
					e.data.return_data.num,
					e.data.scramble.scramble_string,
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



	/*
	 * Keybindings for Debugging
	 */

	var printKeyCodes = false;

	document.onkeydown = function(e) {

		if (printKeyCodes) {
			console.log("Key pressed: " + e.keyCode);
		}

		if (e.ctrlKey) {
		 	switch (e.keyCode) {

				case 85: // "U" for ">U<pdates".
					showElement(document.getElementById("updates"));
					return true;
					break;

				case 66: // "B" for ">B<enchmark". (And "A>b<out?)
					showElement(document.getElementById("about"));
					return true;
					break;

				case 75: // "K" for "Show >K<eycodes"
					printKeyCodes = true;
					break;

				case 82: // "R" for ">R<efresh and >R<eset"
					// Currently buggy because of loose coupling with events table.
					resetRounds();
					addRounds(defaultRounds);
					updateHash();
					break;
			}
		}
	};



	/*
	 * Public Interface
	 */

	return {
		version: version,
		events: events,
		initialize: initialize,
		go: go,
		addRound: addRound,
		removeRound: removeRound,
		changeNumRounds: changeNumRounds,
		terminateWebWorkers: terminateWebWorkers,
		updateHash: updateHash
	};
})();