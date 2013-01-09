var Layer = function(scene, name, sprites) {
	this.scene = scene;
	this.name = name || "";
	this.sprites = 	sprites || [];
};

Layer.prototype = {
  scene: undefined,
  name: "",
  sprites: [],
  removeQueue: [],
  
	addSprite: function(sprite) {
		sprite.layer = this;
		this.sprites.push(sprite);	
	},
	
	removeSprite: function(sprite) {
	   this.sprites.splice(this.sprites.indexOf(sprite), 1);
	},
	
	removeQueuedSprites: function() {
	  // remove any sprites queued for deletion
    for (var i=0; i < this.removeQueue.length; ++i) {
      this.removeSprite(this.removeQueue[i]);  
    }
    this.removeQueue = [];
	},
	
	removeAllSprites: function() {
	 this.sprites = [];  
	},
	
	getSprite: function(name) {
  	for (var i=0; i < this.sprites.length; ++i) {
  	  if (this.sprites[i].name == name) {
  	    return this.sprites[i];
  	  }
  	}
  	 
  	return null;
	},
	
	update: function(context, time) {  
		var numSprites = this.sprites.length;
			
		// update every sprite before rendering
		for (var i=0; i < numSprites; ++i) {
			this.sprites[i].update(context, time);
		}
	},
	
	render: function(context, time) {
		var numSprites = this.sprites.length;
		
		// render each sprite
		for (var i=0; i < numSprites; ++i) {
			this.sprites[i].render(context, time);
		}
	}
}

var Scene = function(name, context, inputHandler) {
	this.name = name || "";
	this.layers = [];
	this.context = context;
        this.inputHandler = inputHandler;
};

Scene.prototype = {
    isRunning: false,
    
    start: function() {
    // call our portable animation loop method
    // which wraps requestAnimationFrame when available
    // this method starts kicks off the app
    this.isRunning = true;
    window.requestNextAnimationFrame(bind(this, this.render));  
    },
    
    addLayer: function(name, sprites, context) {
            if (name == "") {
                    name = "Layer" + this.layers.length;
            }

            this.layers.push(new Layer(this, name, sprites, context));
    },

    addSpriteToLayer: function(layerName, sprite) {
            for (var i=0, len=this.layers.length; i < len; ++i) {
                    if (this.layers[i].name == layerName)	{
                            this.layers[i].addSprite(sprite);
                    }
            }

            return undefined;
    },

    getLayer: function(layerName) {
            for (var i=0, len=this.layers.length; i < len; ++i) {
                    if (this.layers[i].name == layerName)	{
                            return this.layers[i];
                    }
            }

            return undefined;
    },

    render: function(time) {
        if(this.isRunning == true)
        {
            this.context.clearRect(0, 0, canvas.width, canvas.height);

            var numLayers = this.layers.length;
            for  (var i=0; i < numLayers; ++i) {
                    this.layers[i].update(this.context, time);
            }

            for  (var i=0; i < numLayers; ++i) {
                    this.layers[i].render(this.context, time);
            }

            for (var i=0; i < numLayers; ++i) {
                this.layers[i].removeQueuedSprites();
            }
    
            inputHandler.clearState();
            
            // call our portable animation loop method
            // which wraps requestAnimationFrame when available
            window.requestNextAnimationFrame(bind(this, this.render));
        }
    },
    
    stop: function()
    {
        this.isRunning = false;
    }
}