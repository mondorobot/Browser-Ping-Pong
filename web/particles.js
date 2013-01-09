var particles = function (canvas) {
	this.context = canvas.getContext('2d');
    this.particles = new Array();
    
    this.add_particle = function (x,y){
        var xSign = (x - (document.body.offsetWidth/ 2)) / Math.abs(x - (document.body.offsetWidth/ 2));
        var ySign = (y - (document.body.offsetHeight/ 2)) / Math.abs(y - (document.body.offsetHeight/ 2));
        var xStrength = Math.min(256,Math.max(5,(Math.abs(x - document.body.offsetWidth/ 2))));
        var yStrength = Math.min(256,Math.max(5,(Math.abs(y - document.body.offsetHeight/ 2))));
//        console.log('x: '+xSign+' '+xStrength+' y: '+ySign+' '+yStrength);
        this.particles.push({x: xSign * xStrength, y: ySign*yStrength, size: 10, opacity: 256});
        this.update_particles();
    }
 
    this.drawParts = function() {     
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0 ,0 , this.context.canvas.width , this.context.canvas.height );
        this.context.restore();
        
        for (var i in this.particles) {
            this.context.beginPath();
            this.context.moveTo(256+ (this.particles[i].x / 2),256+(this.particles[i].y / 2));
            this.context.lineTo(256+ this.particles[i].x,256+this.particles[i].y);
            
            this.context.strokeStyle="#888800";
            this.context.stroke();
        }
    }    
        
    this.update_particles = function() {
        var updatedArray = new Array();
        for (var i in this.particles) {
            this.particles[i].x *= 1.1;
            this.particles[i].y *= 1.1;
            this.particles[i].size *= 1.1;
            if (this.particles[i].size < 50) {
                updatedArray.push(this.particles[i]);
            }
            
        }
        this.particles = updatedArray;
        this.drawParts();
//        console.log("remaining: " + this.particles.length);
        self = this;
        if (this.particles.length > 0) window.setTimeout(function(){self.update_particles()},100);
    }
        
}
