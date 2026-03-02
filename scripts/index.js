/*
Notes:
'data' is lazily imported from the html.
'seedrandom' is also imported from html. it gives deterministic random #s based on a seed set in fire().
*/

var wordsSelected = [];
var teams = [];
var NUMBER_OF_WORDS = 25;
var spyMasterMode = false;
var sessionData = [];
var customData = [];
var FIRE_REQUEST_ID = 0;

var COLOR_RED = "#ff0000";
var COLOR_YELLOW = "#ffff00";
var COLOR_BLUE = "#00eeee";
var COLOR_BLACK = "#808080";
var COLOR_GREEN = "#009000";

var AI_MODE = "ai";
var AI_ENDPOINT = window.KODENAMES_AI_ENDPOINT || "/api/words";
var AI_REQUEST_TIMEOUT_MS = 8000;

//init
$("#seed").keyup(function(e) {
	var option = $('#gameMode :selected').val();
	var keyCode = e && (e.keyCode || e.which);
	if (option === AI_MODE && keyCode !== 13) {
		// Avoid calling AI on every keystroke. AI mode should update on Enter/Reset.
		return;
	}
	fire();
});

$("#gameMode").change(function() {
	fire();
});

$("#seed").val(Math.floor(Math.random() * 1000));
fire();

function setStatus(text, isError) {
	var statusElement = document.getElementById("statusText");
	if (!statusElement) {
		return;
	}
	statusElement.textContent = text || "";
	if (isError) {
		statusElement.classList.add("error");
	} else {
		statusElement.classList.remove("error");
	}
}

function normalizeAIWords(rawWords, requestedCount) {
	if (!Array.isArray(rawWords)) {
		return null;
	}
	var seen = {};
	var cleaned = [];
	for (var i = 0; i < rawWords.length; i++) {
		var text = String(rawWords[i]).replace(/\s+/g, " ").trim();
		if (!text) {
			continue;
		}
		var key = text.toLowerCase();
		if (seen[key]) {
			continue;
		}
		seen[key] = true;
		cleaned.push(text);
	}
	if (cleaned.length < requestedCount) {
		return null;
	}
	return cleaned.slice(0, requestedCount);
}

async function fetchAIWords(seed, requestedCount, requestId) {
	setStatus("Generating AI words...", false);
	var controller = new AbortController();
	var timeoutHandle = setTimeout(function() {
		controller.abort();
	}, AI_REQUEST_TIMEOUT_MS);

	try {
		var url = AI_ENDPOINT + "?seed=" + encodeURIComponent(seed || "") + "&count=" + encodeURIComponent(requestedCount);
		var response = await fetch(url, {
			method: "GET",
			cache: "no-store",
			headers: {
				"Accept": "application/json"
			},
			signal: controller.signal
		});
		if (!response.ok) {
			throw new Error("AI response status " + response.status);
		}

		var payload = await response.json();
		var words = normalizeAIWords(payload.words, requestedCount);
		if (!words) {
			throw new Error("AI response did not return enough unique words.");
		}
		if (requestId !== FIRE_REQUEST_ID) {
			return null;
		}

		if (payload.source === "cache") {
			setStatus("AI words loaded from cache (seed: " + seed + ").", false);
		} else if (payload.source === "fallback") {
			setStatus("Using backup word set (seed: " + seed + ").", false);
		} else {
			setStatus("AI words generated (seed: " + seed + ").", false);
		}
		return words;
	} catch (error) {
		if (requestId === FIRE_REQUEST_ID) {
			setStatus("AI unavailable. Using default words (seed: " + seed + ").", true);
		}
		return defaultData.slice(0);
	} finally {
		clearTimeout(timeoutHandle);
	}
}

async function fire() {
	var requestId = ++FIRE_REQUEST_ID;

	//get seed and set the seed for randomizer
	var seed = document.getElementById("seed").value;
	var normalizedSeed = (seed || "").trim().toLowerCase();
	Math.seedrandom(normalizedSeed);

	var option = $('#gameMode :selected').val();
	var nextSessionData = [];

	switch (option) {
		case AI_MODE:
			var aiWords = await fetchAIWords(normalizedSeed, NUMBER_OF_WORDS, requestId);
			if (requestId !== FIRE_REQUEST_ID || aiWords === null) {
				return;
			}
			nextSessionData = aiWords.slice(0);
			break;
		case 'spanish':
			setStatus("", false);
			nextSessionData = spanishData.slice(0);
			break;
		case '2knouns':
			setStatus("", false);
			nextSessionData = data.slice(0);
			break;
		case 'movies':
			setStatus("", false);
			nextSessionData = movieData.slice(0);
			break;
		case 'custom':
			setStatus("", false);
			if (customData.length === 0) {
				var customWordList = prompt("Please enter custom word list. The list will be saved until your refresh your browser. (The words MUST be delimanted by spaces). eg: cat dog mouse", "Enter words here");
				if (customWordList) {
					customData = customWordList.split(' ');
				}
			}
			nextSessionData = (customData.length > 0 ? customData : defaultData).slice(0);
			break;
		default:
			setStatus("", false);
			nextSessionData = defaultData.slice(0);
	}

	if (requestId !== FIRE_REQUEST_ID) {
		return;
	}

	sessionData = nextSessionData;
	wordsSelected = [];
	teams = [];
	spyMasterMode = false;
	document.getElementById("board").innerHTML = "";

	//fire new board
	updateScore();
	createNewGame();
}

//not used, but probably useful at some point
function removeItem(array, index) {
	if (index > -1) {
		// console.log("index: " + index + ", word: " + array[index] + " removed.");
		array.splice(index, 1);
	}
}

function createNewGame() {
	var trs = [];
	for (var i = 0; i < NUMBER_OF_WORDS; i++) {
		if (!trs[i % 5]) {
			trs[i % 5] = "";
		}
		var randomNumber = Math.floor(Math.random() * sessionData.length);
		var word = sessionData[randomNumber];
		removeItem(sessionData, randomNumber);
		wordsSelected.push(word);
		trs[i % 5] += "<div class=\"word\" id=\'" + i + "\' onclick=\"clicked(\'" + i + "\')\"><div><a href=\"#\"><span class=\"ada\"></span>" + word + "</a></div></div>";
	}
	//<a href="#"><span class="ada">Washington stimulates economic growth </span>Read me</a>
	for (var j = 0; j < trs.length; j++) {
		document.getElementById("board").innerHTML += '<div class="row">' + trs[j] + '</div>';
	}

	//create teams
	for (var k = 0; k < 8; k++) {
		teams.push(COLOR_RED);
		teams.push(COLOR_BLUE);
	}

	// one extra for one of the teams
	if (Math.floor(Math.random() * data.length) % 2 === 0) {
		teams.push(COLOR_RED);
		$('#board').addClass('redStarts').removeClass('blueStarts');

	} else {
		teams.push(COLOR_BLUE);
		$('#board').addClass('blueStarts').removeClass('redStarts');
	}

	// add neturals
	for (var l = 0; l < 7; l++) {
		teams.push(COLOR_YELLOW);
	}

	// push the assasin
	teams.push(COLOR_BLACK);

	//shuffle teams
	shuffle(teams);

	updateScore();
}

function clicked(value) {
	if (spyMasterMode) {
		//spymaster mode
		document.getElementById(value).style.backgroundColor = COLOR_GREEN;
	} else {
		//guessers mode
		var word = wordsSelected[value];
		if (document.getElementById("confirm").checked) {
			if (window.confirm("Are sure you want to select '" + word + "'?")) {
				document.getElementById(value).style.backgroundColor = teams[value];
				if (teams[value] == "black") {
					document.getElementById(value).style.color = "white";
				}
			}
		} else {
			document.getElementById(value).style.backgroundColor = teams[value];
			if (teams[value] == "black") {
				document.getElementById(value).style.color = "white";
			}
		}
	}
	updateScore();
}

function updateScore() {
	var blueScore = 9;
	var redScore = 9;
	if (spyMasterMode) {
		blueScore = 0;
		redScore = 0;
		$('div.word').each(function() {
			var color = $(this).css('background-color');
			if (color === 'rgb(0, 238, 238)') {
				blueScore++;
			}
			if (color === 'rgb(255, 0, 0)') {
				redScore++;
			}
		});
	} else {
		$('div.word').each(function() {
			var color = $(this).css('background-color');
			if (color === 'rgb(0, 238, 238)') {
				blueScore--;
			}
			if (color === 'rgb(255, 0, 0)') {
				redScore--;
			}
		});

		if ($('.redStarts').length === 1) {
			blueScore--;
		} else {
			redScore--;
		}
	}
	$('#redScore').text(redScore);
	$('#blueScore').text(blueScore);
	if (redScore === 0) {
		$('#redScore').text('Winner!');
	}
	if (blueScore === 0) {
		$('#blueScore').text('Winner!');
	}
}

function spyMaster() {
	//TODO: randomize or organize tiles for easier comparing
	spyMasterMode = true;
	for (var i = 0; i < NUMBER_OF_WORDS; i++) {
		document.getElementById(i).style.backgroundColor = teams[i];
		if (teams[i] == "black") {
			document.getElementById(i).style.color = "white";
		}
	}
}

function shuffle(array) {
	var currentIndex = array.length,
		temporaryValue, randomIndex;

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
document.getElementById('seed').onkeypress = function(e) {
	if (!e) e = window.event;
	var keyCode = e.keyCode || e.which;
	if (keyCode == '13') {
		// Enter pressed
		fire();
		return false;
	}
};
