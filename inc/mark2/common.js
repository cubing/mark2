"use strict";
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



var mark2 = {};


/*

DOM Convenience Methods

These methods are a bit brittle and awkward, but they save us the issues of including all of jQuery into a project that is not highly DOM-focused.

*/

mark2.dom = (function() {

	/*
	 * DOM Manipulation
	 */

	var appendElement = function(elementToAppendTo, type, className, id, content) {

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
		if (elementToAppendTo) {
			elementToAppendTo.appendChild(newElement);
		}
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

	var showElement = function(el) {
		el.style.display = "block";
	}

	var hideElement = function(el) {
		el.style.display = "none";
	}



	/*
	 * Public Interface
	 */

	return {
		appendElement: appendElement,
		nextAutoID: nextAutoID,
		addClass: addClass,
		removeClass: removeClass,
		showElement: showElement,
		hideElement: hideElement
	};
})();



mark2.settings = (function() {

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
		"333mbf": {name: "3x3 multi blind",  scrambler_file: "scramble_333.js",   default_round: {type: "mbf",  num_scrambles: 28}, drawing_dimensions: {w: 60,  h: 45}, scrambles_per_row: 2}
		
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
		{event_ids: ["333", "333bf", "333oh", "333fm", "333ft", "333mbf"], auto_ini: true},
		{event_ids: ["222", "444", "555", "666", "777", "444bf", "555bf", "minx", "pyram", "clock"], auto_ini: false},
		{event_ids: ["sq1"], auto_ini: false}
	];

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

	var defaultNumGroups = 1;

	var assetsRootFromHTML = "./inc/";
	var webWorkerFile = assetsRootFromHTML + "mark2/workers.js";

	return {
		events: events,
		event_order: eventOrder,
		default_rounds: defaultRounds,
		worker_groups: workerGroups,
		
		default_num_groups: defaultNumGroups,

		assets_root: assetsRootFromHTML,
		web_worker_file: webWorkerFile
	};
})();

mark2.go = function() {
	mark2.ui.initialize(mark2.settings);
	mark2.controller.initialize(mark2.settings);
}
