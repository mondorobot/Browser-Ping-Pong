
// helper function for binding an object with 
// a callback
function bind(scope, fn) {
  return function() {
    fn.apply(scope, arguments);
  }
}

// grab the canvas we are going to use and create
// the breakout game
var canvas = document.getElementById("breakout");
var breakout = new Breakout(canvas);

