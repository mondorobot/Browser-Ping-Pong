var canvas = document.getElementById('mondorobot');
var under = document.getElementById('underlay');

var update = function (clock,parts) {
    window.setTimeout(function () {
        clock.step();
        update(clock);
    }, 1);
};

var img = new Image();
img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;

    update(new ColorClock(canvas, img),parts);
};
img.src = 'MR.png';
var parts =  new particles(under);

getVector = function(coordStart,coordEnd) {
    return ({x:(coordEnd.x - coordStart.x), y: (coordEnd.y - coordStart.y)});
}
getStrongestVectorValue = function(vec2) {
    if (Math.abs(vec2.x) > Math.abs(vec2.y)) {
        return vec2.x;
    } 
    return vec2.y;
}
    
getDistanceFromElementCenter = function(coord, element) {
    var x = coord.x - (element.offsetLeft + element.offsetWidth / 2);
    var y = coord.y - (element.offsetTop + element.offsetHeight / 2);
    return({x: x, y: y});
}

under.onmousemove = function(event) {
    //had a few cross browser issues, not sure this was necessary tho
    if (window.event) {
      parts.add_particle(window.event.clientX,window.event.clientY);
    } else {
      parts.add_particle(event.clientX,event.clientY);
    }
}
