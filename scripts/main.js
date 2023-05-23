// Main.js

function loadScript(url) {
    var script = document.createElement("script"); //Make a script DOM node
    script.src = url; //Set it's src to the provided URL
    document.body.appendChild(script); //Add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}

loadScript("scripts/client.js");
loadScript("scripts/settings.js");
loadScript("scripts/sounds.js");
loadScript("scripts/gamecode.js");
loadScript("scripts/animation.js");



/* TODO:

Easter Eggs /Fun features:
Mess with the player:
    -After arbitrary round, Add new button
    -... take away button
    -... change button location/color after sequence
"Gauntlet Mode":
    -Give player a certain amount of lives (3?), get more for successful sequences
    -Add button after N successful attempts ***
    -Game gets quicker faster / random bursts or jumps in speed
    -Only show buttons in quick flash ***
    -Wash out color (slowly apply grayscale filter)
    -(When sound works) get rid of flash indicator, only go off of sound

GAME NOTE(s):
Varieties of Simon that already exist:
    -Super simon: reaction time game, get a different sequence every time
    -Simon trickster: colors "jump", every color becomes same
        (*wash out idea may be original, then), sequene reversed


*/
