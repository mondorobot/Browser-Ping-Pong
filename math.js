var Vector2 = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

Vector2.prototype = {
	x: 0,
	y: 0,
	
	clone: function() {
		return new Vector2(this.x, this.y);
	},
	
	add: function (v) {
		this.x += v.x;
		this.y += v.y;	
	},
	
	sub: function(v) {
		this.x -= v.x;
		this.y -= v.y;
	},
	
	dot: function(v) {
		return (this.x * v.x + this.y * v.y);
	},
	
	mult: function(scaler) {
		this.x *= scaler;
		this.y *= scaler;
	},
	
	magnitude: function() {
    return Math.sqrt(this.x*this.x, this.y*this.y);
	},
	
	length: function() {
	  // just another name for magnitude
    return this.magnitude();  
	},
	
	normalize: function() {
	  var mag = this.magnitude();
	  
	  if (mag !== 0) {
	    var invMag = 1/mag;
	    this.x * invMag;
	    this.y * invMag;
	  }
	}
}
