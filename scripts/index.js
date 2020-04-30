/*
Notes:
'data' is lazily imported from the html
'seedrandom' is also imported from html. it gives deterministic random #s based on a seed set in fire()
*/


var wordsSelected = [];
var teams = [];
var NUMBER_OF_WORDS = 25;
var spyMasterMode = false;
var sessionData = [];
var customData = [];

var RED_SQUARE = '.red-square';
var BLUE_SQUARE = '.blue-square';

var COLOR_RED = "#ff8a65";
var COLOR_RED_RGB = 'rgb(255, 138, 101)';
var COLOR_BLUE = "#26a69a";
var COLOR_BLUE_RGB = 'rgb(38, 166, 154)';

var COLOR_YELLOW = "#cfd8dc";
var COLOR_BLACK = "#d50000";
var COLOR_GREEN = "#009000";

const RED = 'red-square'
const BLUE = 'blue-square'
const CIVILIAN = 'civilian-square'
const ASSASSIN = 'assassin-square'
const CIVILIAN_COUNT = 7
const ASSASSIN_COUNT = 1
const SELECTED = 'selected'
const SPYMASTER = 'spy-master'

const ICONS = {
	[RED] : 'fa-user-secret',
	[BLUE] : 'fa-user-secret',
	[CIVILIAN] : 'fa-walking',
	[ASSASSIN] : 'fa-skull-crossbones'
}

var answers = {};

// get seed
// get 25 words
// Create a hash of {'word' =>  one of these 'red-square', 'civilian-square', 'assassin-square' }
// Loopthrough and add classes to square
// when selected, add 'js-selected' class
// get counts and winner through red-square not selected
// spymaster mode add .js-spymaster to board

//Later
// Add turn
// Use double click


//init
// $("#seed").keyup(function() {
// 	fire();
// });

// $("#gameMode").change(function() {
// 	fire();
// });


$("#seed").val(Math.floor(Math.random() * 1000));
createGame();

//not used, but probably useful at some point
// function removeItem(array, index) {
// 	if (index > -1) {
// 		// console.log("index: " + index + ", word: " + array[index] + " removed.");
// 		array.splice(index, 1);
// 	}
// }



// copied from here: https://github.com/yixizhang/seed-shuffle
// edited so it doesn't mutate the original array
function seededShuffle(arrayInput, seed) {
  // clone array
  var array = Object.assign([], arrayInput);
  let currentIndex = array.length, temporaryValue, randomIndex;
  seed = seed || 1;
  let random = function() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}



function createGame() {
	$("#board").empty();
	const seed = $("#seed").val();
	// Math.seedrandom(seed.toLowerCase());
	const wordList = seededShuffle(defaultData.slice(0), seed).slice(0, 25);
	console.log(wordList.length)
	const evenSeed = (seed % 2) === 0
	const redCount = evenSeed ? 9 : 8;
	const blueCount = evenSeed ? 8 : 9;

	const labelArray = [
		Array(redCount).fill(RED),
	 	Array(blueCount).fill(BLUE),
	 	Array(CIVILIAN_COUNT).fill(CIVILIAN),
	 	Array(ASSASSIN_COUNT).fill(ASSASSIN)
	].flat()

	const shuffledLabels = seededShuffle(labelArray, seed)

	// populate answers
	for(var i = 0; i < wordList.length; i += 1) {
  	answers[wordList[i]] = shuffledLabels[i];
	}

	wordList.forEach((word) => {
		const type = answers[word]
		const square = `<div class="js-word word ${type}" id='${word}'><div><i class="icon fas ${ICONS[type]}"></i><a href="#"><span class="ada"></span>${word}</a></div></div>`

		$("#board").append(square);
	});

	updateScore();

}

$(document).on('dblclick', '.js-word', function() {
	$(this).addClass(SELECTED);
	updateScore();
});

$("#spymaster").on('click', function (){
	$("#board").toggleClass(SPYMASTER)
});

// function createNewGame() {
// 	var trs = [];
// 	for (var i = 0; i < NUMBER_OF_WORDS; i++) {
// 		if (!trs[i % 5]) {
// 			trs[i % 5] = "";
// 		}
// 		var randomNumber = Math.floor(Math.random() * sessionData.length);
// 		var word = sessionData[randomNumber];
// 		removeItem(sessionData, randomNumber);
// 		wordsSelected.push(word);
// 		trs[i % 5] += "<div class=\"word\" id=\'" + i + "\' onclick=\"clicked(\'" + i + "\')\"><div><a href=\"#\"><span class=\"ada\"></span>" + word + "</a></div></div>";
// 	}
// 	//<a href="#"><span class="ada">Washington stimulates economic growth </span>Read me</a>
// 	for (var i = 0; i < trs.length; i++) {
// 		document.getElementById("board").innerHTML += '<div class="row">' + trs[i] + '</div>'
// 	}

// 	//create teams
// 	for (var i = 0; i < 8; i++) {
// 		teams.push(COLOR_RED);
// 		teams.push(COLOR_BLUE);
// 	}

// 	// one extra for one of the teams
// 	if (Math.floor(Math.random() * data.length) % 2 === 0) {
// 		teams.push(COLOR_RED);
// 		// document.getElementById("team").style.color = COLOR_RED;
// 		// document.getElementById("team").innerHTML = "RED";
// 		// $('#board').addClass('redStarts').removeClass('blueStarts');

// 	} else {
// 		teams.push(COLOR_BLUE);
// 		// document.getElementById("team").style.color = COLOR_BLUE;
// 		// document.getElementById("team").innerHTML = "BLUE";
// 		// $('#board').addClass('blueStarts').removeClass('redStarts');
// 	}

// 	// add neturals
// 	for (var i = 0; i < 7; i++) {
// 		teams.push(COLOR_YELLOW);
// 	}

// 	// push the assasin
// 	teams.push(COLOR_BLACK)

// 	//shuffle teams
// 	shuffle(teams);

// 	updateScore();
// }

// function clicked(value) {
// 	if (spyMasterMode) {
// 		//spymaster mode
// 		document.getElementById(value).style.backgroundColor = COLOR_GREEN;
// 	} else {
// 		//guessers mode
// 		var word = wordsSelected[value];
// 		var $selected = $("#" + value);
// 		console.log($selected)
// 		if (document.getElementById("confirm").checked) {
// 			if (window.confirm("Are sure you want to select '" + word + "'?")) {
// 				// $selected.css("background-color", teams[value])
// 				$selected.addClass('selected');
// 				// if (teams[value] == "black") {
// 				// 	document.getElementById(value).style.color = "white";
// 				// }
// 			}
// 		} else {
// 			// document.getElementById(value)
// 			// $selected.style.backgroundColor = teams[value];
// 			// $selected.css("background-color", teams[value])
// 			$selected.addClass('selected');
// 			// $selected.prepend('<i class="icon fas fa-user-secret"></i>')
// 			// if (teams[value] == "black") {
// 			// 	document.getElementById(value).style.color = "white";
// 			// }
// 		}
// 	}
// 	updateScore();
// }

function updateScore() {
	const redLeft = leftForColor(RED)
	const blueLeft = leftForColor(BLUE)

	$('#redScore').text(redLeft + ' left');
	$('#blueScore').text(blueLeft + ' left');
	if(redLeft === 0){
		$('#redScore').text('Winner!');
	}
	if(blueLeft === 0){
		$('#blueScore').text('Winner!');
	}
}

function leftForColor(color) {
	return $("." + color).length - $("." + color + "." + SELECTED).length
}

// function spyMaster() {
// 	//TODO: randomize or organize tiles for easier comparing
// 	spyMasterMode = true;
// 	for (var i = 0; i < NUMBER_OF_WORDS; i++) {
// 		document.getElementById(i).style.backgroundColor = teams[i];
// 		if (teams[i] == "black") {
// 			document.getElementById(i).style.color = "white";
// 		}
// 	}
// }

// function shuffle(array) {
// 	var currentIndex = array.length,
// 		temporaryValue, randomIndex;

// 	// While there remain elements to shuffle...
// 	while (0 !== currentIndex) {

// 		// Pick a remaining element...
// 		randomIndex = Math.floor(Math.random() * currentIndex);
// 		currentIndex -= 1;

// 		// And swap it with the current element.
// 		temporaryValue = array[currentIndex];
// 		array[currentIndex] = array[randomIndex];
// 		array[randomIndex] = temporaryValue;
// 	}

// 	return array;
// }

//enable pressing 'Enter' on seed field
$('#seed').on('keyup', function(e) {
	if (!e) e = window.event;
	var keyCode = e.keyCode || e.which;
	if (keyCode == '13') {
		// Enter pressed
		createGame();
		return false;
	}
});
$('#reset').on('click', function(){
	createGame();
});
