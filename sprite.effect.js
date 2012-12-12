var VelocityEffect = function(xPixelsPerSecond, yPixelsPerSecond) {
	this.xPixelsPerSecond = xPixelsPerSecond;
	this.yPixelsPerSecond = yPixelsPerSecond;
};
	
VelocityEffect.prototype = {
	lastTime: undefined,
	xPixelsPerSecond: 0,
	yPixelsPerSecond: 0,
	secondPerMillisecond: 0.001,
	
	update: function(context, sprite, time) {
		if (this.lastTime !== undefined) {
			sprite.left += sprite.velocity.x * ((time - this.lastTime));
			sprite.top += sprite.velocity.y * ((time - this.lastTime));
		}
		else {
			sprite.velocity.x = this.xPixelsPerSecond * this.secondPerMillisecond;
			sprite.velocity.y = this.yPixelsPerSecond * this.secondPerMillisecond;
		}
		
		this.lastTime = time;
	}
};

var BoundedVelocityEffect = function(xPixelsPerSecond, yPixelsPerSecond) {
	this.xPixelsPerSecond = xPixelsPerSecond;
	this.yPixelsPerSecond = yPixelsPerSecond;
};
	
BoundedVelocityEffect.prototype = {
	lastTime: undefined,
	xPixelsPerSecond: 0,
	yPixelsPerSecond: 0,
	xMultiplier: 1,
	yMultiplier: 1,
	secondPerMillisecond: .001,
	
	update: function(context, sprite, time) {

		if (this.lastTime == undefined) {
			sprite.velocity.x = this.xPixelsPerSecond * this.secondPerMillisecond;
			sprite.velocity.y = this.yPixelsPerSecond * this.secondPerMillisecond;
		}
		else {
			var bounds = sprite.getBounds();
			if (bounds) {
				if (bounds.left+bounds.width >= context.canvas.width ||
				    bounds.left <= 0) {
					sprite.velocity.x *= -1;
				}
				
				if (sprite.top+bounds.height >= context.canvas.height ||
				    sprite.top <= 0) {
					sprite.velocity.y *= -1;
				}
			}

			sprite.left += sprite.velocity.x * ((time - this.lastTime));
			sprite.top += sprite.velocity.y * ((time - this.lastTime));
		}
		
		this.lastTime = time;
	}
};

var MouseFollowerEffect = function(inputHandler, bounds) {
  this.inputHandler = inputHandler;
  this.bounds = bounds || undefined;
}

MouseFollowerEffect.prototype = {
  update: function(context, sprite, time) {
    if (this.bounds !== undefined) {
      var x = this.inputHandler.mouseCoords.x;
      var y = this.inputHandler.mouseCoords.y;

      if (x + sprite.width > this.bounds.width) {
        sprite.left = this.bounds.width - sprite.width;
      }
      else if (x < this.bounds.x) {
        sprite.left = this.bounds.x;
      }
      else {
        sprite.left = this.inputHandler.mouseCoords.x;
      }
      
      if (y + sprite.height > this.bounds.height) {
        sprite.top = this.bounds.height - sprite.height;
      }
      else if (y < this.bounds.y) {
        sprite.top = this.bounds.y;
      }
      else {
        sprite.top = this.inputHandler.mouseCoords.y;
      }
    }
    else {
      this.bounds = {x: 0,
                     y: 0,
                     width: context.canvas.width,
                     height: context.canvas.height};
    }
  }
}

var MouseDragEffect = function(inputHandler, buttonTrigger, bounds) {
  this.inputHandler = inputHandler;
  this.buttonTrigger = buttonTrigger;
  this.bounds = bounds || undefined;
}

MouseDragEffect.prototype = {
  update: function(context, sprite, time) {
    if (this.buttonTrigger == this.inputHandler.activeButton) {
      if (this.bounds !== undefined) {
        var x = this.inputHandler.mouseCoords.x;
        var y = this.inputHandler.mouseCoords.y;
  
        if (x + sprite.width > this.bounds.width) {
          sprite.left = this.bounds.width - sprite.width;
        }
        else if (x < this.bounds.x) {
          sprite.left = this.bounds.x;
        }
        else {
          sprite.left = this.inputHandler.mouseCoords.x;
        }
        
        if (y + sprite.height > this.bounds.height) {
          sprite.top = this.bounds.height - sprite.height;
        }
        else if (y < this.bounds.y) {
          sprite.top = this.bounds.y;
        }
        else {
          sprite.top = this.inputHandler.mouseCoords.y;
        }
      }
      else {
        this.bounds = {x: 0,
                       y: 0,
                       width: context.canvas.width,
                       height: context.canvas.height};
      }
    }
  }
};

var MousePlacementEffect = function(inputHandler) {
  this.inputHandler = inputHandler;
  this.inputHandler.addEvent(window, 'mousedown', this.placeSprite, this);
}

MousePlacementEffect.prototype = {
  sprite: undefined,
  
  update: function(context, sprite, time) {
    this.sprite = sprite;
  },
  
  placeSprite: function() {
    if (this.sprite !== undefined && this.inputHandler.inActiveArea) {
      this.sprite.left = this.inputHandler.mouseCoords.x;
      this.sprite.top = this.inputHandler.mouseCoords.y;
    }
  }
}

var MouseActionEffect = function(inputHandler, buttonTrigger, callbackFn, bounds) {
  this.inputHandler = inputHandler;
  this.buttonTrigger = buttonTrigger;
  this.callbackFn = callbackFn || undefined;
}

MouseActionEffect.prototype = {
  update: function(context, sprite, time) {
    if (this.callbackFn !== undefined && this.buttonTrigger == this.inputHandler.activeButton) {
      if (this.bounds !== undefined) {
        var x = this.inputHandler.mouseCoords.x;
        var y = this.inputHandler.mouseCoords.y;
        if (x + sprite.width <= this.bounds.width && x >= this.bounds.x &&
            y + sprite.height <= this.bounds.height && y >= this.bounds.y) {
          this.callbackFn(context, sprite, time, this.inputHandler.mouseCoords);
        }
      }
      else if (this.inputHandler.inActiveArea) {
        this.callbackFn(context, sprite, time, this.inputHandler.mouseCoords);
      }
    }
  }
};

var FollowLeaderEffect = function(leader, xOffset, yOffset) {
  this.leader = leader || undefined;
  this.xOffset = xOffset || 0;
  this.yOffset = yOffset || 0;
}

FollowLeaderEffect.prototype = {
  leader: undefined,
  xOffset: 0,
  yOffset: 0,
  
  update: function(context, sprite, time) {
    if (this.leader !== undefined) {
      sprite.left = this.leader.left + this.xOffset;
      sprite.top = this.leader.top + this.yOffset;
    }
  }
};

var ColliderEffect = function(colliders, callbackFn, stopAfterCollision) {
	this.colliders = colliders || [];
	this.callbackFn = callbackFn || undefined;
	this.stopAfterCollision = stopAfterCollision || true;
};

ColliderEffect.prototype = {
	update: function(context, sprite, time) {
	  if (this.callbackFn !== undefined) {
  		var collisionList = []
  		var spriteBounds = sprite.getBounds();
  		var spriteRight = sprite.left + sprite.width;
  		var spriteBottom = sprite.top + sprite.height;
  
  		for (var i=0; i < this.colliders.length; ++i) {
  		  if (this.colliders[i] !== sprite) {
    			var colliderBounds = this.colliders[i].getBounds();
    			var colliderRight = colliderBounds.left+colliderBounds.width;
    			var colliderBottom = colliderBounds.top+colliderBounds.height;
          
          // check for collision between sprite and each collider
          if (spriteRight > colliderBounds.left && sprite.left < colliderRight &&
              spriteBottom > colliderBounds.top && sprite.top < colliderBottom) {
            collisionList.push(this.colliders[i]);
            if (this.stopAfterCollision) {
              break;
            }
          }
        }
  		}
  		
  		for (var i=0, len=collisionList.length; i < len; ++i) {
  		  this.callbackFn(sprite, collisionList[i]);
  		}
  	}
	}
};

var ColorChangerEffect = function(colors, speed, frameTime) {
	this.colors = colors || [];
	this.increment = speed || 2;
	this.phaseIndex = 0;
	this.clampUpper = 255;
  this.clampLower = 0;
  this.color = { R: this.clampLower, G: this.clampLower, B: this.clampLower };
}

ColorChangerEffect.prototype = {
	colors: [],
	increment: 2,
	phaseIndex: 0,
	clampUpper: 255,
	clampLower: 0,
	color: { R: this.clampLower, G: this.clampLower, B: this.clampLower },
	
	update: function(context, sprite, time) {
		context.save();
		this.increment_color();
		
		sprite.renderer.strokeColor = new Color(this.color.R, this.color.G, this.color.B);
		sprite.renderer.fillColor = new Color(this.color.R, this.colorG, this.colorB);
	},
	
	clamp: function(value, upper, lower) {
	    if (value > upper) {
	        return { value: upper, limit: true };
	    } else if (value < lower) {
	        return { value: lower, limit: true };
	    }
	
	    return { value: value, limit: false };
   },

   increment_color: function() {
     var phase = this.colors[this.phaseIndex % this.colors.length];

     var result = this.clamp(this.color[phase[0]] + (phase[1] == '-' ? this.increment * -1 : this.increment), this.clampUpper, this.clampLower);
     this.color[phase[0]] = result.value;

     if (result.limit)
     	this.phaseIndex++;
   }
}
