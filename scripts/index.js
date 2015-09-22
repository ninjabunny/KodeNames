/*
Notes: 
'data' is lazily imported from the html
'seedrandom' is also imported from html. it gives deterministic random #s based on a seed set in fire()
*/

/*jshint -W004 */


var wordsSelected = [];
var teams = [];
var NUMBER_OF_WORDS = 25;
var spyMasterMode = false;
var sessionData = [];

var COLOR_RED = "#ff0000";
var COLOR_YELLOW = "#ffff00";
var COLOR_BLUE = "#00eeee";
var COLOR_BLACK = "black";
var COLOR_GREEN = "#009000";

function fire(){
	//get seed and set the seed for randomizer
	var seed = document.getElementById("seed").value;
	Math.seedrandom(seed);

	//reset state to pristine state
	sessionData = data.slice(0);
	wordsSelected = [];
	teams = [];
	spyMasterMode = false;
	document.getElementById("board").innerHTML = "";

	//fire new board
	createNewGame();
}

//not used, but probably useful at some point
function removeItem(array, index){
	if (index > -1) {
		// console.log("index: " + index + ", word: " + array[index] + " removed.");
	    array.splice(index, 1);
	}
}

function createNewGame(){	
	var trs = [];
	for(var i = 0; i < NUMBER_OF_WORDS; i++){
		if (!trs[i%5]){
			trs[i%5] = "";
		}
		var randomNumber = Math.floor(Math.random() * sessionData.length);
		var word = sessionData[randomNumber];
		removeItem(sessionData, randomNumber);
		wordsSelected.push(word);
		trs[i%5] += "<div class=\"word\" id=\'"+ i +"\' onclick=\"clicked(\'" + i + "\')\"><div>" + word + "</div></div>";
	}

	for (var i = 0; i < trs.length; i++){
		document.getElementById("board").innerHTML += '<div class="row">'+trs[i]+'</div>';
	}

	//create teams
	for(var i = 0; i < 8; i++){
		teams.push(COLOR_RED);
		teams.push(COLOR_BLUE);
	}

	// one extra for one of the teams
	document.getElementById("first").innerHTML = " starts first.";
	if(Math.floor(Math.random() * data.length) % 2 === 0){
		teams.push(COLOR_RED);
		document.getElementById("team").style.color = COLOR_RED;
		document.getElementById("team").innerHTML = "RED";
	}else{
		teams.push(COLOR_BLUE);
		document.getElementById("team").style.color = COLOR_BLUE;
		document.getElementById("team").innerHTML = "BLUE";
	}
	
	// add neturals 
	for(var i = 0; i < 7; i++){
		teams.push(COLOR_YELLOW);
	}

	// push the assasin
	teams.push(COLOR_BLACK);

	//shuffle teams
	shuffle(teams);

}

function clicked(value){
	if(!spyMasterMode){
		//guessers mode
		var word = wordsSelected[value];
		if(document.getElementById("confirm").checked){
			if (window.confirm("Are sure you want to select '"+word+"'?")){
				document.getElementById(value).style.backgroundColor = teams[value];
				if (teams[value] == "black"){
					document.getElementById(value).style.color = "white";
				}
			}
		} else {
			document.getElementById(value).style.backgroundColor = teams[value];
			if (teams[value] == "black"){
				document.getElementById(value).style.color = "white";
			}
		}
			
	} else {
		//spymaster mode
		// console.log(COLOR_GREEN + " hi "+document.getElementById(value).style.backgroundColor);
		// if(!document.getElementById(value).style.backgroundColor === teams[value]){
			document.getElementById(value).style.backgroundColor = COLOR_GREEN;	
		// } else {
		// 	document.getElementById(value).style.backgroundColor = teams[value];
		// }
		
	}
}

function spyMaster(){
	//TODO: randomize or organize tiles for easier comparing
	spyMasterMode = true;
	for(var i = 0; i < NUMBER_OF_WORDS; i++){
		document.getElementById(i).style.backgroundColor = teams[i];
		if (teams[i] == "black"){
			document.getElementById(i).style.color = "white";
		}
	}
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//enable pressing 'Enter' on seed field
document.getElementById('seed').onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      // Enter pressed
      fire();
      return false;
    }
};
