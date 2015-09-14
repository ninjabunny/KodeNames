var wordsSelected = [];
var teams = [];
var NUMBER_OF_WORDS = 25;

function fire(){
	//get seed
	var seed = document.getElementById("seed").value;
	Math.seedrandom(seed);

	//clear words
	wordsSelected = [];
	teams = [];

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
		trs[i%5] += "<td id=\'"+ i +"\' onclick=\"clicked(\'" + i + "\')\">" + word + "</td>";
	}
	for (var i = 0; i < trs.length; i++){
		document.getElementById("board").innerHTML += '<tr>'+trs[i]+'</tr>'
	}
	//create teams
	for(var i = 0; i < 8; i++){
		teams.push("red");
		teams.push("yellow");
		teams.push("blue");
	}
	teams.push("grey")
	shuffle(teams);

}

function clicked(value){
	var word = document.getElementById(value).innerHTML;
	if (window.confirm("Are sure you want to select '"+word+"'?")){
		document.getElementById(value).style.backgroundColor = teams[value];
	}
}

function spyMaster(){
	for(var i = 0; i < NUMBER_OF_WORDS; i++){
		document.getElementById(i).style.backgroundColor = teams[i];
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
