/*
 * Mark 2 Javascript Code
 *
 * Lucas Garron, November/December 2011
 *
 */

"use strict";
mark2.ui = (function() {
		
	/*
	 * Configuration Section
	 */

	var version = "January 07, 2012";

	var settings;

	var eventsPerRow = 5;
	

	/*
	 * Mark 2 Initialization
	 */

	var initialize = function(settingsIn) {

		settings = settingsIn;

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

		for (var i =0; i < settings.event_order.length; i++) {
			var eventID = settings.event_order[i]

			settings.events[eventID].initialized = false;

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

			var changeNumRoundsListener = function(eventID, el) {
				changeNumRounds(eventID, parseInt(el.value));
			}.bind(null, eventID, valInput);

			valInput.addEventListener("change", changeNumRoundsListener, false);
			valInput.addEventListener("mouseup", changeNumRoundsListener, false);
			valInput.addEventListener("keyup", changeNumRoundsListener, false);
			valInput.addEventListener("input", changeNumRoundsListener, false);
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
			addRounds(settings.default_rounds);
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
			numGroups = settings.default_num_groups;
		}

		var numSolves = numSolvesOpt;
		if (numSolvesOpt === undefined) {
			numSolves = settings.events[eventID].default_round.num_scrambles;
		}

		var eventTBody = document.getElementById("rounds_tbody");


		var newEventTR_ID = mark2.dom.nextAutoID();
		var newEventTR = mark2.dom.appendElement(eventTBody, "tr", "event_tr_" + eventID, newEventTR_ID);
			newEventTR.setAttribute("data-event-id", eventID);

		var nameTD = mark2.dom.appendElement(newEventTR, "td", "event_name", null, settings.events[eventID].name);
		
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
			removeButton.addEventListener("click", removeRound.bind(null, eventID, newEventTR_ID), false);
	}

    var addRounds = function(rounds) {
    	for (var i = 0; i < rounds.length; i++) {
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
		updateHash: updateHash,
		getRoundsJSON: getRoundsJSON
	};
})();
