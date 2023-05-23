const dPx = 10; //TODO: change these to optional parameters in animateTitle
const dT = 400;
const colors = ["fc3636","fc6836","fc9936","fff200","3feb4e","36fcfc",
"35a3fc","3668fc","6836fc","9c90fd","ca36fc","eb90fd"]; // Pastel rainbow
const defColor = "cc87b0";

/* TITLE ANIMATION PLUGIN */
/* Params
    action:     specifies animation type
    brChange:   [opt] change in font size in pixels
    brDelay:    [opt] delay in ms between expansion/deflation of text
    waveIters:  [opt] number of color shifts in wave color animation
    waveDelay:   [opt] delay in ms per color shift
    isOut:      [opt] does color wave continue out (true) or not (false)
*/
(function($) {
  $.fn.animateTitle = function(action, wavIters, wavDelay, wavIsOut) {
    if (action === "breathe") {
      $(this).animate({"fontSize": "+="+dPx+"px"}, dT, function() {
        $(this).animate({"fontSize": "+="+(-1*dPx)+"px"}, dT);
        $(this).animateTitle("breathe");
      });
    }
    if (action === "clrWave") {
      var iters = wavIters;
      var delay = wavDelay;
      var isOut = wavIsOut;
      if (iters === undefined) {iters = 8;}
      if (delay === undefined) {delay = 100;}
      if (isOut === undefined) {isOut = false;}
      $(this).click(function () {colorWaveIn($(this), 0, iters, delay, isOut);});
    }
    return this;
  };
}(jQuery));

/* WAVE ANIMATION HELPER FUNCTION */
/* works with: any size string, any number of colors, any number of iters, at any speed*/
function colorWaveIn(thisObj, curr_idx, iters, delay, isOut) {
  var i;
  var title = $(thisObj).text();
  var baseCase = iters + title.length; // Iters expended + title.length more to cycle out the colors.
  if (curr_idx === baseCase) { // Base case 1. Assume colorWaveOut done.
    console.log("Stopped at BC1");
    return -1;
  }
  else {
    if (curr_idx === iters && !isOut) {
      console.log("Stopped at BC2");
      return -1;
    }
    var titleMod = title.substring(0,curr_idx+1); //beginning substr to mod
    //when curr_idx+1 > title length, titleMod is just ALL of title, as intended
    var titleTemp = title.slice(curr_idx+1); //remaining substr of title to append to
    // Each iteration, changes the colors from the back to the front of
    // target substring (i.e. the first 2 characers in the 2nd iter),
    // appends to end start of title string, show it, repeat.
    for (i=0; i<=curr_idx; i++) {
      //console.log(curr_idx);
      var currChar = titleMod.charAt(curr_idx-i); // Start at end of target substring.
      var newColor = colors[i%colors.length];
      //console.log(currChar);
      // Only satisfied if iterations continue -> change color to default: waveOut.
      //console.log(curr_idx - iters)
      if (i >= iters) { // THIS IS COOL !!! //
        newColor = defColor;
      }
      currChar = currChar.fontcolor(newColor);
      titleTemp = currChar + titleTemp;
    }
    // Show new text
    thisObj.html(titleTemp);
    setTimeout(function(){colorWaveIn($(thisObj),(curr_idx+1),iters,delay,isOut)}, delay);
   }
 }

 $("h1").animateTitle("clrWave", 14, 70, true);
