

if (typeof scramblers === "undefined") {
  var scramblers = {};
}

scramblers["clock"] = (function() {
  /*
  function prt(p){
    if(p<10) document.write(" ");
    document.write(p+" ");
  }
  function prtrndpin(){
    prtpin(Math.floor(Math.random()*2));
  }
  function prtpin(p){
    document.write(p===0?"U":"d");
  }
  */
  
  function getRandomScramble(){
    var posit = new Array (0,0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,0);
    var p = "dU";
    var pegs = [0, 0, 0, 0];
    var seq = new Array();
    var i,j;
    var moves = new Array();
    moves[0]=new Array(1,1,1,1,1,1,0,0,0,  -1,0,-1,0,0,0,0,0,0);
    moves[1]=new Array(0,1,1,0,1,1,0,1,1,  -1,0,0,0,0,0,-1,0,0);
    moves[2]=new Array(0,0,0,1,1,1,1,1,1,  0,0,0,0,0,0,-1,0,-1);
    moves[3]=new Array(1,1,0,1,1,0,1,1,0,  0,0,-1,0,0,0,0,0,-1);
  
    moves[4]=new Array(0,0,0,0,0,0,1,0,1,  0,0,0,-1,-1,-1,-1,-1,-1);
    moves[5]=new Array(1,0,0,0,0,0,1,0,0,  0,-1,-1,0,-1,-1,0,-1,-1);
    moves[6]=new Array(1,0,1,0,0,0,0,0,0,  -1,-1,-1,-1,-1,-1,0,0,0);
    moves[7]=new Array(0,0,1,0,0,0,0,0,1,  -1,-1,0,-1,-1,0,-1,-1,0);
  
    moves[ 8]=new Array(0,1,1,1,1,1,1,1,1,  -1,0,0,0,0,0,-1,0,-1);
    moves[ 9]=new Array(1,1,0,1,1,1,1,1,1,  0,0,-1,0,0,0,-1,0,-1);
    moves[10]=new Array(1,1,1,1,1,1,1,1,0,  -1,0,-1,0,0,0,0,0,-1);
    moves[11]=new Array(1,1,1,1,1,1,0,1,1,  -1,0,-1,0,0,0,-1,0,0);
  
    moves[12]=new Array(1,1,1,1,1,1,1,1,1,  -1,0,-1,0,0,0,-1,0,-1);
    moves[13]=new Array(1,0,1,0,0,0,1,0,1,  -1,-1,-1,-1,-1,-1,-1,-1,-1);
  
    for( i=0; i<14; i++){
      seq[i] = Math.floor(randomSource.random()*12)-5;
    }
  
    for( i=0; i<4; i++){
      pegs[i] = Math.floor(randomSource.random()*2);
    }
  
    for( i=0; i<14; i++){
      for( j=0; j<18; j++){
        posit[j]+=seq[i]*moves[i][j];
      }
    }
    for( j=0; j<18; j++){
      posit[j]%=12;
      while( posit[j]<=0 ) posit[j]+=12;
    }
  
  	var scramble = "";

  	function turns(top, bot, tUL, tUR, tDL, tDR) {
		var topWithChanges = top.replace(/\<\./g, "<span class='peg_changed'>").replace(/\<\_/g, "<span class='peg_same___'>").replace(/\>/g, "</span>");
		var botWithChanges = bot.replace(/\<\./g, "<span class='peg_changed'>").replace(/\<\_/g, "<span class='peg_same___'>").replace(/\>/g, "</span>");

  		scramble += "<div class='clock_outer'><div class='clock_inner'>";
  			scramble += tUL + " <span class='clock_pegs'>" + topWithChanges + "</span>&nbsp;" + tUR + "<br>";
  			scramble += tDL + " <span class='clock_pegs'>" + botWithChanges + "</span>&nbsp;" + tDR;
  		scramble += "</div></div>";
  	}

  	function turn_name(turn, amount) {
  		var suffix;
  		if (amount === 0) {
  			return "&nbsp;&nbsp;&nbsp;";
  		}
  		else if (amount === 1) {
  			suffix = "</span>&nbsp;&nbsp;";
  		}
  		else if (amount === -1) {
  			suffix = "'</span>&nbsp;&nbsp;";
  		}
  		else if (amount >= 0) {
  			suffix = "" + amount + "</span>&nbsp;";
  		}
  		else {
  			suffix = "" + (-amount) + "'</span>";
  		}
  		return "<span class='clock_turn'>" + turn + suffix;
  	}

/*
    turns("<_U><_U>", "<_d><_d>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[0]) , "&nbsp;&nbsp;&nbsp;", turn_name("d", seq[4]));
    turns("<.d><_U>", "<_d><.U>", turn_name("d", seq[5]), turn_name("U", seq[1]) , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_d><.d>", "<.U><_U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("d", seq[6]) , "&nbsp;&nbsp;&nbsp;", turn_name("U", seq[2]));
    turns("<.U><_d>", "<_U><.d>", turn_name("U", seq[3]), turn_name("d", seq[7]) , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<.d><.U>", "<_U><.U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[8]) , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<.U><.d>", "<_U><_U>", turn_name("U", seq[9]), "&nbsp;&nbsp;&nbsp;"   , "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_U><.U>", "<_U><.d>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[10]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_U><_U>", "<.d><.U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[11]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<_U><_U>", "<.U><_U>", "&nbsp;&nbsp;&nbsp;"  , turn_name("U", seq[12]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  );
    turns("<.d><.d>", "<.d><.d>", "&nbsp;&nbsp;&nbsp;"  , turn_name("d", seq[13]), "&nbsp;&nbsp;&nbsp;", "&nbsp;&nbsp;&nbsp;"  )
    */

    turns("<_U><_U>", "<_d><_d>", ""  , turn_name("U", seq[0]) , "", turn_name("d", seq[4]) );
    turns("<.d><_U>", "<_d><.U>", ""  , turn_name("U", seq[1]) , "", turn_name("d", seq[5]) );
    turns("<_d><.d>", "<.U><_U>", ""  , turn_name("U", seq[2]) , "", turn_name("d", seq[6]) );
    turns("<.U><_d>", "<_U><.d>", ""  , turn_name("U", seq[3]) , "", turn_name("d", seq[7]) );
    turns("<.d><.U>", "<_U><.U>", ""  , turn_name("U", seq[8]) , "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<.U><.d>", "<_U><_U>", ""  , turn_name("U", seq[9]) , "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<_U><.U>", "<_U><.d>", ""  , turn_name("U", seq[10]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<_U><_U>", "<.d><.U>", ""  , turn_name("U", seq[11]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<_U><_U>", "<.U><_U>", ""  , turn_name("U", seq[12]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns("<.d><.d>", "<.d><_d>", ""  , turn_name("d", seq[13]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns(p[pegs[0]] + p[pegs[1]], p[pegs[2]] + p[pegs[3]], ""  , ""   , "", "");
    
    /*
    for( i=0; i<9; i++){
      prt(posit[i]);
      if( (i%3)===2 ) scramble += "\n";
    }
    scramble += "Back:\n";
    for( i=0; i<9; i++){
      prt(posit[i+9]);
      if( (i%3)===2 ) scramble += "\n";
    }
    */

    return {
      state: {dials: posit, pegs: pegs},
      scramble: scramble
    };
  }

  var randomSource = undefined;

  // If we have a better (P)RNG:
  var setRandomSource = function(src) {
    randomSource = src;
  }


  var initializeFull = function(continuation, iniRandomSource) {
  
    setRandomSource(iniRandomSource);
    
    if (continuation) {
      setTimeout(continuation, 0);
    }
  };

  function drawPolygon(r, color, arrx, arry) {
  	
    var pathString = "";
    for (var i = 0; i < arrx.length; i++) {
      pathString += ((i===0) ? "M" : "L") + arrx[i] + "," + arry[i];
    }
    pathString += "z";
    
    return r.path(pathString).attr({fill: color, stroke: "none"});
  }

  Math.TAU = Math.PI * 2;

  function drawClockFace(r, cx, cy, face_fill, hour) {
	r.circle(cx, cy, 13).attr({fill: face_fill, stroke: "none"});
	r.circle(cx, cy, 4).attr({fill: "#F00", stroke: "none"});

	var c = Math.cos(hour/12*Math.TAU);
	var s = Math.sin(hour/12*Math.TAU);

	arrx = [cx , cx + 4	, cx - 4];
	arry = [cy - 12, cy, cy];
	
	var hand = drawPolygon(r, "#F00", arrx, arry);

	hand.rotate(30*hour, cx, cy);


	r.circle(cx, cy, 2).attr({fill: "#FF0", stroke: "none"});

	arrx = [cx, cx + 2, cx - 2];
	arry = [cy - 8 , cy, cy];
	
	var handInner = drawPolygon(r, "#FF0", arrx, arry);

	handInner.rotate(30*hour, cx, cy);

  }

  function drawPeg(r, cx, cy, pegValue) {

  	var pegRadius = 6;
  	var color;
  	if (pegValue === 1) {
  		color = "#FF0";
  	}
  	else {
  		color = "#440";
  	}

	r.circle(cx, cy, pegRadius).attr({fill: color, stroke: "#000"});
  }

  var drawScramble = function(parentElement, state) {

	var clock_radius = 52;

	var face_dist = 30;
	var face_background_dist = 29;

	var face_radius = 15;
	var face_background_radius = 18;

    var r = Raphael(parentElement, 220, 110);
    parentElement.width = 220;

    var drawSideBackground = function(cx, cy, fill, stroke, stroke_width) {


		r.circle(cx, cy, clock_radius).attr({fill: fill, stroke: stroke, "stroke-width": stroke_width});

		for (x = cx - face_background_dist; x <= cx + face_background_dist; x += face_background_dist) {
			for (y = cy - face_background_dist; y <= cy + face_background_dist; y += face_background_dist) {
				r.circle(x, y, face_background_radius).attr({fill: fill, stroke: stroke, "stroke-width": stroke_width});
			}
		}
    }

    var cx = 55;
    var cy = 55;

    drawSideBackground(cx, cy, "none", "#000", 3);
    drawSideBackground(cx, cy, "#36F", "none");

    var i = 0;
	for (y = cy - face_dist; y <= cy + face_dist; y += face_dist) {
		for (x = cx - face_dist; x <= cx + face_dist; x += face_dist) {
			drawClockFace(r, x, y, "#8AF", state.dials[i]);
			//console.log(state.dials[i]);
			i++;
		}
	}
	
	drawPeg(r, cx - face_dist/2, cy - face_dist/2, state.pegs[0]);
	drawPeg(r, cx + face_dist/2, cy - face_dist/2, state.pegs[1]);
	drawPeg(r, cx - face_dist/2, cy + face_dist/2, state.pegs[2]);
	drawPeg(r, cx + face_dist/2, cy + face_dist/2, state.pegs[3]);
	


    var cx = 165;
    var cy = 55;

    drawSideBackground(cx, cy, "#none", "#000", 3);
    drawSideBackground(cx, cy, "#8AF", "none");

    var i = 9;
	for (y = cy - face_dist; y <= cy + face_dist; y += face_dist) {
		for (x = cx - face_dist; x <= cx + face_dist; x += face_dist) {
			drawClockFace(r, x, y, "#36F",  state.dials[i]);
			//console.log(state.dials[i]);
			i++;
		}
	}
	
	drawPeg(r, cx + face_dist/2, cy - face_dist/2, 1-state.pegs[0]);
	drawPeg(r, cx - face_dist/2, cy - face_dist/2, 1-state.pegs[1]);
	drawPeg(r, cx + face_dist/2, cy + face_dist/2, 1-state.pegs[2]);
	drawPeg(r, cx - face_dist/2, cy + face_dist/2, 1-state.pegs[3]);

  };

  return {
    /* mark2 interface */
    version: "November 24, 2011",
    initialize: initializeFull,
    setRandomSource: setRandomSource,
    getRandomScramble: getRandomScramble,
    drawScramble: drawScramble,

    /* Other methods */
  };
})();