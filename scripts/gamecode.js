/* Start game after start button pressed */
var start_butt = document.getElementById('start');
start_butt.addEventListener('click', startGame);

function startGame() {
  if (isGameStart === 1) {
    // cannot Start a game while one is in progress OR if mode is not selected.
    alert("Game is already in progress.");
    return;
  }
  if (game_mode === null) {
    alert("Select game mode.");
    return;
  }
  // Set initial game paramters. // Defined in settings.js
  isGameStart = 1;
  isNewHiScore = 0;
  isInSequence = 0;
  curr_score = 0;
  curr_color_id = 0;
  colorArr = [];
  notesArr = [];
  curr_speed = 500; // ms between color on/off states
  games_played++;
  document.getElementById("numGames").innerHTML = games_played;
  document.getElementById("score").innerHTML = "Score: 0";
  chooseButton();
}

/* startGame() calls this initially. Wait for EventListener on buttons. Calls
chooseButton() if selection is correct. */
// Loop through colorArr for "classic" mode.
// Don't loop for
function chooseButton() {
  var rand_butt = Math.floor(Math.random() * num_butts);
  colorArr.push(colorMap[rand_butt]); // Choose random color. Store in the colorArr.
  newNote(rand_butt); // Store new Audio obj in notesArr.
  //console.log(colorArr);
  isInSequence = 1;                 // Com is choosing/displaying color sequence.
  //console.log(isInSequence);
  if (game_mode === "classic") {
    var len = colorArr.length;
    for (var i=0; i<2*len; i++) {
      // Use Math.floor to toggle each light twice (on then off).
      (function(i){
        setTimeout(function() {
          if (i%2 === 0) {
            // Play sound to corresponding button
            playNote(i/2);
          }
          toggleButton(colorArr[Math.floor(i/2)]);
          if (i === 2*len - 1) {
            isInSequence = 0;
          }
        }, curr_speed*(i+1)); // increase speed
      })(i);
    }
  }
  else if (game_mode === "advanced") {
    // Play sound to corresponding button
    userPlayNote(rand_butt);
    //console.log(colorMap[rand_butt]);
    setTimeout(function() {toggleButton(colorMap[rand_butt]);}, curr_speed); //asynchronous
    setTimeout(function() {
      toggleButton(colorMap[rand_butt]);
      isInSequence = 0;
      //console.log(isInSequence);
    }, curr_speed*2);
  }
  curr_speed = curr_speed * 0.9;// Increase speed.
}


// HANDLER: change button opacity when bot chooses button
// NOTE: toggle math relies on 0.5, 1.0 val to toggle: 0.5 -> 1.0; 1.0 -> 0.5
function toggleButton (color) {
  var targetButton = document.getElementById(color);
  var opacity = window.getComputedStyle(targetButton).opacity;
  //console.log(targetButton + " pre-opacity: " + opacity);
  targetButton.style.opacity = ((opacity*10)%10 + 5) / 10;
  //console.log(targetButton + " post-opacity: " + targetButton.style.opacity);
}


// HANDLER: compare user selection with bot selection
function compareButton(usr_color) {
  var buttonObj = document.getElementById(usr_color);
  // Selection is Correct
  if (usr_color === colorArr[curr_color_id]) {
    curr_color_id++;
    // Final selection in current sequence is correct
    if (curr_color_id === colorArr.length) {
      console.log("Correct!");
      if (game_mode === "classic") {
        if (hi_score_cla === curr_score) {
          hi_score_cla++;
          isNewHiScore = 1;
        }
      }
      else if (game_mode === "advanced") {
        if (hi_score_adv === curr_score) {
          hi_score_adv++;
          isNewHiScore = 1;
        }
      }
      curr_score++;
      curr_color_id = 0;
      chooseButton();
    }
  }
  // Selection is Incorrect
  else {
    isGameStart = 0;
    var hi_score;
    if (game_mode === "classic") {hi_score = hi_score_cla;}
    else if (game_mode === "advanced") {hi_score = hi_score_adv;}
    alert("You lose!")
    if (isNewHiScore === 1) {
      isNewHiScore = 0;
      alert("New High Score!")
      if (usrID !== 'TMP') {
        addEntryLeaderboardDB(game_mode, num_butts, usrID, hi_score);
      }
    }

    // Set button vis settings to default
    buttonObj.style.filter = "brightness(1.0)";
    buttonObj.style.opacity = 0.5;
    buttonObj.style.boxShadow = "none";
    // Store hi scores in array (local).
    cla_scores[num_butts-1] = hi_score_cla;
    adv_scores[num_butts-1] = hi_score_adv;
  }
  updateScores();
}


// HANDLER: update hi scores displayed in stats box ad stored in array.
function updateScores() {
  var hi_score;
  if (game_mode === "classic") {hi_score = hi_score_cla;}
  else if (game_mode === "advanced") {hi_score = hi_score_adv;}
  var hiscore_str = "High Score: " + hi_score;
  var score_str = "Score: " + curr_score;
  // Write to score card above and player stats div box below.
  document.getElementById("hi-score").innerHTML = hiscore_str;
  document.getElementById("score").innerHTML = score_str;
  document.getElementById("hiScoreCla").innerHTML = hi_score_cla;
  document.getElementById("hiScoreAdv").innerHTML = hi_score_adv;
}


// HANDLER: update vals if answer is correct. TODO: FIX THIS!!!
/*function updateLeaderboard() {
  if (isUploading === 0) {
    return;
  }
  // TODO: prevent user input of anything besides 3 char name,
  // Default user name is TMP (temporary)
  // ajaxDbCxn();
}*/


// HANDLER: keyPressHandler
// TODO: make plug-in/helper to get charCode from keyCode.
// e.g. numpad1-9 keyCode is a-i charCode..
function keyPressHandler(event) {
  var keyCode = event.keyCode;
  //console.log(keyCode);
  //console.log(String.fromCharCode(keyCode));
  currKeyCode = keyCode;
  var clrIndex = hotKeys.indexOf(keyCode);
  var clrObj = document.getElementById(colorMap[clrIndex]);

  if (isInFieldBox === 1) {   // User clicked into hotkey box to make changes.
    //if (event.type === "keydown") {console.log("code " + keyCode);}
    return;
  }

  if (clrIndex === -1) {     // Not a *color* hotkey (e.g. Enter -> "Start")
    if (keyCode === 13) { // Enter key
      if (event.type === "keydown") {startGame();}
    }
    else if (keyCode === 67 || keyCode === 65) { // "C" or "A", resp.
      toggleMode(event);
    }
    else if (keyCode === 83) { // "S"
      if (event.type === "keydown") {toggleStatsBox();}
    }
    else if (keyCode === 88) { // "X"
      if (event.type === "keydown") {toggleHotBox();}
    }
  }
  else {                          // A color hotkey.
    if (event.type === "keydown") {
      clrObj.style.opacity = 1.0;
      clrObj.style.boxShadow = "0 0 5px 5px grey";
      buttons_clicked++;
      document.getElementById("numClicks").innerHTML = buttons_clicked;
      // Play sound to corresponding button
      userPlayNote(clrIndex);
    }
    else if (event.type === "keyup") {
      clrObj.style.opacity = 0.5;
      clrObj.style.boxShadow = "none";
      if (isGameStart === 1 && isInSequence === 0) {
        compareButton(clrObj.id);
      }
    }
  }
}





/* GAME BUTTONS EVENT LISTENER */
const wrapper = document.getElementById('buttons');
wrapper.addEventListener('mousedown', (event) => {      // Register click and
  const isButton = event.target.nodeName === 'BUTTON';  // do click effects.
  if (!isButton) {return;}
  else {
    event.target.style.opacity = 1.0;
    event.target.style.filter = "brightness(1.0)";
    event.target.style.boxShadow = "0 0 5px 5px grey";
    buttons_clicked++;
    document.getElementById("numClicks").innerHTML = buttons_clicked;
  }
  // Play sound to corresponding button
  userPlayNote(colorMap.indexOf(event.target.id));
});
wrapper.addEventListener('mouseup', (event) => {        // Click up.
  const isButton = event.target.nodeName === 'BUTTON';
  if (!isButton) {return;}
  event.target.style.opacity = 0.5;
  event.target.style.filter = "brightness(0.75)";
  event.target.style.boxShadow = "none";
  if (isGameStart === 1 && isInSequence === 0) {
    compareButton(event.target.id);
  }
});
wrapper.addEventListener('mouseover', (event) => {     // Hover in: make darker.
  const isButton = event.target.nodeName === 'BUTTON';
  if (!isButton) {return;}
  if (isInSequence) {return;}
  event.target.style.filter = "brightness(0.75)";
});
wrapper.addEventListener('mouseout', (event) => {       // Hover out: make brighter.
  const isButton = event.target.nodeName === 'BUTTON';  // Revert click effects if
  if (!isButton) {return;}                              // click up happens outside                         // button box.
  event.target.style.filter = "brightness(1.0)";
  event.target.style.opacity = 0.5;
  event.target.style.boxShadow = "none";
});


/* KEYPRESSES EVENT LISTENERS */
document.addEventListener('keydown', keyPressHandler);
document.addEventListener('keyup', keyPressHandler);


/* TOGGLE OPACITY HOVER EVENT LISTENER AND HANDLER */
$("button.otherbutton").hover(function() {
  var opacity = window.getComputedStyle(this).opacity;
  this.style.opacity = ((opacity*10)%10 + 5) / 10;
});

















/* End of script */
