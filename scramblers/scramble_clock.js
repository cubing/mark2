
scramble_clock = (function() {
  /*
  function prt(p){
    if(p<10) document.write(" ");
    document.write(p+" ");
  }
  function prtrndpin(){
    prtpin(Math.floor(Math.random()*2));
  }
  function prtpin(p){
    document.write(p==0?"U":"d");
  }
  */
  
  function getRandomScramble(){
    var posit = new Array (0,0,0,0,0,0,0,0,0,  0,0,0,0,0,0,0,0,0);
    var p = "Ud";
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
  		if (amount == 0) {
  			return "&nbsp;&nbsp;&nbsp;";
  		}
  		if (amount >= 0) {
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
    turns("<.d><.d>", "<.d><_d>", ""  , turn_name("U", seq[13]), "", "&nbsp;&nbsp;&nbsp;"   );
    turns(p[pegs[0]] + p[pegs[1]], p[pegs[2]] + p[pegs[3]], ""  , ""   , "", "");
    
    /*
    for( i=0; i<9; i++){
      prt(posit[i]);
      if( (i%3)==2 ) scramble += "\n";
    }
    scramble += "Back:\n";
    for( i=0; i<9; i++){
      prt(posit[i+9]);
      if( (i%3)==2 ) scramble += "\n";
    }
    */

    return {
      state: moves,
      scramble: scramble
    };
  }

  var randomSource = Math;

  // If we have a better (P)RNG:
  var setRandomSource = function(src) {
    randomSource = src;
  }


  var initializeFull = function() {
  };

  var drawScramble = function(parentElement, state) {
  	parentElement.innerHTML = "LOREMIPSUMLOREM";
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