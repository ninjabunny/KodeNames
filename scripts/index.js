var wordsSelected = [];
var teams = [];
var NUMBER_OF_WORDS = 25;
var spyMasterMode = false;

function fire(){
	//get seed
	var seed = document.getElementById("seed").value;
	Math.seedrandom(seed);

	//reset state to pristine state
	wordsSelected = [];
	teams = [];
	spyMasterMode = false;

	//fire new board
	createNewGame();
	// document.getElementById("p1").innerHTML = wordsSelected;


}

function removeItem(array, index){
	if (index > -1) {
		console.log("index: " + index + ", word: " + array[index] + " removed.");
	    array.splice(index, 1);
	}
}

function createNewGame(){
	document.getElementById("board").innerHTML = "";
	var trs = [];
	for(var i = 0; i < NUMBER_OF_WORDS; i++){
		if (!trs[i%5]){
			trs[i%5] = "";
		}
		var randomNumber = Math.floor(Math.random() * data.length);
		var word = data[randomNumber];
		wordsSelected.push(word);
		// removeItem(data, randomNumber);
		trs[i%5] += "<div class=\"word\" id=\'"+ i +"\' onclick=\"clicked(\'" + i + "\')\"><div>" + word + "</div></div>";
	}
	for (var i = 0; i < trs.length; i++){
		document.getElementById("board").innerHTML += '<div class="row">'+trs[i]+'</div>'
	}
	//create teams
	for(var i = 0; i < 8; i++){
		teams.push("#FF4242");
		teams.push("#208FFF");
	}
	// one extra for one of the teams
	if(Math.floor(Math.random() * data.length) % 2 === 0){
		teams.push("#FF4242");
		document.getElementById("team").style.color = "#FF4242";
		document.getElementById("team").innerHTML = "RED";
	}else{
		teams.push("#208FFF");
		document.getElementById("team").style.color = "#208FFF";
		document.getElementById("team").innerHTML = "BLUE";
	}
	

	for(var i = 0; i < 7; i++){
		teams.push("#FFFF99");
	}
	// push the assasin
	teams.push("black")
	shuffle(teams);

}

function clicked(value){
	if(!spyMasterMode){
		var word = wordsSelected[value];
		if (window.confirm("Are sure you want to select '"+word+"'?")){
			document.getElementById(value).style.backgroundColor = teams[value];
			if (teams[value] == "black"){
				document.getElementById(value).style.color = "white";
			}
		}	
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

document.getElementById('seed').onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      // Enter pressed
      fire();
      return false;
    }
  }
