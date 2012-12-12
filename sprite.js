var Sprite = function(name, renderer, effects, left, top, width, height) {
	this.name = name;
	this.left = left || 0;
	this.top = top || 0;
	this.width = width || 20;
	this.height = height || 20;
	this.velocity = new Vector2();
	this.renderer = renderer || undefined;
	this.effects = effects || [];
};

Sprite.prototype = {
	layer: undefined,
	name: '',
	left: 0,
	top: 0,
	width: 20,
	height: 20,
	velocity: new Vector2(),
	renderer: undefined,
	effects: [],
	
	render: function(context, time) {
		if (this.renderer && this.renderer !== undefined) {
			this.renderer.render(context, this, time);
		}
	},
	
	update: function(context, time) {
		for (var i=0, len = this.effects.length; i < len; ++i) {
		  if (this.effects[i] !== undefined) {
			 this.effects[i].update(context, this, time);
		  }
		}
	},
	
	addEffect: function(effect) {
		this.effects.push(effect);
	},
	
	clearEffects: function() {
	  this.effects = [];
	},
	
	getBounds: function() {
		if (this.renderer) {
			return this.renderer.getBounds();
		}
	},
};


