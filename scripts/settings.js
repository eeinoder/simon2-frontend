/* Settings.js */
var isUploading = 1; // Upload score to database if === 1
var isSoundOn = 0; // Sound on if === 1

var usrID; // User id for leaderboard. After first input, save here.
var usrRank; // Rank on leaderboard for current button level (?).

const protected = [13, 83, 88, 67, 65];
const linHotkeyConfigs = [];
const sqHotkeyConfigs = [];
var hotKeys = [85, 73, 79, 80]; // Default hotkey configuration (for 4 linear buttons)

var currKeyCode;  // keyCode of key that's just been pressed
// Protected keys: 13:Enter-"Start", 83:S-"Stats", 88:"Hotkeys", 67:C-"Classic", 65:A-"Advanced"
// Default color keys: 85:U-"Red", 73:I-"Green", 79:O-"Blue", 80:P-"Yellow"
//    NOTE: index matters, i=0 is red, 1=green, 2=blue, 3=yellow

// Options for game and display modes.
const game_modes = ["classic", "advanced"];
const diplay_modes = ["linear", "square"];

// Store high scores for every game mode and level
// to show locally.
var cla_scores = [0,0,0,0,0,0,0,0,0,0,0,0];
var adv_scores = [0,0,0,0,0,0,0,0,0,0,0,0];

// TODO: Store local cache of leaderboard json ...
// var leaderboard_json = [{}];

var isGameStart = 0; //aka, false at the beginning
var isInSequence = 0; //if true, user's clicks should not be counted.
var isInFieldBox = 0; //if user clicks into box, var=1, keyPress listener stops listening
var num_butts = 4;  // Default is 4 on start up
var game_mode = "classic"; // Default game mode is "classic"
var display_mode = "linear"; // Default display mode is "linear"
var buttons_clicked = 0;
var games_played = 0;

var hi_score_cla = 0;   // reset when window is opened (?)
var hi_score_adv = 0;
var curr_score = 0; // reset when 'start' clicked
var curr_color_id = null;
var colorArr = [];
var notesArr = [];
var curr_speed = 500; // 1000 ms = 1s is default inital delay
/* When page is loaded, set user preferences or user's last game state:
User's high scores, button layout, etc.
*/

// On/Off state of buttons represented by a diff val of opacity.
const ON = 1.0;
const OFF = 0.5;


 // Names of all buttons and the order in which they appear in the game.
const colorMapMaster = ["red", "green", "blue", "yellow",
                        "cyan", "lavender", "pumpkin", "violet",
                        "purple", "pink", "navy", "orange"];
// Subset of colorMapMaster representing buttons in play.
var colorMap = ["red", "green", "blue", "yellow"];
// Music note sound effects
var noteMap = ["C3", "Dsharp3", "Fsharp3", "A3",
               "Csharp3", "E3", "G3", "Asharp3",
               "D3", "F3", "Gsharp3", "B3"]; // Chromatics from C3 to C4

$(document).ready(startupSettings());


// Welcome message and set user id reminder on page load
window.onload = () => {
  alert("Welcome! Please set a User ID (3 letters max) for your high scores to be displayed on the Global Leaderboard.")
};

function startupSettings() {
  // TODO: Change this so that it actually looks for these from a database
  // Game score, mode, and layout settings.
  document.getElementById("hi-score").innerHTML = "High Score: " + hi_score_cla;
  document.getElementById("score").innerHTML = "Score: " + curr_score;
  document.getElementById("mode").innerHTML = "Game Mode: " + game_mode.toUpperCase();
  document.getElementById("layout").innerHTML = "Layout: " + display_mode.toUpperCase();
  // Player Stats.
  usrID = "TMP"; // Default user id.
  document.getElementById("numButtons").innerHTML = num_butts;
  document.getElementById("hiScoreCla").innerHTML = hi_score_cla;
  document.getElementById("hiScoreAdv").innerHTML = hi_score_adv;
  document.getElementById("numGames").innerHTML = games_played;
  document.getElementById("numClicks").innerHTML = buttons_clicked;
  // Hotkeys settings.
  updateHotkeys();
  // Update button layout/display settings based on number of buttons and default value.
  updateDisplaySettings();
}

function updateHotkeys() {
  var i, currButton, hotkeyId;
  for (i = 0; i<num_butts; i++) {
    currButton = colorMap[i];
    hotkeyId = currButton + "Text";
    document.getElementById(hotkeyId).value = String.fromCharCode(hotKeys[i]);
  }
  // ALSO, hide/show those labels+fields as necessary
}

function updateDisplaySettings() {
  // num_butts is number of visible buttons. change div width according to layout (lin or sq).
  var buttonContainer = document.getElementById("button-container");
  if (display_mode === "linear") {
    /*if (num_butts < 6 || num_butts > 10) {
      buttonContainer.style.width = "100%";
    }
    else if (num_butts === 6) {
      buttonContainer.style.width = "50%";
    }
    else if (num_butts < 9) {
      buttonContainer.style.width = "65%";
    }
    else {
      buttonContainer.style.width = "85%";
    }*/
    buttonContainer.style.width = "90%";
  }
  else if (display_mode === "square") {
    if (num_butts < 5) {
      buttonContainer.style.width = "50%";
    }
    else if (num_butts < 10) {
      buttonContainer.style.width = "65%";
    }
    else {
      buttonContainer.style.width = "65%";
    }
  }
  else {
    alert("Display mode error.")
    return;
  }
}




/* GAME MODE EVENT LISTENERS */
var classic = document.getElementById('classic');
classic.addEventListener('click', toggleMode);
var advanced = document.getElementById('advanced');
advanced.addEventListener('click', toggleMode);
var help = document.getElementById('help');
help.addEventListener('click', (event => {
  alert("Classic play:\n\tRepeat the pattern correctly to increase your score." +
  "\n\nAdvanced play:\n\tLike classic play but only the last light in the new" +
  "\n\tsequence will be shown.");
}));

function toggleMode(e) {
  var gameMode;
  if (isGameStart === 1) {
    alert("Game already in progress.");
    return;
  }
  if (e.code === "KeyC") {gameMode = "classic";}
  else if (e.code === "KeyA") {gameMode = "advanced";}
  else {gameMode = e.target.id;}
  document.getElementById("mode").innerHTML = "Game Mode: " + gameMode.toUpperCase();
  game_mode = gameMode;
  // Zero out current score.
  curr_score = 0;
  updateScores(); // function() in gameCode.js
  //console.log(game_mode);
}





/* GAME STATS EVENT LISTENER */
var stats = document.getElementById('statsButton');
stats.addEventListener('click', toggleStatsBox);

function toggleStatsBox(e) {
  var statsBox = document.getElementById("statsBox");
  var vis = statsBox.style.visibility;
  //console.log(vis);
  if (vis === 'hidden') {statsBox.style.visibility = "visible";}
  else {statsBox.style.visibility = "hidden";}
}





/* HOTKEYS BOX EVENT LISTENER - toggle visibilty */
var hotkeys = document.getElementById('hotkeysButton');
hotkeys.addEventListener('click', toggleHotBox);

/* UPDATEBINDINGS HELPER - If button layout changed, change default key bindings */
function updateBindings() {
 // TODO: update bindings code here
}

function toggleHotBox(e) {
  var hotkeysBox = document.getElementById("hotBox");
  var vis = hotkeysBox.style.visibility;
  //console.log(vis);
  if (vis === 'hidden') {hotkeysBox.style.visibility = "visible";}
  else {hotkeysBox.style.visibility = "hidden";}
}

/* On Click - "stop" event listener for key presses */
const hotInputs = document.getElementById("hotBox");
hotInputs.addEventListener('click', (event) => {
  const isInput = event.target.nodeName === 'INPUT';
  if (!isInput) {return;}
  isInFieldBox = 1;
});

/* On Input - filter for acceptable input key */
hotInputs.addEventListener('input', (event) => {
  const isInput = event.target.nodeName === 'INPUT';
  var inputVal, currVal, val, inputCharCode, currCharCode;
  // Attempt at handling bug where input is left/right of old hotkey and is handled
  // differently. Solution: Find index of hotkey of this colorId -> other index is where
  // new input is.
  val = event.target.value;
  currCharCode = hotKeys[colorMap.indexOf(event.target.name)];
  currVal = String.fromCharCode(currCharCode)
  currValIndex = val.indexOf(currVal);
  if (currValIndex === 0) {
    inputVal = val.charAt(1);
  }
  else if (currValIndex === 1 || currValIndex === -1) {
    inputVal = val.charAt(0);
  }
  else {
    event.target.value = currVal;
    return;
  }
  //console.log(currVal);
  //console.log(inputVal);
  inputCharCode = inputVal.toUpperCase().charCodeAt(0);
  if (!isInput) {return;}

  // If value is protected, e.g. Enter, S, C, or A, forbidden.        ---[WORKS]---
  if (protected.includes(currKeyCode)) {
    alert("Error: This key is protected.");
    event.target.value = currVal;
    return;
  }
  // If value is not alphanumeric/ Js keyCode =/= charCode            ---[WORKS]---
  // TODO: fix by making plugin that corrects keyCode -> charCode; eliminate condition.
  if (currKeyCode !== inputCharCode) {
    alert("Error: Invalid key. Choose alphanumeric character.");
    event.target.value = currVal;
    return;
  }
  // If value is already in use, SWAP current with desired val.
  if (hotKeys.includes(currKeyCode)) {
    var thisColorId = event.target.name; // e.g. red
    var swapWithIndex = hotKeys.indexOf(currKeyCode); // e.g. 1->green
    var swapWithId = colorMap[swapWithIndex]; // e.g. green
    event.target.value = inputVal.toUpperCase();
    document.getElementById(swapWithId + "Text").value = currVal.toUpperCase();
    hotKeys[colorMap.indexOf(thisColorId)] = inputCharCode;
    hotKeys[swapWithIndex] = currCharCode;
  }
  // If value not in use, change it to desired val.                   ---[WORKS]---
  else {
    event.target.value = inputVal.toUpperCase(); // Update field.
    hotKeys[colorMap.indexOf(event.target.name)] = currKeyCode;
  }
});

/* Click outside input field to turn on keyPress listeners again */
/* document.addEventListener('click', (event) => {
  const isInput = event.target.nodeName === 'INPUT';
  if (isInput) {return;}
  isInFieldBox = 0;
});
*/





/* MUTE AND SOUND BUTTONS LISTENER */
/*const muteButton = document.getElementById("muteButton");
const unmuteButton = document.getElementById("unmuteButton");
//const saveOnButton = document.getElementById("saveOnButton");
//const saveOffButton = document.getElementById("saveOffButton");
muteButton.addEventListener('click', (event) => {
  console.log("Mute");
  // Click muteButton -> unMute button becomes visible. Sound is on.
  unmuteButton.classList.remove("hidden");
  muteButton.classList.add("hidden");
  isSoundOn = 1;
})
unmuteButton.addEventListener('click', (event) => {
  console.log("UnMute");
  // Click unmuteButton -> muteButton becomes visible. Sound is off.
  muteButton.classList.remove("hidden");
  unmuteButton.classList.add("hidden");
  isSoundOn = 0;
})*/
/*saveOnButton.addEventListener('click', (event) => {
  // Click saveOn -> saveOff. Save/upload to db is off.
  saveOffButton.classList.remove("hidden");
  saveOnButton.classList.add("hidden");
  isUploading = 0;
})
saveOffButton.addEventListener('click', (event) => {
  // Click saveOff -> saveOn. Save/upload to db is on.
  saveOnButton.classList.remove("hidden");
  saveOffButton.classList.add("hidden");
  isUploading = 1;
})*/





/* USER ID FIELD EVENT LISTENER */
const usrid = document.getElementById("usridText");
var input;
usrid.addEventListener('click', (event) => {
  // erase current id from box (saved as current global: usrID)
  usrid.value = "";
  isInFieldBox = 1;
})

usrid.addEventListener('input', (event) => {
  // stop input after 3 characters
  input = usrid.value;
  if (input.length > 3) {
    usrid.value = input.substr(0,3);
  }
})

/* Click outside input field to turn on keyPress listeners again, ALSO check */
document.addEventListener('click', (event) => {
  // verify input is acceptable: length of 3,
  // If any conditions fail, alert & populate field w/ previous user id
  var Exp = /^[0-9a-zA-Z]+$/; // Alphanumeric regex to check against input string
  const isInput = event.target.nodeName === 'INPUT';

  if (isInput) {return;} // For keyPressHandler event listener
  isInFieldBox = 0;

  input = usrid.value;
  if(!input.match(Exp)) { // For usrid event listener
    alert("User id must consist of up to 3 alphanum characters.");
    usrid.value = usrID;
  }
  else {
    usrid.value = input.toUpperCase();
    usrID = usrid.value;
  }

  //console.log("User:" + usrID);
});





/* LEADERBOARD BUTTON EVENT LISTENER */
const leaderboardListener = document.getElementById("rankButton");
const leaderboard = document.getElementById("leaderboard");
const loading_msg = document.getElementById("leaderboard_loading_msg");
leaderboardListener.addEventListener('click', (event) => {
  var vis = leaderboard.style.visibility;
  // Toggle leaderboard window
  if (vis === 'hidden') {
    // TODO: keep cache of db data, only make new fetch request if player has new high score and/or after timer elapsed (1 min?)
    loading_msg.innerHTML = "Loading...";
    getLeaderboardScoresBackend(game_mode, num_butts); // TODO -- load default values if err?
    leaderboard.style.visibility = 'visible';
    document.body.classList.add("filterGrayscale");
  }
});

/* LEADERBOARD HELPERS -- called by client.js, format and render user score data */
function formatAndRenderScoresList(userscores_data) {
  loading_msg.innerHTML = "";
  if (userscores_data !== undefined) {
    clearLeaderboardDiv();
    userscores_data.forEach((entry) => {
      var userscore_str = `${entry["user_id"]} ----- ${entry["score"]}`;
      addScoreToLeaderboardDiv(userscore_str);
    });
  }
  const leaderboard_subtitle = document.getElementById("leaderboard_subtitle");
  leaderboard_subtitle.innerHTML = `${game_mode.toUpperCase()} / ${num_butts}-Buttons`;
}
function addScoreToLeaderboardDiv(userscore_str) {
  const leaderboard_div = document.getElementById("scores_list");
  var new_score_div = document.createElement('div');
  leaderboard_div.appendChild(new_score_div);
  new_score_div.className = 'leaderboard_text';
  new_score_div.innerHTML = userscore_str;
}
function clearLeaderboardDiv() {
  const leaderboard_div = document.getElementById("scores_list");
  while (leaderboard_div.firstChild) {
    leaderboard_div.removeChild(leaderboard_div.lastChild);
  }
}

/* "BODY" CLICK EVENT HANDLER -- TOGGLE LEADERBOARD "OFF" */
document.body.addEventListener('click', () => {
  leaderboard.style.visibility = 'hidden';
  document.body.classList.remove("filterGrayscale");
}, true);




/* DISPLAY BUTTONS EVENT LISTENER */
/* Dummy linear and square button layout buttons event listener,
   Dummy Plus/Minus buttons event listener */
const toolbuttonListener = document.getElementById("toolbar");
toolbuttonListener.addEventListener('click', (event) => {
  const isButton = event.target.nodeName === 'BUTTON';  // do click effects.
  var buttonID = event.target.id;
  //console.log(buttonID);
  var targetGameButton;
  if (!isButton) {return;}
  if (isGameStart === 1) {
    alert("Game is in progress.");
    return;
  }
  /* 'LINEAR LAYOUT' BUTTON */
  if (buttonID === "linLayout" && display_mode !== "linear") {
    display_mode = "linear";
    document.getElementById("layout").innerHTML = "Layout: " + display_mode.toUpperCase();
  }
  /* 'SQUARE LAYOUT' BUTTON */
  else if (buttonID === "sqLayout" && display_mode !== "square") {
    display_mode = "square";
    document.getElementById("layout").innerHTML = "Layout: " + display_mode.toUpperCase();
  }
  /* 'ADD' BUTTON */
  else if (buttonID === "addButton" && num_butts < 12) {
    targetGameButton = document.getElementById(colorMapMaster[num_butts]);
    targetGameButton.style.display = "inline";
    colorMap.push(colorMapMaster[num_butts]);
    // increment button counter
    num_butts++;
    document.getElementById("numButtons").innerHTML = num_butts;
    // update hi scores
    hi_score_cla = cla_scores[num_butts-1];
    hi_score_adv = adv_scores[num_butts-1];
    curr_score = 0;
    updateScores();
  }
  /* 'SUBTRACT' BUTTON */
  else if (buttonID === "subButton" && num_butts > 2) {
    targetGameButton = document.getElementById(colorMapMaster[num_butts-1]);
    targetGameButton.style.display = "none";
    colorMap.pop();
    // decrement button counter
    num_butts--;
    document.getElementById("numButtons").innerHTML = num_butts;
    // update hi scores
    hi_score_cla = cla_scores[num_butts-1];
    hi_score_adv = adv_scores[num_butts-1];
    curr_score = 0;
    updateScores();
  }
  updateDisplaySettings();
});
