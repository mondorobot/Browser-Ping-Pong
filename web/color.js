var Color = function(r, g, b, a) {
  this.r = r || 0;
  this.g = g || 0;
  this.b = b || 0;
  this.a = a || 1;
}

Color.prototype = {
  r: 0, // 0-255
  g: 0, // 0-255
  b: 0, // 0-255
  a: 1, // 0-1 fraction
  
  toString: function() {
    return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
  }
},

Color.black = function() {
  return new Color(0, 0, 0);
};
  
Color.white = function() {
  return new Color(255, 255, 255);
};
  
Color.red = function() {
  return new Color(255, 0, 0);
};
  
Color.green = function() {
  return new Color(0, 255, 0);
};
  
Color.blue = function() {
  return new Color(0, 0, 255);
}
