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

var COLOR_RED = "#ff0000";
var COLOR_YELLOW = "#ffff00";
var COLOR_BLUE = "#00eeee";
var COLOR_BLACK = "#2a2a2a";
var COLOR_GREEN = "#009000";

//init
$("#seed").keyup(function() {
	fire();
	setQueryParameter('seed', $('#seed').val());
});

$("#gameMode").change(function() {
	fire();
});

if (getQueryParameterByName('seed')) {
	$("#seed").val(getQueryParameterByName('seed'));
} else {
	$("#seed").val(Math.floor(Math.random() * 1000));
}

// Make the game easily sharable
window.setTimeout(function() {
	setQueryParameter('seed', $('#seed').val());
}, 500);


fire();

function fire() {
	// Get seed and set the seed for randomizer
	var seed = document.getElementById("seed").value;
	Math.seedrandom(seed.toLowerCase());

	var option = $('#gameMode :selected').val();
	switch (option) {
		case 'spanish':
			sessionData = spanishData.slice(0);
			break;
		case '2knouns':
			sessionData = data.slice(0);
			break;
		case 'movies':
			sessionData = movieData.slice(0);
			break;
		case 'custom':
			if (customData.length === 0) {
				var customWordList = prompt("Please enter custom word list. The list will be saved until your refresh your browser. (The words MUST be delimanted by spaces). eg: cat dog mouse", "Enter words here");
				customData = customWordList.split(' ');
			}
			sessionData = customData.slice(0);
			break;
		default:
			sessionData = defaultData.slice(0);
	}

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
	for (var i = 0; i < trs.length; i++) {
		document.getElementById("board").innerHTML += '<div class="row">' + trs[i] + '</div>'
	}

	//create teams
	for (var i = 0; i < 8; i++) {
		teams.push(COLOR_RED);
		teams.push(COLOR_BLUE);
	}

	// one extra for one of the teams
	if (Math.floor(Math.random() * data.length) % 2 === 0) {
		teams.push(COLOR_RED);
		// document.getElementById("team").style.color = COLOR_RED;
		// document.getElementById("team").innerHTML = "RED";
		$('#board').addClass('redStarts').removeClass('blueStarts');

	} else {
		teams.push(COLOR_BLUE);
		// document.getElementById("team").style.color = COLOR_BLUE;
		// document.getElementById("team").innerHTML = "BLUE";
		$('#board').addClass('blueStarts').removeClass('redStarts');
	}

	// add neturals 
	for (var i = 0; i < 7; i++) {
		teams.push(COLOR_YELLOW);
	}

	// push the assasin
	teams.push(COLOR_BLACK)

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
	if(redScore === 0){
		$('#redScore').text('Winner!');
	}
	if(blueScore === 0){
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

// Enable pressing 'Enter' on seed field
document.getElementById('seed').onkeypress = function(e) {
	if (!e) e = window.event;
	var keyCode = e.keyCode || e.which;
	if (keyCode == '13') {
		// Enter pressed
		fire();
		setQueryParameter('seed', $('#seed').val());
		return false;
	}
}

// Taken from:
// https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getQueryParameterByName(name) {
	var url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Based on from:
// http://stackoverflow.com/a/10997390/11236
//        and
// https://stackoverflow.com/questions/1090948/change-url-parameters
function setQueryParameter(name, val) {
	function updateURLParameter(url, param, paramVal){
		var newAdditionalURL = "";
		var tempArray = url.split("?");
		var baseURL = tempArray[0];
		var additionalURL = tempArray[1];
		var temp = "";
		if (additionalURL) {
			tempArray = additionalURL.split("&");
			for (var i=0; i<tempArray.length; i++){
				if(tempArray[i].split('=')[0] != param){
					newAdditionalURL += temp + tempArray[i];
					temp = "&";
				}
			}
		}

		var rows_txt = temp + "" + param + "=" + paramVal;
		return baseURL + "?" + newAdditionalURL + rows_txt;
	}

	window.history.replaceState('', '', updateURLParameter(window.location.href, name, val.toString()));
}
