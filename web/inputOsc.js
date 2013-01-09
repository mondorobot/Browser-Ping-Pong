/* 
 * Rick Boykin
 */

InputHandler.prototype.osc_lib = LibOSC.getInstance();
InputHandler.prototype.oscUri = "ws://192.168.4.191:7001/";

InputHandler.prototype.normailzedToCanvasCoord = function(x, y)
{
    var boundingBox = this.canvas.getBoundingClientRect();
    return {x:x * boundingBox.width, y:y * boundingBox.height};
}

InputHandler.prototype.oscOpenController = function(url)
{
    this.oscUri = url;
    this.openWebSocket();
}
            
InputHandler.prototype.openWebSocket = function()
{ 
    var $this = this;
    this.websocket = new WebSocket(this.oscUri); 
    this.websocket.binaryType = "arraybuffer"; 
    this.websocket.onopen = function(evt) { $this.socketOnOpen(evt) };
    this.websocket.onclose = function(evt) { $this.socketOnClose(evt) }; 
    this.websocket.onmessage = function(evt) { $this.socketOnMessage(evt) }; 
    this.websocket.onerror = function(evt) { $this.socketOnError(evt) }; 
}  

InputHandler.prototype.socketOnOpen = function(evt) { console.log("connection opened."); this.websocket.send("mondo rocks"); }  

InputHandler.prototype.socketOnClose = function(evt) { console.warn("connection closed"); }  

InputHandler.prototype.socketOnMessage = function(evt) 
{ 
    var osc_data_view = new DataView(evt.data);
    var message = this.osc_lib.parseOSCMsg(osc_data_view);
    var x, y;
    
    if(message.address == "/bo/b1/t") // tap (like a mouse down and up)
    {
        x = message.values[0];
        y = message.values[1];

        this.mouseCoords = this.normailzedToCanvasCoord(x, y);
        this.clickButton = "LEFT";
        this.inActiveArea = true;
        
        console.log("Message address: " + message.address + " (" + this.mouseCoords.x + ", " + this.mouseCoords.y + ")");
    }
    else if(message.address == "/bo/b1/s") // start (like a nouse down)
    {
        x = message.values[0];
        y = message.values[1];

        this.oscPosition = this.normailzedToCanvasCoord(x, y);
        this.inActiveArea = true;
        
        //console.log("Message address: " + message.address + " (" + this.mouseCoords.x + ", " + this.mouseCoords.y + ")");
    }
    else if(message.address == "/bo/b1/c") // change (like a nouse move)
    {
        x = message.values[0];
        y = message.values[1];
        var position = this.normailzedToCanvasCoord(x, y);
        
        this.mouseCoords = {x:this.mouseCoords.x + (position.x - this.oscPosition.x) * 1.5, y:this.mouseCoords.y + (position.y - this.oscPosition.y) * 1.5};
        //this.mouseCoords = this.normailzedToCanvasCoord(x, y);
        this.oscPosition = position;
        
        //console.log("Message address: " + message.address + " (" + this.mouseCoords.x + ", " + this.mouseCoords.y + ")");
    }
    if(message.address == "/bo/b1/e") // end (like a nouse up)
    {
        x = message.values[0];
        y = message.values[1];
        //console.log("Message address: " + message.address + " (" + this.mouseCoords.x + ", " + this.mouseCoords.y + ")");
    }
}

InputHandler.prototype.socketOnError = function(evt) { console.error(evt.data); }
