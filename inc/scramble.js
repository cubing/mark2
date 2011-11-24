scramble = (function() {

	var version = "November 23, 2011";

	var puzzle_names = {
		"333": "Rubik's Cube",
		"444": "4x4 Cube",
		"555": "5x5 Cube",
		"222": "2x2 Cube",
		"333bf": "3x3 blindfolded",
		"333oh": "3x3 one-handed",
		"333fm": "3x3 fewest moves",
		"333ft": "3x3 with feet",
		"minx": "Megaminx",
		"pyram": "Pyraminx",
		"sq1": "Square-1",
		"clock": "Rubik's Clock",
		"666": "6x6 Cube",
		"777": "7x7 Cube",
		"magic": "Rubik's Magic",
		"mmagic": "Master Magic",
		"444bf": "4x4 blindfolded",
		"555bf": "5x5 blindfolded",
		"333mbf": "3x3 multi blind",
	}

	var scramblers = {
		"333": scramble_333,
		//"444": scramble_444,
		//"555": scramble_555,
		//"222": scramble_222,
		//"333bf": scramble_333bf,
		//"333oh": scramble_333oh,
		//"333fm": scramble_333fm,
		//"333ft": scramble_333ft,
		//"minx": scramble_minx,
		//"pyram": scramble_pyram,
		"sq1": scramble_sq1,
		//"clock": scramble_clock,
		//"666": scramble_666,
		//"777": scramble_777,
		//"magic": scramble_magic,
		//"mmagic": scramble_mmagic,
		//"444bf": scramble_444bf,
		//"555bf": scramble_555bf,
		//"333mbf": scramble_333mbf,
	}

	var initialize = function() {
		initializeRandomSource();
		document.getElementById("goButton").focus();
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

	var generate_scrambles = function(tBody, puzzleID, scrambler, num, options) {
		
		scrambler.initialize();

		for (var i = 1; i <= num; i++) {
			var scrambleTR = createNewElement(tBody, "tr");
			
			var scramble = scrambler.getRandomScramble();
			createNewElement(scrambleTR, "td", "", "" + i + ".");
			createNewElement(scrambleTR, "td", "", scramble.scramble);
			var drawingTD = createNewElement(scrambleTR, "td");
			var drawingCenter = createNewElement(drawingTD, "center"); // It's 2011, and there's still not a better way to center this. :-/

			scrambler.drawScramble(drawingCenter, scramble.state);
		}
	}

	var add_page = function(puzzleID, competitionName, roundName) {

		var scrambler = scramblers[puzzleID];
		if (!scrambler) {
			alert("Sorry, but " + puzzle_names[puzzleID] + " scrambles are not supported yet.");
			return;
		}

		// Create a new Page.
		
		var pages = document.getElementById("pages");

		var newPage = createNewElement(pages, "div", "page");

			// Header Table

			var newInfoTable = createNewElement(newPage, "table", "info_table");
				var newInfoTHead = createNewElement(newInfoTable, "thead");
					var newInfoTR = createNewElement(newInfoTHead, "tr");
						
						createNewElement(newInfoTR, "td", "puzzle_name", puzzle_names[puzzleID]);
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
						createNewElement(newFooterTR, "td", "", '<div style="text-align: right;"><u>' + puzzle_names[puzzleID] + ' Scrambler Version</u><br>' + scrambler.version + '</div>');
						createNewElement(newFooterTR, "td", "", '<img src="inc/WCAlogo_notext.svg" class="wca_logo">');
		
		// Generate those scrambles!		
		
		var numScrambles = 5;
		generate_scrambles(newScramblesTBody, puzzleID, scrambler, numScrambles, {});
	};

	return {
		version: version,
		puzzles: puzzle_names,
		scramblers: scramblers,
		initialize: initialize,
		add_page: add_page,
	};
})();