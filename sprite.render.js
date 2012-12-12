var TextRenderer = function(text, strokeColor, fillColor, font) {
  this.text = text || undefined;
  this.font = font || 'Helvetica';
  this.strokeColor = strokeColor || Color.black();
  this.fillColor = fillColor || Color.black();
};

TextRenderer.prototype = {
  render: function(context, sprite, time) {
    if (this.text !== undefined) {
        context.save();
        context.lineWidth = 1;
        context.strokeStyle = this.strokeColor.toString();
        context.fillStyle = this.fillColor.toString();
        context.font = sprite.width + 'px ' + this.font;
        context.fillText(this.text, sprite.left, sprite.top);
        context.strokeText(this.text, sprite.left, sprite.top);
        context.restore();
      }
    }
};

var RectRenderer = function(strokeColor, roundedCornerSize, fillColor) {
  this.strokeColor = strokeColor || Color.black();
  this.roundedCornerSize = roundedCornerSize || undefined;
  this.fillColor = fillColor || undefined;
};

RectRenderer.prototype = {
  x: 0, 
  y: 0,
  width: 0, 
  height: 0,
  strokeColor: Color.black(),
  fillColor: Color.red(),
  roundedCornerSize: undefined,
  
  render: function(context, sprite, time) {
    this.x = sprite.left;
    this.y = sprite.top;
    this.width = sprite.width;
    this.height = sprite.height;
    
    context.save();
    context.beginPath();
    
    if (this.roundedCornerSize !== undefined) {
      context.lineJoin = 'round';
      context.lineWidth = this.roundedCornerSize;
    }
    
    if (this.fillColor !== undefined) {
      context.fillStyle = this.fillColor.toString();
      context.fillRect(this.x, this.y, this.width, this.height) 
    }
    
    context.strokeStyle = this.strokeColor.toString();
    context.strokeRect(this.x, this.y, this.width, this.height);
    
    context.restore();
  },
  
  getBounds : function() {
    return {left: this.x,
            top: this.y,
            width: this.width,
            height: this.height};
  }
}

var CircleRenderer = function(radius, strokeColor, fillColor) {
	this.radius = radius || 0;
	this.strokeColor = strokeColor || Color.blue();
	this.fillColor = fillColor || Color.blue();
}

CircleRenderer.prototype =  {
	x: 0,
	y: 0,
	radius: 0,
	strokeColor: Color.blue(),
	fillColor: Color.blue(),
	
	render: function(context, sprite, time) {
		this.x = sprite.left;
		this.y = sprite.top;
		
		context.save();
		context.beginPath();
		context.arc(sprite.left + sprite.width/2,
		             sprite.top + sprite.height/2,
		             this.radius, 0, Math.PI*2, false);
		context.clip();
		
		context.shadowColor = 'rgb(0,0,0)';
		context.shadowOffsetX = -4;
		context.shadowOffsetY = -4;
		context.shadowBlur = 8;
		
		context.lineWidth = 2;
		context.strokeStyle = this.strokeColor.toString();
		context.fillStyle = this.fillColor.toString();
		context.fill();
		context.stroke();
		context.restore();
	},
	
	getBounds : function() {
		return {left: this.x - this.radius,
						top: this.y - this.radius,
						width: this.radius*2,
						height: this.radius*2};
	}
};

function ImageRenderer(imageOrSrc, cells, animationTimeSeconds, loop) {
  if (typeof(imageOrSrc) === "string") {
    this.image = new Image();
    this.image.src = imageOrSrc;
  }
  else {
    this.image = imageOrSrc;
  }
  
	this.cells = cells || [];
	this.animationTimeMs = (animationTimeSeconds * 1000);
	this.x = 0;
	this.y = 0;
	this.timePerFrameMs = 0;
	
	this.loop = (loop !== undefined) ? loop : true;
	
	if (this.cells.length > 0 && this.animationTimeMs) {
	  this.timePerFrameMs = this.cells.length / this.animationTimeMs;
	}
};

ImageRenderer.prototype = {
	image: undefined,
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	animationTimeMs: 0,
	timePerFrameMs: 0,
	cells: [],
	animationStartTimeMs: undefined,
	lastTime: undefined,
	loop: true,
	done: false,
	
	render: function(context, sprite, time) {
		this.x = sprite.left;
		this.y = sprite.top;
		this.width = sprite.width;
		this.height = sprite.height;
		
		if (this.image !== undefined && this.image.complete) {
			if (!this.done) {
			  context.save();
  			if (this.cells.length > 0) {
  				// using a sprite sheet so grab the correct sub image
  				var cellNumber = 0;
  				var totalAnimationTime = time - this.animationStartTimeMs;
  				if (this.animationStartTimeMs !== undefined && totalAnimationTime < this.animationTimeMs) {
  					// calculate animation cell
  					cellNumber = Math.floor(totalAnimationTime * this.timePerFrameMs);
  				}
  				else {
  				  if (!this.loop && this.animationStartTimeMs !== undefined) {
  				    // done with one time animation loop
  				    // remove the sprite
  				    //sprite.layer.removeSprite(sprite);
  				    this.done = true;
  				    this.animationStartTimeMs = undefined;
  				    sprite.layer.removeQueue.push(sprite);
  				  }
  				  else {
  					 this.animationStartTimeMs = time;
  					}
  				}
  
  				context.drawImage(this.image, this.cells[cellNumber].x, 
  				                  this.cells[cellNumber].y, this.cells[cellNumber].width, 
  													this.cells[cellNumber].height, this.x, 
  													this.y, this.width, this.height);
  		  }
  			else {
  				context.drawImage(this.image, this.x, this.y, this.width, this.height);
  			}
        context.restore();
      
        this.lastTime = time;
      }
		}
	},
	
	getBounds: function() {
		return { left: this.x,
						 top: this.y,
						 width: this.width,
						 height: this.height }
	}
}

var NebulaRenderer = function(imageOrSrc) {
	this.offscreenCanvas1 = document.createElement('canvas');
	this.offscreenCanvas2 = document.createElement('canvas');
	
	if (typeof(imageOrSrc) === "string") {
    this.image = new Image();
    this.image.src = imageOrSrc;
  }
  else {
    this.image = imageOrSrc;
  }
    
  var Puff = function (p) {
    var opacity,
		sy = (Math.random() * 285) >> 0,
		sx = (Math.random() * 285) >> 0;

    this.p = p;

    this.move = function (timeFac, offscreenCanvas1, offscreenCanvas2, width, height) {
        p = this.p + 0.3 * timeFac;
        opacity = (Math.sin(p * 0.05) * 0.5);
        if (opacity < 0) {
            p = opacity = 0;
            sy = (Math.random() * 285) >> 0;
            sx = (Math.random() * 285) >> 0;
        }
        this.p = p;
        context = offscreenCanvas1.getContext('2d');
        context.globalAlpha = opacity;
        context.drawImage(offscreenCanvas2, sy + p, sy + p, 285 - (p * 2), 285 - (p * 2), 0, 0, offscreenCanvas1.width, offscreenCanvas1.height);
    };
  };
  
  this.puffs = [];
  this.sortPuff = function (p1, p2) { return p1.p - p2.p; };
  this.puffs.push(new Puff(0));
  this.puffs.push(new Puff(20));
  this.puffs.push(new Puff(40));
};

NebulaRenderer.prototype = {
	offscreenCanvas1: undefined,
	offscreenCanvas2: undefined,
	lastTimeMs: undefined,
	drawImageOnce: false,
	
	render: function(context, sprite, time) {
		if (this.image !== undefined && this.image.complete) {
			if (!this.drawImageOnce) {
				this.offscreenCanvas1.width = this.offscreenCanvas2.width = sprite.width;
				this.offscreenCanvas1.height = this.offscreenCanvas2.height = sprite.height;
				this.offscreenCanvas2.getContext("2d").drawImage(this.image, sprite.left, sprite.top, sprite.width, sprite.height);
				this.drawImageOnce = true;
			}
	    if (this.lastTimeMs === undefined) {
	        this.lastTimeMs = time;
	    }
	    timeFac = (time - this.lastTimeMs) * 0.1;
	    if (timeFac > 3) { timeFac = 3; }
	    this.lastTimeMs = time;
	    this.puffs.sort(this.sortPuff);
	
	    for (var i = 0; i < this.puffs.length; i++) {
	    	this.puffs[i].move(timeFac, this.offscreenCanvas1, this.offscreenCanvas2);
	    }

			context.save();
	    context.drawImage(this.offscreenCanvas1, sprite.left, sprite.top, sprite.width, sprite.height);
	    context.restore();
		}
	}
};

