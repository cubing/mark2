/*
 * Mark 2 Javascript Code
 *
 * Lucas Garron, November/December 2011
 *
 */


mark2.ui = (function() {
		
	/*
	 * Configuration Section
	 */

	var version = "January 03, 2012";

	var eventsPerRow = 5;
	var defaultNumGroups = 1;
	
	var events;

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

	var defaultRounds;

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

	var initialize = function(eventsIn, defaultRoundsIn) {

		events = eventsIn;
		defaultRounds = defaultRoundsIn;

		initializeEvents();
		initializeEventsTable();

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
				currentEventsTR = mark2.dom.appendElement(eventsTable, "tr");
			}

			var eventTD = mark2.dom.appendElement(currentEventsTR, "td", "event_amount_label", null, "" + eventID + ":");

			var val = mark2.dom.appendElement(currentEventsTR, "td", "event_amount_value_td", "");
			var valInput = mark2.dom.appendElement(val, "input", "event_amount_value");
			valInput.setAttribute("value", numCurrentRounds(eventID));
			valInput.setAttribute("id", "event_amount_value_" + eventID);
			valInput.setAttribute("type", "number");
			valInput.setAttribute("min", "0");
			valInput.setAttribute("onchange", "mark2.ui.changeNumRounds(\"" + eventID + "\", parseInt(this.value));");
			valInput.setAttribute("onmouseup", "mark2.ui.changeNumRounds(\"" + eventID + "\", parseInt(this.value));");
			valInput.setAttribute("onkeyup", "mark2.ui.changeNumRounds(\"" + eventID + "\", parseInt(this.value));");
			valInput.setAttribute("oninput", "mark2.ui.changeNumRounds(\"" + eventID + "\", parseInt(this.value));");
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


		var newEventTR_ID = mark2.dom.nextAutoID();
		var newEventTR = mark2.dom.appendElement(eventTBody, "tr", "event_tr_" + eventID, newEventTR_ID);
			newEventTR.setAttribute("data-event-id", eventID);

		var nameTD = mark2.dom.appendElement(newEventTR, "td", "event_name", null, events[eventID].name);
		
		var roundNameTD = mark2.dom.appendElement(newEventTR, "td");
		var roundNameInput = mark2.dom.appendElement(roundNameTD, "input", "round_name");
			roundNameInput.setAttribute("value", roundName);

		var numSolvesTD = mark2.dom.appendElement(newEventTR, "td", null);
		var numSolvesInput = mark2.dom.appendElement(numSolvesTD, "input", "num_groups");
			numSolvesInput.setAttribute("type", "number");
			numSolvesInput.setAttribute("value", numGroups);
			numSolvesInput.setAttribute("min", "1");

		var numSolvesTD = mark2.dom.appendElement(newEventTR, "td", null);
		var numSolvesInput = mark2.dom.appendElement(numSolvesTD, "input", "num_solves");
			numSolvesInput.setAttribute("type", "number");
			numSolvesInput.setAttribute("value", numSolves);
			numSolvesInput.setAttribute("min", "1");

		var removeTD = mark2.dom.appendElement(newEventTR, "td", "round_remove");
		var removeButton = mark2.dom.appendElement(removeTD, "button", null, null, "&nbsp;&nbsp;X&nbsp;&nbsp;");
			removeButton.setAttribute("onclick", "mark2.ui.removeRound(\"" + eventID + "\", \"" + newEventTR_ID + "\")");
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

		if (isNaN(newNum)) {
			return;
		}

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
	 * Public Interface
	 */

	return {
		version: version,
		initialize: initialize,
		addRound: addRound,
		removeRound: removeRound,
		changeNumRounds: changeNumRounds,
		updateHash: updateHash,
		getRoundsJSON: getRoundsJSON
	};
})();