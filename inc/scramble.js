scramble = (function() {

	var version = "November 23, 2011";

	var events = {
		"333": {name: "Rubik's Cube", scrambler: scramble_333},
		"444": {name: "4x4 Cube", scrambler: scramble_444},
		"555": {name: "5x5 Cube", scrambler: scramble_555},
		"222": {name: "2x2 Cube", scrambler: scramble_222},
		"333bf": {name: "3x3 blindfolded", scrambler: scramble_333},
		"333oh": {name: "3x3 one-handed", scrambler: scramble_333},
		"333fm": {name: "3x3 fewest moves", scrambler: scramble_333},
		"333ft": {name: "3x3 with feet", scrambler: scramble_333},
		//"minx": {name: "Megaminx", scrambler: scramble_minx},
		"pyram": {name: "Pyraminx", scrambler: scramble_pyram},
		"sq1": {name: "Square-1", scrambler: scramble_sq1},
		//"clock": {name: "Rubik's Clock", scrambler: scramble_clock},
		"666": {name: "6x6 Cube", scrambler: scramble_666},
		"777": {name: "7x7 Cube", scrambler: scramble_777},
		//"magic": {name: "Rubik's Magic", scrambler: scramble_magic},
		//"mmagic": {name: "Master Magic", scrambler: scramble_mmagic},
		"444bf": {name: "4x4 blindfolded", scrambler: scramble_444},
		"555bf": {name: "5x5 blindfolded", scrambler: scramble_555},
		"333mbf": {name: "3x3 multi blind", scrambler: scramble_333},
	}

	var initialize = function() {
		initializeRandomSource();
		document.getElementById("goButton").focus();

		var defaultSelectedEvent = "333";

		var eventIDSelect = document.getElementById("eventID");
		var numEvents = 0;
		for (eventID in events) {
			var newOption = createNewElement(eventIDSelect, "option", "", events[eventID].name);
			newOption.setAttribute("value", eventID);
			if (eventID == defaultSelectedEvent) {
				newOption.setAttribute("selected", "true");
			}
			numEvents++;
		}
		eventIDSelect.setAttribute("size", numEvents);
	};

	var randomSource = Math;

	var initializeRandomSource = function() {
		
		console.log("scramble.js: Seeding Mersenne Twister.");
		var seed = new Date().getTime() + Math.floor(Math.random()*0xffffffff);
		
		// Make sure we don't actually use deterministic initialization.
		if (isFinite(seed)) {
			randomSource = new MersenneTwisterObject(seed);
		}
		else {
  			console.log("WARNING: Seeding Mersenne Twister did not work. Falling back to Math.random().");
  		}
	}


	var createNewElement = function(elementToAppendTo, type, className, content) {
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

	var generate_scramble_set = function(tBody, eventID, scrambler, num, options) {
		
		scrambler.initialize();

		for (var i = 1; i <= num; i++) {
			var scrambleTR = createNewElement(tBody, "tr");
			
			var scramble = scrambler.getRandomScramble();
			createNewElement(scrambleTR, "td", "", "" + i + ".");
			createNewElement(scrambleTR, "td", "scramble_" + eventID, scramble.scramble);
			var drawingTD = createNewElement(scrambleTR, "td");
			var drawingCenter = createNewElement(drawingTD, "center"); // It's 2011, and there's still not a better way to center this. :-/

			scrambler.drawScramble(drawingCenter, scramble.state);
		}
	}

	var add_page = function(competitionName, eventID, roundName, numScrambles) {

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
		
		generate_scramble_set(newScramblesTBody, eventID, scrambler, numScrambles, {});
	};

	generate_scrambles = function(competitionName, rounds) {

		document.title = "WCA Scrambles for " + competitionName;

		for (i in rounds) {
			add_page(competitionName, rounds[i][0], rounds[i][1], rounds[i][2]);
		}
		
	}

	return {
		version: version,
		events: events,
		initialize: initialize,
		generate_scrambles: generate_scrambles,
	};
})();