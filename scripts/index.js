
const NUMBER_OF_WORDS = 25;
const CIVILIAN_COUNT = 7
const ASSASSIN_COUNT = 1
const RED = 'red-square'
const BLUE = 'blue-square'
const CIVILIAN = 'civilian-square'
const ASSASSIN = 'assassin-square'
const SELECTED = 'selected'
const SPYMASTER = 'spy-master'
const $board = $('#board');
const $seed = $('#seed');

const $spymaster = $("#spymaster")
const $redScore = $('#redScore')
const $blueScore = $('#blueScore')
const $reset =$('#reset')

const ICONS = {
  [RED] : 'fa-user-secret',
  [BLUE] : 'fa-user-secret',
  [CIVILIAN] : 'fa-walking',
  [ASSASSIN] : 'fa-skull-crossbones'
}

var answers = {};

$seed.val(Math.floor(Math.random() * 1000));
createGame();

function createGame() {
  $board.empty();
  const seed = $seed.val();
  const wordList = seededShuffle(defaultData.slice(0), seed).slice(0, NUMBER_OF_WORDS);

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

    $board.append(square);
  });

  updateScore();

}

$(document).on('dblclick', '.js-word', function() {
  $(this).addClass(SELECTED);
  updateScore();
});

$spymaster.on('click', function (){
  $board.toggleClass(SPYMASTER)
});

$reset.on('click', function(){
  createGame();
});

function updateScore() {
  const redLeft = leftForColor(RED)
  const blueLeft = leftForColor(BLUE)

  $redScore.text(scoreText(redLeft));
  $blueScore.text(scoreText(blueLeft));
}

function leftForColor(color) {
  return $("." + color).length - $("." + color + "." + SELECTED).length
}

function scoreText(score) {
  return score === 0 ? 'Winner!' : score + ' left'
}

//enable pressing 'Enter' on seed field
$seed.on('keyup', function(e) {
  if (!e) e = window.event;
  var keyCode = e.keyCode || e.which;
  if (keyCode == '13') {
    // Enter pressed
    createGame();
    return false;
  }
});

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
