
// helper function that converts coordinates in window space
// to coordinates in canvas space for the passed in canvas
function windowToCavasCoordinates(canvas, x, y) {
  var boundingBox = canvas.getBoundingClientRect();

  return {x: x - boundingBox.left * (canvas.width / boundingBox.width),
          y: y - boundingBox.top * (canvas.height / boundingBox.height)};
}

var InputHandler = function(canvas) {
	this.canvas = canvas;
	
  // attach listeners
  
  this.addEvent(window, 'click', this.handleMouseClick);
  this.addEvent(window, 'mousedown', this.handleMouseDown);
  this.addEvent(window, 'mouseup', this.handleMouseUp);
  this.addEvent(window, 'mousemove', this.handleMouseMove);
  this.addEvent(canvas, 'mouseover', this.handleMouseOver);
  this.addEvent(canvas, 'mouseout', this.handleMouseOut);

}

InputHandler.prototype = {
	canvas: undefined,
  mouseCoords: {x: 0, y: 0},
  inActiveArea: false,
  activeButton: undefined,
  clickButton: undefined,
  
  addEvent: function(element, eventType, fn, self) {
    // bind the function to the callback
    // to get our InputHandler in scope
    var callbackFn = bind(self || this, fn)
    
    // handle all the different ways to add
    // a listener
    if (element.addEventListener) {
      element.addEventListener(eventType, callbackFn, false);
    }
    else if (element.attachEvent) {
      element.attachEvent('on'+eventType, callbackFn);
    }
    else {
      element['on'+eventType] = callbackFn;
    }
  },
  
  handleMouseClick: function(e) {
    this.mouseCoords = windowToCavasCoordinates(canvas, e.clientX, e.clientY);
    this.clickButton = this.getMouseButton(e);
    console.log("mouse click: (" + this.mouseCoords.x + ", " + this.mouseCoords.y + ")");
    e.preventDefault();
    e.stopPropagation();
    return false;
  },
  
  handleMouseDown: function(e) {
    this.mouseCoords = windowToCavasCoordinates(canvas, e.clientX, e.clientY);
    this.activeButton = this.getMouseButton(e);
    
    e.preventDefault();
    e.stopPropagation();
    return false;
  },
  
  handleMouseUp: function(e) {
    this.mouseCoords = windowToCavasCoordinates(canvas, e.clientX, e.clientY);
    this.activeButton = undefined;
  },
  
  handleMouseMove: function(e) {
    this.mouseCoords = windowToCavasCoordinates(canvas, e.clientX, e.clientY);
  },
  
  handleMouseOver: function(e) {
    this.mouseCoords = windowToCavasCoordinates(canvas, e.clientX, e.clientY);
    this.inActiveArea = true;
  },
  
  handleMouseOut: function(e) {
    this.mouseCoords = windowToCavasCoordinates(canvas, e.clientX, e.clientY);
    this.inActiveArea = false;
  },
  
  getMouseButton: function(e) {
    var button = undefined;
    if (e.which == null) {
       // special case for IE when event.which is not defined
       button = (e.button < 2) ? "LEFT" : ((e.button == 4) ? "MIDDLE" : "RIGHT");
    }
    else {
       // normal case
       button = (e.which < 2) ? "LEFT" : ((e.which == 2) ? "MIDDLE" : "RIGHT");
    }
    
    return button;
  },
  // The state gets cleared after a rending pass completes. 
  // This allows us to do single clicks at random times.
  clearState: function()
  {
      this.clickButton = undefined;
  }
};