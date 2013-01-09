$(function () {
    var canvas, context, button;
    
    canvas = $("#mooCow")[0];
    context = canvas.getContext("2d");
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    button = new Button(canvas, 10, 10, "More Cowbell", function(){
        context.beginPath();
        context.arc(Math.random() * canvas.width, Math.random() * canvas.height, 5 + Math.random() * 15, 0, Math.PI * 2, false);
        context.fillStyle = "#FFF"; 
        context.fill();


       
       
        var myScale = Math.random()*300+50;
        var posX = Math.random()*canvas.width;
        var posY = Math.random()*canvas.height;
        var imageObj = new Image();
        imageObj.onload = function() {
            context.drawImage(imageObj, posX, posY, myScale, myScale);
        
        };
        imageObj.src = 'MR_White.png';


    }); // End button 

    
    $("#mooCow").mousedown(function(event) {
        button.checkMouseDown(event.pageX - this.offsetLeft, event.pageY - this.offsetTop);
    });
    $("#mooCow").mouseup(function(event) {
        button.checkMouseUp(event.pageX - this.offsetLeft, event.pageY - this.offsetTop);
    });
    $("#mooCow").mousemove(function(event) {
        button.checkMouseMove(event.pageX - this.offsetLeft, event.pageY - this.offsetTop);
    });

});




// Creating the Button //////////////////////////////////////////////////////////

function Button(canvas, x, y, label, onclick) {
    this.canvas = canvas;
    this.context = this.canvas.getContext("2d");
    this.x = x;
    this.y = y;
    this.label = label;
    this.onclick = onclick;
    this.width = 100;
    this.height = 22;
    this.state = "up";
    this.borderColor = "#999999";
    this.upColor = "#FFF";
    this.overColor = "#CCC";
    this.downColor = "#aaaaaa";
    this.draw();
}

Button.prototype.draw = function() {
    // draw border
    this.context.fillStyle = this.borderColor;
    this.context.fillRect(this.x, this.y, this.width, this.height);
    
    // draw face
    if(this.state == "over") {
        this.context.fillStyle = this.overColor;
    }
    else if(this.state == "down") {
        this.context.fillStyle = this.downColor;
    }
    else {
        this.context.fillStyle = this.upColor;
    }
    this.context.fillRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2);
    
    // draw label
    this.context.font = "12px Arial";
    this.context.fillStyle = "#000000";
    this.context.fillText(this.label, this.x + (this.width - this.context.measureText(this.label).width) / 2, this.y + (this.height + 9) / 2);
};

Button.prototype.checkMouseDown = function(x, y) {
    if(x > this.x && x < this.x + this.width &&
       y > this.y && y < this.y + this.height) {
        this.state = "down";
    }
    else {
        this.state = "up";
    }
    this.draw();
};

Button.prototype.checkMouseUp = function(x, y) {
    if(x > this.x && x < this.x + this.width &&
       y > this.y && y < this.y + this.height) {
        this.state = "over";
        if(this.onclick != null) {
            this.onclick();
        }
    }
    else {
        this.state = "up";
    }
    this.draw();
};

Button.prototype.checkMouseMove = function(x, y) {
    if(x > this.x && x < this.x + this.width &&
       y > this.y && y < this.y + this.height) {
        this.state = "over";
    }
    else {
        this.state = "up";
    }
    this.draw();
};