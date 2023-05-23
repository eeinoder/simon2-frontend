/* Sounds.js */

/* */
function userPlayNote(index) {
  if (isSoundOn === 0) {
    return;
  }
  var note = noteMap[index];
  new Audio("style/sounds/"+note+".wav").play();
}

/* Make new note to be stored in notesArr, and played back by computer. */
function newNote(buttonID) {
  var buttonNote = noteMap[buttonID];
  notesArr.push(new Audio("style/sounds/"+buttonNote+".wav"));
}

/* Play note in notesArr as computer goes through sequence. */
function playNote(noteIndex) {
  if (isSoundOn === 0) {
    return;
  }
  notesArr[noteIndex].play();
}
